import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from 'zod';
import {prisma} from "../../lib/prisma";
import {BadRequest} from "../_errors/bad-request";

import {sendEmailService} from "../../utils/send-email"

export async function subscribeUserEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/subscribe', {
            schema: {
                summary: 'Inscrever usuário em evento',
                tags: ['Inscrição'],
                body: z.object({
                    userId: z.string().uuid(),
                    eventId: z.string().uuid(),
                }),
                response: {
                    201: z.object({
                        message: z.string(),
                    }),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const {userId, eventId} = request.body;

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            if (!user) {
                throw new BadRequest('Usuário não encontrado.');
            }

            const event = await prisma.event.findUnique({
                where: {
                    id: eventId,
                },
            });

            if (!event) {
                throw new BadRequest('Evento não encontrado.');
            }

            const existingSubscription = await prisma.subscription.findFirst({
                where: {
                    userId: userId,
                    eventId: eventId,
                },
            });

            if (existingSubscription) {
                throw new BadRequest('O usuário já está inscrito neste evento.');
            }

            await prisma.subscription.create({
                data: {
                    userId: userId,
                    eventId: eventId,
                },
            });

            // Enviar e-mail de confirmação
            try {
                const formattedDateTime = dateTimeFormat.format(new Date(event.dateTime));
                await sendEmailService({
                    to: user.email,
                    subject: `Confirmação de Inscrição ${event.title} - Events Full`,
                    html: `
                        <p>Olá ${user.name},</p>
                        <p>Você foi inscrito no evento ${event.title} que acontecerá em ${formattedDateTime}.</p>
                        <p>Atenciosamente,</p>
                        <p>Events Full</p>
                    `,
                });
            } catch (error) {
                console.error('Erro ao enviar e-mail de confirmação:', error);
            }

            return reply.status(201).send({message: 'Usuário inscrito no evento com sucesso.'});
        });
}

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'America/Sao_Paulo'
});
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {ZodTypeProvider} from "fastify-type-provider-zod";
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import {BadRequest} from "./_errors/bad-request";

import {sendEmail} from "../utils/sendEmail"

const prisma = new PrismaClient();

export async function subscribeUserEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/subscribe', {
            schema: {
                summary: 'Inscrever usuário em evento',
                tags: ['inscrições'],
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
            const { userId, eventId } = request.body;

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

            // Inscrever o usuário no evento
            await prisma.subscription.create({
                data: {
                    userId: userId,
                    eventId: eventId,
                },
            });

            // Enviar e-mail de confirmação
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Confirmação de Inscrição',
                    html: `
                        <p>Olá ${user.name},</p>
                        <p>Você foi inscrito no evento ${event.title} que acontecerá em ${event.dateTime}.</p>
                        <p>Atenciosamente,</p>
                        <p>Events Full</p>
                    `,
                });
            } catch (error) {
                // Se ocorrer um erro ao enviar o e-mail, trate conforme necessário
                console.error('Erro ao enviar e-mail de confirmação:', error);
            }

            return reply.status(201).send({ message: 'Usuário inscrito no evento com sucesso.' });
        });
}

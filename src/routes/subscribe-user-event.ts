import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

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
        }, async (request, reply) => {
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

            return reply.status(201).send({ message: 'Usuário inscrito no evento com sucesso.' });
        });
}

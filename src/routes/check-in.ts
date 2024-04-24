import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {BadRequest} from "./_errors/bad-request";

export async function checkIn(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/checkin', {
            schema: {
                summary: 'Registrar presença em evento',
                tags: ['Check-In'],
                body: z.object({
                    eventId: z.string().uuid(),
                    userId: z.string().uuid(),
                }),
                response: {
                    201: z.object({
                        message: z.string(),
                    }),
                },
            },
        }, async (request, reply) => {
            const { eventId, userId } = request.body;

            const event = await prisma.event.findUnique({
                where: {
                    id: eventId,
                },
            });

            if (!event) {
                throw new BadRequest('Evento não encontrado.');
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            if (!user) {
                throw new BadRequest('Usuário não encontrado.');
            }

            const existingCheckIn = await prisma.checkIn.findFirst({
                where: {
                    eventId: eventId,
                    participantId: userId,
                },
            });

            if (existingCheckIn) {
                throw new BadRequest('O usuário já realizou o check-in neste evento.');
            }

            // Registrar o check-in do usuário no evento
            await prisma.checkIn.create({
                data: {
                    eventId: eventId,
                    participantId: userId,
                    dateTime: new Date(),
                },
            });

            return reply.status(201).send({ message: 'Presença registrada com sucesso.' });
        });
}

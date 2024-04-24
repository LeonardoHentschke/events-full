import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import {BadRequest} from "../_errors/bad-request";

export async function listCheckIn(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/:eventId/checkins', {
            schema: {
                summary: 'Listar check-ins em um evento',
                tags: ['Check-In'],
                params: z.object({
                    eventId: z.string().uuid(),
                }),
                response: {
                    200: z.array(
                        z.object({
                            id: z.string().uuid(),
                            eventId: z.string().uuid(),
                            participantId: z.string().uuid(),
                            participantName: z.string(),
                            dateTime: z.date(),
                        })
                    ),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const { eventId } = request.params;

            const event = await prisma.event.findUnique({
                where: {
                    id: eventId,
                },
                include: {
                    checkIns: {
                        include: {
                            participant: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!event) {
                throw new BadRequest('Evento não encontrado.');
            }

            const checkIns = event.checkIns.map(checkIn => ({
                id: checkIn.id,
                eventId: checkIn.eventId,
                participantId: checkIn.participantId,
                participantName: checkIn.participant.name,
                dateTime: checkIn.dateTime,
            }));

            return reply.status(200).send(checkIns);
        });
}

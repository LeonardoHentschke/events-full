import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../_errors/bad-request";

export async function listEvents(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/events', {
            schema: {
                summary: 'Listar eventos',
                tags: ['Evento'],
                response: {
                    200: z.array(
                        z.object({
                            id: z.string().uuid(),
                            title: z.string(),
                            details: z.string(),
                            slug: z.string(),
                            maximumAttendees: z.number().nullable(),
                            dateTime: z.date(),
                        })
                    ),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const events = await prisma.event.findMany();
                return reply.status(200).send(events);
            } catch (error) {
                console.error('Erro ao listar eventos:', error);
                throw new BadRequest('Ocorreu um erro ao listar eventos.');
            }
        });
}

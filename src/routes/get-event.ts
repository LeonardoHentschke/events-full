import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from "zod";
import {prisma} from "../lib/prisma";
import {BadRequest} from "./_errors/bad-request";

export async function getEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/events/:eventId', {
            schema: {
                summary: 'Obter evento com especifico',
                tags: ['eventos'],
                params: z.object({
                    eventId: z.string().uuid(),
                }),
                // response: {
                //     200: z.object({
                //         id: z.string().uuid(),
                //         title: z.string(),
                //         details: z.string(),
                //         slug: z.string(),
                //         maximumAttendees: z.number().int().positive().nullable(),
                //         dateTime: z.string().datetime(),
                //         participants: z.array(z.object({
                //             id: z.string().uuid(),
                //             name: z.string(),
                //             email: z.string().email(),
                //             password: z.string(),
                //         })),
                //     }),
                // },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {

            // @ts-ignore
            const {eventId} = request.params;

            const event = await prisma.event.findUnique({
                where: {
                    id: eventId,
                },
                include: {
                    participants: {
                        select: {
                            user: true
                        },
                    },
                },
            });

            if (!event) {
                throw new BadRequest('Evento não encontrado.');
            }
            console.dir(event, {depth: null})
            return reply.status(200).send(event);
        });
}

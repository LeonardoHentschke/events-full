import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from "zod";
import {prisma} from "../../lib/prisma";
import {BadRequest} from "../_errors/bad-request";

export async function editEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .put('/events/:id', {
                schema: {
                    summary: 'Editar evento',
                    tags: ['Evento'],
                    params: z.object({
                        id: z.string().uuid(),
                    }),
                    body: z.object({
                        title: z.string().min(4),
                        details: z.string(),
                        maximumAttendees: z.number().int().positive().nullable(),
                        dateTime: z.string().datetime()
                    }),
                },
            },
            async (request: FastifyRequest, reply: FastifyReply) => {
                // @ts-ignore
                const eventId = request.params.id;
                // @ts-ignore
                const {title, details, maximumAttendees, dateTime} = request.body;

                const existingEvent = await prisma.event.findUnique({
                    where: {
                        id: eventId
                    },
                });

                if (!existingEvent) {
                    throw new BadRequest('Evento não encontrado');
                }

                const updatedEvent = await prisma.event.update({
                    where: {
                        id: eventId
                    },
                    data: {
                        title: title !== undefined ? title : existingEvent.title,
                        details: details !== undefined ? details : existingEvent.details,
                        maximumAttendees: maximumAttendees !== undefined ? maximumAttendees : existingEvent.maximumAttendees,
                        dateTime: dateTime !== undefined ? dateTime : existingEvent.dateTime,
                    },
                });

                return reply.status(200).send(updatedEvent);
            }
        );
}

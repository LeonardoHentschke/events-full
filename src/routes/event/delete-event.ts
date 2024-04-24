import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from "zod";
import {prisma} from "../../lib/prisma";
import {BadRequest} from "../_errors/bad-request";

export async function deleteEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .delete('/events/:id', {
                schema: {
                    summary: 'Excluir evento',
                    tags: ['Evento'],
                    params: z.object({
                        id: z.string().uuid(),
                    }),
                    response: {
                        204: z.undefined(),
                        404: z.object({
                            message: z.string(),
                        }),
                    },
                },
            },
            async (request, reply) => {
                const eventId = request.params.id;
                try {
                    const existingEvent = await prisma.event.findUnique({
                        where: {
                            id: eventId
                        },
                    });

                    if (!existingEvent) {
                        throw new BadRequest('Evento não encontrado');
                    }

                    await prisma.event.delete({
                        where: {
                            id: eventId
                        },
                    });

                    return reply.status(204).send();
                } catch (error) {
                    console.error('Erro ao excluir evento:', error);
                    if (error instanceof BadRequest) {
                        throw error;
                    }
                    throw new Error('Ocorreu um erro ao excluir o evento.');
                }
            }
        );
}

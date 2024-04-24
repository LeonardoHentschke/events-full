import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import {BadRequest} from "../_errors/bad-request";

export async function deleteUserSubscription(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .delete('/subscription', {
            schema: {
                summary: 'Cancelar inscrição de usuário em evento',
                tags: ['Inscrição'],
                body: z.object({
                    userId: z.string().uuid(),
                    eventId: z.string().uuid(),
                }),
                response: {
                    200: z.object({
                        message: z.string(),
                    }),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const { userId, eventId } = request.body;

            const existingSubscription = await prisma.subscription.findFirst({
                where: {
                    userId: userId,
                    eventId: eventId,
                },
            });

            if (!existingSubscription) {
                throw new BadRequest('Inscrição não encontrada.');
            }

            // Cancelar a inscrição
            await prisma.subscription.delete({
                where: {
                    id: existingSubscription.id,
                },
            });

            return reply.status(200).send({ message: 'Inscrição cancelada com sucesso.' });
        });
}

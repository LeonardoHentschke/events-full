import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from "zod";
import {prisma} from "../../lib/prisma"
import {BadRequest} from "../_errors/bad-request";

export async function deleteUser(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .delete('/users/:userId', {
            schema: {
                summary: 'Excluir usuário',
                tags: ['Usuário'],
                params: z.object({
                    userId: z.string().uuid(),
                }),
                response: {
                    204: z.null(),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const userId = request.params.userId;

            const existingUser = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            if (!existingUser) {
                throw new BadRequest('Usuário não encontrado.');
            }

            await prisma.user.delete({
                where: {
                    id: userId,
                },
            });

            return reply.status(204).send();
        });
}

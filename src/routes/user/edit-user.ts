import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from "zod";
import {prisma} from "../../lib/prisma"
import {BadRequest} from "../_errors/bad-request";

export async function editUser(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .put('/users/:userId', {
            schema: {
                summary: 'Editar usuário',
                tags: ['Usuário'],
                params: z.object({
                    userId: z.string().uuid(),
                }),
                body: z.object({
                    name: z.string().min(2).optional(),
                    email: z.string().email().optional(),
                    password: z.string().min(6).optional()
                }).partial(),
                response: {
                    200: z.object({
                        id: z.string().uuid(),
                        name: z.string(),
                        email: z.string().email(),
                    }),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const userId = request.params.userId;
            // @ts-ignore
            const { name, email, password } = request.body;

            const existingUser = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            if (!existingUser) {
                throw new BadRequest('Usuário não encontrado.');
            }

            const updatedUser = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    name: name !== undefined ? name : existingUser.name,
                    email: email !== undefined ? email : existingUser.email,
                    password: password !== undefined ? password : existingUser.password,
                },
            });

            return reply.status(200).send(updatedUser);
        });
}

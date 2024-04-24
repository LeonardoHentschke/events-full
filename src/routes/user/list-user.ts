import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../_errors/bad-request";

export async function listUsers(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/users', {
            schema: {
                summary: 'Listar usuários',
                tags: ['Usuário'],
                response: {
                    200: z.array(
                        z.object({
                            id: z.string().uuid(),
                            name: z.string(),
                            email: z.string().email(),
                            password: z.string(),
                        })
                    ),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const users = await prisma.user.findMany();
                return reply.status(200).send(users);
            } catch (error) {
                console.error('Erro ao listar usuários:', error);
                throw new BadRequest('Ocorreu um erro ao listar usuários.');
            }
        });
}

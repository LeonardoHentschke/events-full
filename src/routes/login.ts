import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from "zod";
import {prisma} from "../lib/prisma";

export async function login(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/login', {
            schema: {
                summary: 'Login do usuário',
                tags: ['autenticação'],
                body: z.object({
                    email: z.string().email(),
                    password: z.string(),
                }),
                response: {
                    200: z.object({
                        message: z.string(),
                    }),
                    401: z.object({
                        message: z.string(),
                    }),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const { email, password } = request.body;

            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });

            if (!user || user.password !== password) {
                return reply.status(401).send({ message: 'Credenciais inválidas.' });
            }

            return reply.status(200).send({ message: 'Login bem-sucedido.' });
        });
}

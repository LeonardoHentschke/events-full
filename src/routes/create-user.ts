import {FastifyInstance} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from "zod";
import {prisma} from "../lib/prisma"
import {BadRequest} from "./_errors/bad-request";

export async function createUser(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/users', {
            schema: {
                summary: 'Criar usuário',
                tags: ['Usuário'],
                body: z.object({
                    name: z.string().min(2),
                    email: z.string().email(),
                    password: z.string().min(6)
                }),
                response: {
                    201: z.object({
                        id: z.string().uuid(),
                        name: z.string(),
                        email: z.string().email(),
                    }),
                },
            },
        }, async (request, reply) => {
            const {name, email, password} = request.body;

            const existingUser = await prisma.user.findUnique({
                where: {
                    email,
                },
            });

            if (existingUser !== null) {
                throw new BadRequest('Já existe um usuário com o mesmo e-mail.');
            }

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password,
                },
            });

            return reply.status(201).send(user);
        });
}

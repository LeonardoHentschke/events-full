import {FastifyInstance} from "fastify";
import {prisma} from "../lib/prisma";

export async function listUsers(app: FastifyInstance) {
    app.get('/users', async (request, reply) => {
        try {
            const users = await prisma.user.findMany();

            return reply.status(200).send(users);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            return reply.status(500).send({message: 'Ocorreu um erro ao listar usuários.'});
        }
    });
}

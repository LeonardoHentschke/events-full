import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function listEvents(app: FastifyInstance) {
    app.get('/events', async (request, reply) => {
        try {
            const events = await prisma.event.findMany();
            return reply.status(200).send(events);
        } catch (error) {
            console.error('Erro ao listar eventos:', error);
            return reply.status(500).send({ message: 'Ocorreu um erro ao listar eventos.' });
        }
    });
}

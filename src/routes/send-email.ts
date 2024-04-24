import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import {z} from 'zod';

import {sendEmailService} from '../utils/send-email';
import {ZodTypeProvider} from "fastify-type-provider-zod";

export async function sendEmail(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/email', {
            schema: {
                summary: 'Enviar e-mail',
                tags: ['E-mail'],
                body: z.object({
                    to: z.string().email(),
                    title: z.string(),
                    content: z.string(),
                }),
                response: {
                    200: z.object({
                        message: z.string(),
                    }),
                },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const {to, title, content} = request.body;

            // Enviar e-mail
            try {
                await sendEmailService({
                    to: to,
                    subject: title,
                    html: content,
                });
            } catch (error) {
                console.error('Erro ao enviar e-mail:', error);
            }

            return reply.status(200).send({message: 'Email enviado com sucesso.'});
        });
}

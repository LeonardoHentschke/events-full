import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";
import {z} from "zod";
import {prisma} from "../../lib/prisma";
import {BadRequest} from "../_errors/bad-request";

export async function getUserSubscription(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/subscriptions/:userId', {
            schema: {
                summary: 'Consultar inscrições de um usuário',
                tags: ['Inscrição'],
                params: z.object({
                    userId: z.string().uuid(),
                }),
                // response: {
                //     200: z.array(z.object({
                //         id: z.string(),
                //         eventId: z.string(),
                //         eventName: z.string(),
                //         eventDateTime: z.string(),
                //     })),
                // },
            },
        }, async (request: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const { userId } = request.params;

            const userSubscriptions = await prisma.subscription.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    event: true,
                },
            });

            const formattedSubscriptions = userSubscriptions.map(subscription => ({
                id: subscription.id,
                eventId: subscription.eventId,
                eventName: subscription.event.title,
                eventDateTime: subscription.event.dateTime.toISOString(),
            }));

            return reply.status(200).send(formattedSubscriptions);
        });
}

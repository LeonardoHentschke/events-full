import {FastifyInstance} from "fastify"
import {ZodTypeProvider} from "fastify-type-provider-zod"
import {z} from "zod"
import {prisma} from "../../lib/prisma"
import {generateSlug} from "../../utils/generate-slug"
import {BadRequest} from "../_errors/bad-request"

export async function createEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/events', {
            schema: {
                summary: 'Criar evento',
                tags: ['Evento'],
                body: z.object({
                    title: z.string().min(4),
                    details: z.string(),
                    maximumAttendees: z.number().int().positive().nullable(),
                    dateTime: z.string().datetime()
                }),
            },
        }, async (request, reply) => {
            const {title, details, maximumAttendees, dateTime} = request.body
            const slug = generateSlug(title)

            const eventWithSameSlug = await prisma.event.findUnique({
                where: {
                    slug,
                }
            })

            if (eventWithSameSlug !== null) {
                throw new BadRequest('Já existe outro evento com o mesmo título.')
            }

            const event = await prisma.event.create({
                data: {
                    title,
                    details,
                    slug,
                    maximumAttendees,
                    dateTime
                },
            })

            return reply.status(201).send(event)
        })
}

import fastify from "fastify";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";

import {serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider} from 'fastify-type-provider-zod'
import {createEvent} from "./routes/create-event";
import {errorHandler} from "./error-handler";
import {createUser} from "./routes/create-user";
import {subscribeUserEvent} from "./routes/subscribe-user-event";
import {listEvents} from "./routes/list-event";
import {listUsers} from "./routes/list-user";
import {getEvent} from "./routes/get-event";

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
    origin: '*',
})

app.register(fastifySwagger, {
    swagger: {
        consumes: ['application/json'],
        produces: ['application/json'],
        info: {
            title: 'Events Full',
            description: 'Especificações da API',
            version: '1.0.0'
        },
    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent)
app.register(createUser)
app.register(listEvents)
app.register(listUsers)
app.register(subscribeUserEvent)
app.register(getEvent)

app.setErrorHandler(errorHandler)

app.listen({port: 3333, host: '0.0.0.0'}).then(() => {
    console.log('HTTP server running!')
})
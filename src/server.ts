import fastify, {FastifyError, FastifyReply, FastifyRequest, HookHandlerDoneFunction} from "fastify";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";

import fastifyBasicAuth from "@fastify/basic-auth";
import {validate, authenticate} from "./utils/validate";

import {serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider} from 'fastify-type-provider-zod'
import {createEvent} from "./routes/create-event";
import {errorHandler} from "./error-handler";
import {createUser} from "./routes/create-user";
import {subscribeUserEvent} from "./routes/subscribe-user-event";
import {listEvents} from "./routes/list-event";
import {listUsers} from "./routes/list-user";
import {getEvent} from "./routes/get-event";
import {getUserSubscription} from "./routes/get-user-subscription";
import {deleteUserSubscription} from "./routes/delete-user-subscription";
import {checkIn} from "./routes/check-in";
import {listCheckIn} from "./routes/list-check-in";
import {login} from "./routes/login";
import {saveLog} from "./utils/save-log";

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

app.register(fastifyBasicAuth, { validate, authenticate })

app.register(createEvent)
app.register(createUser)
app.register(listEvents)
app.register(listUsers)
app.register(subscribeUserEvent)
app.register(getEvent)
app.register(getUserSubscription)
app.register(deleteUserSubscription)
app.register(checkIn)
app.register(listCheckIn)
app.register(login)

app.setErrorHandler(errorHandler)

app.after(() => {
    app.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
        const log = {
            endpoint: request.url,
            method: request.method,
            params: JSON.stringify(request.params),
            body: JSON.stringify(request.body),
            authentication: request.headers.authorization || 'No authentication provided',
        };

        saveLog(log).then(r => console.log('Request salvo'));
        done()
    })


    app.addHook('onRequest', app.basicAuth)
})

app.setErrorHandler(function (err: FastifyError, req: FastifyRequest, reply: FastifyReply) {
    if (err.statusCode === 401) {
        reply.code(401).send({ message: 'Unauthorized' })
        return
    }
    reply.send(err)
})

app.listen({port: 3333, host: '0.0.0.0'}).then(() => {
    console.log('HTTP server running!')
})
import fastify, {FastifyError, FastifyReply, FastifyRequest, HookHandlerDoneFunction} from "fastify";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";

import fastifyBasicAuth from "@fastify/basic-auth";
import {validate, authenticate} from "./utils/validate";

import {serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider} from 'fastify-type-provider-zod'
import {createEvent} from "./routes/event/create-event";
import {errorHandler} from "./error-handler";
import {createUser} from "./routes/user/create-user";
import {subscribeUserEvent} from "./routes/subscription/subscribe-user-event";
import {listEvents} from "./routes/event/list-event";
import {listUsers} from "./routes/user/list-user";
import {getEvent} from "./routes/event/get-event";
import {getUserSubscription} from "./routes/subscription/get-user-subscription";
import {deleteUserSubscription} from "./routes/subscription/delete-user-subscription";
import {checkIn} from "./routes/checkins/check-in";
import {listCheckIn} from "./routes/checkins/list-check-in";
import {login} from "./routes/login";
import {saveLog} from "./utils/save-log";
import {sendEmail} from "./routes/subscription/send-email";
import {editUser} from "./routes/user/edit-user";
import {deleteUser} from "./routes/user/delete-user";
import {editEvent} from "./routes/event/edit-event";
import {deleteEvent} from "./routes/event/delete-event";

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
app.register(listEvents)
app.register(editEvent)
app.register(getEvent)
app.register(deleteEvent)

app.register(createUser)
app.register(listUsers)
app.register(editUser)
app.register(deleteUser)

app.register(subscribeUserEvent)
app.register(getUserSubscription)
app.register(deleteUserSubscription)
app.register(checkIn)
app.register(listCheckIn)
app.register(login)
app.register(sendEmail)

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
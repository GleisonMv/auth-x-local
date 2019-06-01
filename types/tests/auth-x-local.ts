import * as Fastify from "fastify"
import sample from "fast-auth-x"
import local from "./../auth-x-local"

const Instance = new local({
    secret: "teste teste",
    expire: "1H"
})

const fastify = Fastify()

fastify.register(sample.plugin, {
    strategy: Instance
});

fastify.get('/auth', (request, reply) =>
{
    request.authenticated(reply, false, function ()
    {
        Instance.auth(2, 5, reply)
    })
})

fastify.get('/login', (request, reply) =>
{
    request.authenticated(reply, false, function ()
    {
        reply.send({ hello: 'login page' });
    })
})

fastify.get('/home', (request, reply) =>
{
    request.authenticated(reply, true, function ()
    {
        reply.send({ hello: 'home page' });
    })
})

fastify.get('/home/admin', (request, reply) =>
{
    request.permission(reply, "user.admin", function ()
    {
        reply.send({ hello: 'admin page' });
    })
})

fastify.listen(3000, (err, address) =>
{
    if (err) throw err
    fastify.log.info(`server listening on ${address}`)
})
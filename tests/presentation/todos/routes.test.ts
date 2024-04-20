import request from 'supertest';
import { testServer } from '../../test-server';
import { prisma } from '../../../src/data/postgres';

describe('Todo route testing', () => {

    beforeAll(async () => {
        await testServer.start()
    });

    afterAll(() => {
        testServer.close();
    });

    beforeEach(async () => {
        await prisma.todo.deleteMany();
    })


    const todo1 = { text: 'Hola Mundo 1' };
    const todo2 = { text: 'Hola Mundo 2' };


    test('should return TODOS api/todos', async () => {

        await prisma.todo.deleteMany();
        await prisma.todo.createMany({
            data: [todo1, todo2]
        })

        const { body } = await request(testServer.app)
            .get('/api/todos')
            .expect(200)

        expect(body).toBeInstanceOf(Array);
        expect(body.length).toBe(2);
        expect(body[0].text).toBe(todo1.text);
        expect(body[1].text).toBe(todo2.text);
        expect(body[0].completedAt).toBeNull();

    });

    test('should return a TODO api/todos/:id', async () => {

        const todo = await prisma.todo.create({ data: todo1 })

        const { body } = await request(testServer.app)
            .get(`/api/todos/${todo.id}`)
            .expect(200)

        expect(body).toEqual({
            id: todo.id,
            text: todo.text,
            completedAt: todo.completedAt,
        })

    });

    test('should return a 400 bad request api/todos/:id', async () => {

        const todoId = 99999
        const { body } = await request(testServer.app)
            .get(`/api/todos/${todoId}`)
            .expect(400)

        expect(body).toEqual({ error: `Todo with ${todoId} not found` })

    });

    test('should return a new todo api/todos', async () => {

        const { body } = await request(testServer.app)
            .post('/api/todos')
            .send(todo1)
            .expect(201)

        expect(body).toEqual({
            id: expect.any(Number),
            text: todo1.text,
            completedAt: null,
        })

    });

    test('should return an error if text is not present api/todos', async () => {

        const { body } = await request(testServer.app)
            .post('/api/todos')
            .send({})
            .expect(400)

        expect(body).toEqual({ error: 'Text property is required' })
    });

    test('should return an error if text is empty api/todos', async () => {

        const { body } = await request(testServer.app)
            .post('/api/todos')
            .send({ text: '' })
            .expect(400)

        expect(body).toEqual({ error: 'Text property is required' })
    });


    test('should return an updated todo api/todos/:id', async () => {

        const todo = await prisma.todo.create({ data: todo1 })

        const { body } = await request(testServer.app)
            .put(`/api/todos/${todo.id}`)
            .send({ text: 'Text updated', completedAt: '2024-04-20' })
            .expect(200)

        expect(body).toEqual({
            id: expect.any(Number),
            text: 'Text updated',
            completedAt: '2024-04-20T00:00:00.000Z'
        });

    });

    test('should return 400 if todo to update is not found', async () => {

        const todoId = 99999
        const { body } = await request(testServer.app)
            .put(`/api/todos/${todoId}`)
            .expect(400)

        expect(body).toEqual({ error: `Todo with ${todoId} not found` })


    });

    test('should return and updated todo and only the date should be updated', async () => {

        const todo = await prisma.todo.create({ data: todo1 })

        const { body } = await request(testServer.app)
            .put(`/api/todos/${todo.id}`)
            .send({ completedAt: '2024-04-20' })
            .expect(200)

        expect(body).toEqual({
            id: expect.any(Number),
            text: todo1.text,
            completedAt: '2024-04-20T00:00:00.000Z'
        });


    });

    test('should return and updated todo and only the text should be updated', async () => {

        const todo = await prisma.todo.create({ data: todo1 })

        const { body } = await request(testServer.app)
            .put(`/api/todos/${todo.id}`)
            .send({ text: 'Text updated' })
            .expect(200)

        expect(body).toEqual({
            id: expect.any(Number),
            text: 'Text updated',
            completedAt: null,
        });


    });

    test('should delete a todo api/todos/:id', async () => {

        const todo = await prisma.todo.create({ data: todo1 })

        const { body } = await request(testServer.app)
            .delete(`/api/todos/${todo.id}`)
            .expect(200)

        expect(body).toEqual({
            id: expect.any(Number),
            text: todo.text,
            completedAt: null,
        });


    });

    test('should delete 404 if todo does not exist api/todos/:id', async () => {

        const todoId = 99999
        const { body } = await request(testServer.app)
            .delete(`/api/todos/${todoId}`)
            .expect(400)

        expect(body).toEqual({ error: `Todo with ${todoId} not found` })



    });

});
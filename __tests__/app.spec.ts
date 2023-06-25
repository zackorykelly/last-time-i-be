import request from 'supertest';
import {app, server} from '../src/index';
import { Sequelize } from 'sequelize';
import Task from '../src/models/task';

const sequelize = new Sequelize('sqlite::memory:'); // create a new Sequelize instance

describe('Task API', () => {

beforeAll(async () => {
    // Connect to the test database and initialize the Task model
    await sequelize.authenticate();
    await Task.sync({ force: true });
});

afterAll(async () => {
    // Close the database sequelize after all tests have run
    await sequelize.close();
    // Close the server to prevent memory leaks
    server.close();
  });

describe('GET /tasks', () => {
    it('should return an empty array when there are no tasks', async () => {
        const response = await request(app).get('/tasks');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should return a list of tasks when there are tasks in the database', async () => {
        // Create some test tasks
        const task1 = { title: 'Task 1', description: 'Description 1', completed: false };
        const task2 = { title: 'Task 2', description: 'Description 2', completed: true };
        await Task.bulkCreate([task1, task2]);

        // Make the request to the API
        const response = await request(app).get('/tasks');

        // Check that the response is correct
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].title).toBe(task1.title);
        expect(response.body[1].title).toBe(task2.title);
    });
});

describe('POST /tasks', () => {
    it('should create a new task', async () => {
        const newTask = { title: 'New Task', description: 'New Description', completed: false };
        const response = await request(app).post('/tasks').send(newTask);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(newTask.title);
        expect(response.body.description).toBe(newTask.description);
        expect(response.body.completed).toBe(newTask.completed);
    });
});

describe('PATCH /tasks/:id', () => {
    it('should update the status of a task', async () => {
        // Create a test task
        const task = { title: 'Task', description: 'Description', completed: false };
        const createdTask = await Task.create(task);

        // Update the task status
        const updatedTask = { ...task, completed: true };
        const response = await request(app).patch(`/tasks/${createdTask.id}`).send(updatedTask);

        // Check that the response is correct
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task updated successfully.');

        // Check that the task was updated in the database
        const updatedTaskFromDB = await Task.findByPk(createdTask.id);
        if (updatedTaskFromDB) {
            expect(updatedTaskFromDB.completed).toBe(true);
        }
    });

    it('should return a 404 error if the task does not exist', async () => {
        const task = { title: 'Task', description: 'Description', completed: false };
        const response = await request(app).patch('/tasks/999').send(task);
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Task not found.');
    });
});

describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
        // Create a test task
        const task = { title: 'Task', description: 'Description', completed: false };
        const createdTask = await Task.create(task);

        // Delete the task
        const response = await request(app).delete(`/tasks/${createdTask.id}`);

        // Check that the response is correct
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task successfully deleted.');

        // Check that the task was deleted from the database
        const deletedTaskFromDB = await Task.findByPk(createdTask.id);
        expect(deletedTaskFromDB).toBeNull();
    });

    it('should return a 404 error if the task does not exist', async () => {
        const response = await request(app).delete('/tasks/999');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Task not found.');
    });
  });
});
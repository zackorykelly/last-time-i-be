import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import connection from './db/config';
import Task, {TaskInit} from './models/task';
import bodyParser from 'body-parser';
import cors from 'cors'
const axios = require('axios')

//Retrieve port variable from env
dotenv.config();
const port = process.env.PORT;

//App initialization
const app: Express = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
//Will enable cors on all requests regardless of origin.
//Should be changed before production release.
app.use(cors())

//Add an initialize task model(creates table if necessary using sync)
connection.addModels([Task])
TaskInit(connection);



//Retrieve the list of tasks
app.get('/tasks', async (req: Request, res: Response) => {
  try {    
    const result = await Task.findAll({
      order: [['id', 'ASC']]
    });
    res.send(result);
  } catch (error) {
    //Something went wrong
    console.error(error);
    return res.status(500).json({ error: 'Server error.'})
  }
});

//Create a new task
app.post('/tasks', async (req: Request, res: Response) => {
  const newTask = req.body;
  try {
    const result = await Task.create(newTask);
    res.send(result);
  } catch (error) {
    //Something went wrong
    console.error(error);
    return res.status(500).json({ error: 'Server error.'})
  }
});

//Update the status of a task (completed or incomplete)
app.patch('/tasks/:id', async (req: Request, res: Response) => {
  const taskUpdate: Task = req.body
  try {
    const response = await Task.update(
      taskUpdate,
      {where: {
        id: req.params.id
      }}
    )
    if (response[0] === 0) {
      //No tasks found to update
      res.status(404).json({ error: 'Task not found.'})
    }
    //Task was found and updated successfully
    res.json({message: 'Task updated successfully.'});
  } catch (error) {
    //Something went wrong
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error.'})
    }  
  }
});

//Delete a task
app.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const response = await Task.destroy({
      where: {
        id: req.params.id
      }
    })
    //Response will be the number of rows affected
    if (response === 0) {
      //No task found to delete
      res.status(404).json({ error: 'Task not found.' })
    }
    //Rows were successfully deleted
    res.json({ message: 'Task successfully deleted.'})
  } catch (error) {
    //Something went wrong
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error.'})
    }  
  }
});

//Run server
const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export {app, server}; //For testing purposes
const express = require("express");
const app = express();
const port = 3000;

const taskData = require("./task.json");

app.use(express.json());

// In-memory storage
let tasks = [...taskData.tasks];

// GET /tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id
app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).end();
  }

  res.json(task);
});

// POST /tasks
app.post('/tasks', (req, res) => {
  const { title, description, completed } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be a boolean' });
  }

  const newTask = {
    id: tasks.length + 1,
    title,
    description,
    completed,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, completed } = req.body;

  if (title !== undefined && !title) {
    return res.status(400).json({ error: 'title must not be empty' });
  }
  if (description !== undefined && !description) {
    return res.status(400).json({ error: 'description must not be empty' });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be a boolean' });
  }

  if (title !== undefined) tasks[index].title = title;
  if (description !== undefined) tasks[index].description = description;
  if (completed !== undefined) tasks[index].completed = completed;

  res.json(tasks[index]);
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).end();
  }

  tasks.splice(index, 1);
  res.end();
});


app.get('/', (req, res) => res.send('Server is up'));

if (process.env.NODE_ENV !== 'test') {
  const listenPort = process.env.PORT || port;
  app.listen(listenPort, () => {
    console.log(`Server running on port ${listenPort}`);
  });
}

module.exports = app;

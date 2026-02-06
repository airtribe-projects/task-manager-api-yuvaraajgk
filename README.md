## Task Manager API

### Overview

A RESTful API for managing tasks, built with **Node.js** and **Express**.  
It lets you create, read, update and delete tasks over HTTP, with data kept in memory (seeded from `task.json`).

### Getting started

- **Install**

```bash
npm install
```

- **Run the server** (defaults to port `3000`)

```bash
node app.js          # or: npm run dev
```

- **Run tests**

```bash
npm test
```

If `GET /` returns `Server is up`, you’re good.

### API (quick reference)

Base URL: `http://localhost:3000`

- `**GET /tasks**` – list all tasks  
Example:
  ```bash
  curl http://localhost:3000/tasks
  ```
- `**GET /tasks/:id**` – get one task  
  ```bash
  curl http://localhost:3000/tasks/1
  ```
- `**POST /tasks**` – create a task  
Body:
  ```json
  {
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false
  }
  ```
  ```bash
  curl -X POST http://localhost:3000/tasks \
    -H "Content-Type: application/json" \
    -d '{"title":"Buy groceries","description":"Milk, bread, eggs","completed":false}'
  ```
- `**PUT /tasks/:id**` – update a task (send any of `title`, `description`, `completed`)  
  ```bash
  curl -X PUT http://localhost:3000/tasks/1 \
    -H "Content-Type: application/json" \
    -d '{"completed":true}'
  ```
- `**DELETE /tasks/:id**` – remove a task  
  ```bash
  curl -X DELETE http://localhost:3000/tasks/1
  ```

Notes: data is in-memory only; everything resets when you restart the server.
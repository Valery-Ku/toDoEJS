const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

mongoose.connect('mongodb://localhost:27017/todoapp');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; connect-src 'self' ws://localhost:3000 http://localhost:3000; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
  } else {
    res.setHeader("Content-Security-Policy", "default-src 'none'");
  }
  next();
});

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false }
});
const Todo = mongoose.model('Todo', TodoSchema);


app.get('/', async (req, res) => {
  const todos = await Todo.find();
  res.render('index', { todos });
});

app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;
  await Todo.create({ title, description });
  res.redirect('/');
});

app.post('/tasks/:id/update', async (req, res) => {
  const { title, description } = req.body;
  await Todo.findByIdAndUpdate(req.params.id, { title, description });
  res.redirect('/');
});

app.post('/tasks/:id/toggle', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  todo.completed = !todo.completed;
  await todo.save();
  res.redirect('/');
});

app.get('/tasks/:id/edit', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  res.render('edit', { todo });
});

app.post('/tasks/:id/delete', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Настройка EJS
app.set('view engine', 'ejs');

// Запуск сервера
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

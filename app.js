const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const todoController = require('./controllers/todoController');
const app = express();

// Подключение к MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp';
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('Подключено к MongoDB'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Сессии
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware для locals
app.use((req, res, next) => {
  res.locals.errors = req.session.errors || [];
  res.locals.inputData = req.session.inputData || {};
  delete req.session.errors;
  delete req.session.inputData;
  next();
});

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Маршруты
app.get('/', todoController.getAllTasks);
app.post('/tasks', todoController.createTask);
app.post('/tasks/:id/update', todoController.updateTask);
app.post('/tasks/:id/toggle', todoController.toggleTask);
app.get('/tasks/:id/edit', todoController.getEditTask);
app.post('/tasks/:id/delete', todoController.deleteTask);

// Глобальный error handler с fallback
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  if (!res.headersSent) {
    try {
      res.status(500).render('error', { message: 'Внутренняя ошибка сервера: ' + err.message });
    } catch (renderErr) {
      console.error('Ошибка рендеринга шаблона error.ejs:', renderErr);
      res.status(500).send('Внутренняя ошибка сервера: ' + err.message);
    }
  }
});

module.exports = app;
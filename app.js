const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const todoController = require('./controllers/todoController'); 
const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB с обработкой событий
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Подключено к MongoDB');
  })
  .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err);
  });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Сессии для хранения ошибок и данных форм
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',  // Замени на переменную окружения
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // В продакшене secure: true с HTTPS
}));

// Middleware для передачи ошибок и данных в res.locals
app.use((req, res, next) => {
  res.locals.errors = req.session.errors || [];
  res.locals.inputData = req.session.inputData || {};
  delete req.session.errors;
  delete req.session.inputData;
  next();
});

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'none'");
  next();
});

// Настройка EJS и путь к views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Добавлено: явный путь к папке views

// Маршруты с контроллерами
app.get('/', todoController.getAllTasks);
app.post('/tasks', todoController.createTask);
app.post('/tasks/:id/update', todoController.updateTask);
app.post('/tasks/:id/toggle', todoController.toggleTask);
app.get('/tasks/:id/edit', todoController.getEditTask);
app.post('/tasks/:id/delete', todoController.deleteTask);

// Глобальный error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);  // Улучшено логирование
  if (!res.headersSent) {  // Предотвратить multiple sends
    res.status(500).render('error', { message: 'Внутренняя ошибка сервера: ' + err.message });
  }
});

module.exports = app;
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const todoController = require('./controllers/todoController');

const app = express();

// Подключение к MongoDB с обработкой событий
mongoose.connect('mongodb://localhost:27017/todoapp')
  .then(() => {
    console.log('Подключено к MongoDB');
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
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
  secret: 'your-secret-key',  // Замени на секретный ключ
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

// Безопасность (CSP)
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

// Настройка EJS
app.set('view engine', 'ejs');

// Маршруты с контроллерами
app.get('/', todoController.getAllTasks);
app.post('/tasks', todoController.createTask);
app.post('/tasks/:id/update', todoController.updateTask);
app.post('/tasks/:id/toggle', todoController.toggleTask);
app.get('/tasks/:id/edit', todoController.getEditTask);
app.post('/tasks/:id/delete', todoController.deleteTask);

// Глобальный error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Внутренняя ошибка сервера' });
});
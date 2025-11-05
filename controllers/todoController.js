const Todo = require('../models/Todo');
const { body, validationResult } = require('express-validator');

// Получить все задачи
exports.getAllTasks = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.render('index', { todos, errors: [], inputData: {} });
  } catch (err) {
    res.status(500).render('error', { message: 'Ошибка при загрузке задач' });
  }
};

// Создать задачу с валидацией
exports.createTask = [
  body('title').trim().notEmpty().withMessage('Название задачи обязательно').isLength({ min: 3, max: 100 }).withMessage('Название должно быть от 3 до 100 символов'),
  body('description').trim().optional().isLength({ max: 500 }).withMessage('Описание не должно превышать 500 символов'),
  body('title').escape(),
  body('description').escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.errors = errors.array();
      req.session.inputData = { title: req.body.title, description: req.body.description };
      return res.redirect('/');
    }
    try {
      const { title, description } = req.body;
      const newTodo = new Todo({ title, description });
      await newTodo.save();
      res.redirect('/');
    } catch (err) {
      res.status(500).render('error', { message: 'Ошибка при создании задачи' });
    }
  }
];

// Переключить статус завершения
exports.toggleTask = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).render('error', { message: 'Задача не найдена' });
    todo.completed = !todo.completed;
    await todo.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).render('error', { message: 'Ошибка при обновлении статуса' });
  }
};

// Удалить задачу
exports.deleteTask = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).render('error', { message: 'Ошибка при удалении задачи' });
  }
};

// Получить задачу для редактирования
exports.getEditTask = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).render('error', { message: 'Задача не найдена' });
    res.render('edit', { todo, errors: [], inputData: {} });
  } catch (err) {
    res.status(500).render('error', { message: 'Ошибка при загрузке задачи' });
  }
};

// Обновить задачу с валидацией
exports.updateTask = [
  body('title').trim().notEmpty().withMessage('Название задачи обязательно').isLength({ min: 3, max: 100 }).withMessage('Название должно быть от 3 до 100 символов'),
  body('description').trim().optional().isLength({ max: 500 }).withMessage('Описание не должно превышать 500 символов'),
  body('title').escape(),
  body('description').escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.errors = errors.array();
      req.session.inputData = { title: req.body.title, description: req.body.description };
      return res.redirect(`/tasks/${req.params.id}/edit`);
    }
    try {
      const { title, description } = req.body;
      await Todo.findByIdAndUpdate(req.params.id, { title, description });
      res.redirect('/');
    } catch (err) {
      res.status(500).render('error', { message: 'Ошибка при обновлении задачи' });
    }
  }
];
const Task = require('../models/Task');
const { body, validationResult } = require('express-validator');

// Получить все задачи
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.render('index', { todos: tasks, errors: [], inputData: {} });
  } catch (err) {
    console.error('Error loading tasks:', err);
    res.render('index', { todos: [], errors: [], inputData: {} });
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
      const newTask = new Task({ title, description });
      await newTask.save();
      res.redirect('/');
    } catch (err) {
      console.error('Error creating task:', err);
      try {
        res.status(500).render('error', { message: 'Ошибка при создании задачи: ' + err.message });
      } catch (renderErr) {
        res.status(500).send('Ошибка при создании задачи: ' + err.message);
      }
    }
  }
];

// Переключить статус
exports.toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).render('error', { message: 'Задача не найдена' });
    }
    task.completed = !task.completed;
    await task.save();
    res.redirect('/');
  } catch (err) {
    console.error('Error toggling task:', err);
    try {
      res.status(500).render('error', { message: 'Ошибка при обновлении статуса: ' + err.message });
    } catch (renderErr) {
      res.status(500).send('Ошибка при обновлении статуса: ' + err.message);
    }
  }
};

// Удалить задачу
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting task:', err);
    try {
      res.status(500).render('error', { message: 'Ошибка при удалении задачи: ' + err.message });
    } catch (renderErr) {
      res.status(500).send('Ошибка при удалении задачи: ' + err.message);
    }
  }
};

// Получить для редактирования
exports.getEditTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).render('error', { message: 'Задача не найдена' });
    res.render('edit', { todo: task, errors: [], inputData: {} });
  } catch (err) {
    console.error('Error loading task for edit:', err);
    try {
      res.status(500).render('error', { message: 'Ошибка при загрузке задачи: ' + err.message });
    } catch (renderErr) {
      res.status(500).send('Ошибка при загрузке задачи: ' + err.message);
    }
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
      await Task.findByIdAndUpdate(req.params.id, { title, description });
      res.redirect('/');
    } catch (err) {
      console.error('Error updating task:', err);
      try {
        res.status(500).render('error', { message: 'Ошибка при обновлении задачи: ' + err.message });
      } catch (renderErr) {
        res.status(500).send('Ошибка при обновлении задачи: ' + err.message);
      }
    }
  }
];
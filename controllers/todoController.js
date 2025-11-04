const Todo = require('../models/Todo');

// Получить все задачи
exports.getAllTasks = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.render('index', { todos });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Создать задачу
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTodo = new Todo({ title, description });
    await newTodo.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Переключить статус завершения
exports.toggleTask = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).send('Задача не найдена');
    todo.completed = !todo.completed;
    await todo.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Удалить задачу
exports.deleteTask = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Получить задачу для редактирования
exports.getEditTask = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).send('Задача не найдена');
    res.render('edit', { todo });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Обновить задачу
exports.updateTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    await Todo.findByIdAndUpdate(req.params.id, { title, description });
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1/students_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Підключено до бази даних');
})
.catch((err) => {
  console.error('Помилка при підключенні до бази даних:', err);
});

const studentSchema = new mongoose.Schema({
  nickname: String,
  firstName: String,
  lastName: String,
}, {
  versionKey: false
});

const Student = mongoose.model('Student', studentSchema);

app.use(bodyParser.json());

// Роутер для отримання списку студентів
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Помилка при отриманні списку студентів' });
  }
});

// Роутер для отримання токена за ніком студента
app.get('/students/:nickname/token', async (req, res) => {
  try {
    const { nickname } = req.params;
    const student = await Student.findOne({ nickname });
    if (student) {
      const token = 'student_token';
      res.json({ token });
    } else {
      res.status(404).json({ error: 'Студента з таким ніком не знайдено' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Помилка при отриманні токена' });
  }
});

// Роутер для створення нового студента
app.post('/students', async (req, res) => {
  try {
    const { nickname, firstName, lastName } = req.body;
    const token = req.headers.authorization;
    if (token === 'auth_token') {
      const student = new Student({ nickname, firstName, lastName });
      await student.save();
      res.json(student);
    } else {
      res.status(401).json({ error: 'Неприпустимий токен або відсутній токен' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Помилка при створенні студента' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});
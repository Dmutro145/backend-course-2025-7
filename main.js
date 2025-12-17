require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Підключення до PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Тест підключення
pool.connect((err, client, release) => {
  if (err) {
    console.error('Помилка підключення до БД:', err);
  } else {
    console.log('Успішно підключено до PostgreSQL');
    release();
  }
});

app.use(express.json());

// Створюємо папку для кешу
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Базовий маршрут
app.get('/', (req, res) => {
  res.send('Сервер працює!');
});

// Отримати всіх користувачів з БД
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка сервера');
  }
});

// Додати нового користувача
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка сервера');
  }
});

app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Додаємо параметри для повторних спроб
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 5000,
  max: 10,
});

// Функція для тесту підключення з повторними спробами
async function testConnection(retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('Успішно підключено до PostgreSQL');
      client.release();
      return;
    } catch (err) {
      console.log(`Спроба ${i + 1}/${retries}: Не вдалося підключитися до БД. Чекаємо ${delay}ms...`);
      if (i === retries - 1) {
        console.error('Помилка підключення до БД:', err.message);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Викликаємо тест підключення
testConnection();

app.use(express.json());

const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

app.get('/', (req, res) => {
  res.send('Сервер працює!');
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка сервера');
  }
});

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

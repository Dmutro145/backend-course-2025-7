require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware для парсингу JSON
app.use(express.json());

// Підключення до PostgreSQL
const pool = new Pool({
  host: 'db',  // ← ім'я сервісу з docker-compose.yml
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  connectionTimeoutMillis: 5000,
  max: 10,
});

// Функція для тесту підключення з повторними спробами
async function testConnection(retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log(' Успішно підключено до PostgreSQL');
      client.release();
      return true;
    } catch (err) {
      console.log(` Спроба ${i + 1}/${retries}: Не вдалося підключитися до БД. Чекаємо ${delay}ms...`);
      if (i === retries - 1) {
        console.error(' Помилка підключення до БД:', err.message);
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Простий маршрут для перевірки сервера
app.get('/', (req, res) => {
  res.json({ message: 'Сервер працює!', timestamp: new Date().toISOString() });
});

// Додатковий маршрут для перевірки БД
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      database: 'connected',
      time: result.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: err.message 
    });
  }
});

// Затримка перед підключенням, щоб БД точно запустилась
setTimeout(async () => {
  await testConnection();
}, 3000);

// Запуск сервера
app.listen(port, () => {
  console.log(` Сервер запущено на порті ${port}`);
});

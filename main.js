require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({
  host: 'db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mydb',
  port: process.env.DB_PORT || 5432,
});

app.get('/', (req, res) => {
  res.json({ message: 'Сервер працює!', timestamp: new Date().toISOString() });
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'OK', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});

// Маршрут для перевірки змінних оточення
app.get('/env', (req, res) => {
  res.json({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'не вказано'
  });
});

app.get('/nodemon-test', (req, res) => {
  res.json({
    message: 'Nodemon hot reload працює!',
    timestamp: new Date().toISOString()
  });
});

// Hot reload тест
app.get('/hot-reload-test', (req, res) => {
  res.json({
    message: 'Hot reload працює!',
    timestamp: new Date().toISOString(),
    test: 'Оновлення без перезапуску контейнера'
  });
});

// Дебаг тест
app.get('/debug-test', (req, res) => {
  console.log('🔴 Брейкпоінт тут!');
  debugger;
  res.json({
    debug: true,
    message: 'Використовуйте Chrome DevTools',
    chrome_url: 'chrome://inspect',
    timestamp: new Date().toISOString()
  });
});
// Тестовий маршрут
app.get('/test-hot-reload', (req, res) => {
  res.json({
    message: 'HOT RELOAD WORKS!',
    timestamp: new Date().toISOString()
  });
});

// Simple test route
app.get('/simple-test', (req, res) => res.json({test: 'hot reload test', time: new Date().toISOString()}));

// Windows hot reload test
app.get('/windows-test', (req, res) => res.json({success: true, os: 'windows', time: new Date().toISOString()}));

// Final hot reload test
app.get('/final-test', (req, res) => res.json({status: 'hot reload working', time: new Date().toISOString()}));

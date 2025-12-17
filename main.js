require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Додаємо параметри для повторних спроб
// Додаємо параметри для повторних спроб
const pool = new Pool({
  host: 'db',  // ← зміни тут
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

// Затримка перед підключенням, щоб БД точно запустилась
setTimeout(() => {
  testConnection();
}, 3000);

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

app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});

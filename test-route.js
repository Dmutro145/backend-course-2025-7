// Тестовий маршрут
app.get('/test-hot-reload', (req, res) => {
  res.json({
    message: 'HOT RELOAD WORKS!',
    timestamp: new Date().toISOString()
  });
});

const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors());
app.use(express.json());

/* BASE ROUTE */
app.get('/', (req, res) => {
  res.send('API is running successfully 🚀');
});

/* USER ROUTES */
app.use('/api/users', userRoutes);

module.exports = app;

const express = require('express');
require('dotenv').config();
const app = express();
const identifyRoute = require('./routes/identifyRoute');
const sequelize = require('./utils/db');
const Contact = require('./models/contactModel');

app.use(express.json());
app.use('/', identifyRoute);

sequelize.sync().then(() => {
  console.log('DB connected and models synced');
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});

const express = require('express');
const app = express();
require('dotenv').config('./.env');
global.CronJob = require('./backup.js');


const PORT = process.env.PORT;

app.listen(PORT, console.log(`Server started on port ${PORT} for Database Backup`));

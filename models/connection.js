const mongoose = require('mongoose');

const mongoUri =
  process.env.NODE_ENV === 'test'
    ? process.env.CONNECTION_STRING_TEST
    : process.env.CONNECTION_STRING;

mongoose.connect(mongoUri, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));

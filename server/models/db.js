// Establishes connection to the db
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

// on success
mongoose.connection.on('connected', () => console.log(`Mongoose connected on ${process.env.MONGO_URI}`));

// on error
mongoose.connection.on('error', err => console.log(`Mongoose connection error ${err}`));

// on disconnection
mongoose.connection.on('disconnected', () => console.log('Mongoose connection terminated'));

// When Node process ends kill db connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('App has terminated , Mongoose disconnected');
  });
});

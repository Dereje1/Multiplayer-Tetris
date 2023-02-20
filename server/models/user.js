const mongoose = require('mongoose');

// define the schema for our user model
const userSchema = new mongoose.Schema({
  userId: String,
  token: String,
  displayName: String,
  username: String,
  service: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;

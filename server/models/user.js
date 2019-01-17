const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  google: {
    id: String,
    token: String,
    displayName: String,
    email: String,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

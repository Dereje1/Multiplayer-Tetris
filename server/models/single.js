const mongoose = require('mongoose');

const singleSchema = mongoose.Schema({
  googleId: { type: String, required: true },
  linesCleared: { type: Number, required: true },
  levelReached: { type: Number, required: true },
}, { timestamps: true });

const singlePlayer = mongoose.model('Single', singleSchema);

module.exports = singlePlayer;

const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
  googleId: { type: String, required: true },
  opponentGoogleId: { type: String, required: true },
  difficulty: {
    type: Number, required: true, min: 1, max: 4,
  },
  linesCleared: { type: Number, required: true },
  floorsRaised: { type: Number, required: true },
  won: { type: Boolean, required: true },
  disqualified: { type: Boolean, required: true },
}, { timestamps: true });

const multiPlayer = mongoose.model('Multi', matchSchema);

module.exports = multiPlayer;

const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
  winnerGoogleId: { type: String, required: true },
  looserGoogleId: { type: String, required: true },
  difficulty: {
    type: Number, required: true, min: 1, max: 4,
  },
  winnerLinesCleared: { type: Number, required: true },
  winnerFloorsRaised: { type: Number, required: true },
  looserLinesCleared: { type: Number, required: true },
  looserFloorsRaised: { type: Number, required: true },
  looserDisqualified: { type: Boolean, required: true },
}, { timestamps: true });

const multiPlayer = mongoose.model('Multi', matchSchema);

module.exports = multiPlayer;

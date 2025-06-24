const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Running', 'Completed', 'Error'], default: 'Pending' },
  result: { type: String },
  verdict: { type: String, enum: ['Pass', 'Fail', ''], default: '' },
  output: { type: String },
  error: { type: String },
  timestamp: { type: Date, default: Date.now },
  plagiarismReport: {
    isFlagged: { type: Boolean, default: false },
    mostSimilarSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    similarityScore: { type: Number }
  }
});

module.exports = mongoose.model('Submission', submissionSchema); 
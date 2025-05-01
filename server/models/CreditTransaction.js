
const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['daily_login', 'profile_completion', 'save_item', 'report_item', 'share_item', 'admin_adjustment'],
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);

module.exports = CreditTransaction;

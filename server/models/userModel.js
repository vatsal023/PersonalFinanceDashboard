const mongoose = require('mongoose');
const { PlaidItemSchema } = require('./plaidModel'); // Import the PlaidItemSchema
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plaidItems: [PlaidItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

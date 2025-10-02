const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaidItemSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // which user owns this item
  itemId: { type: String, required: true },
  accessToken: { type: String, required: true }, // encrypted in production
  institution: { 
    name: String, 
    institution_id: String 
  },
  accounts: [
    { 
      account_id: String, 
      mask: String, 
      name: String, 
      type: String, 
      subtype: String 
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// module.exports = mongoose.model('PlaidItem', PlaidItemSchema);
module.exports = {
  PlaidItemSchema,                   // <-- export schema explicitly
  PlaidItem: mongoose.model('PlaidItem', PlaidItemSchema)
};
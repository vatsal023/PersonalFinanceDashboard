const express = require('express');
const auth = require('../middleware/auth');
const {
  createLinkToken,
  exchangePublicToken,
  fetchTransactions
} = require('../Controllers/plaidController');

const router = express.Router();

router.post('/create_link_token', createLinkToken);
router.post('/exchange_public_token', exchangePublicToken);
router.post('/fetch_transactions', fetchTransactions);

// router.post('/create_link_token', auth, createLinkToken);
// router.post('/exchange_public_token', auth, exchangePublicToken);
// router.post('/fetch_transactions', auth, fetchTransactions);

module.exports = router;

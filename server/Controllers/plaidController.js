const plaidClient = require('../config/plaidClient');
const { encrypt, decrypt } = require('../utils/crypto');
const User = require('../models/userModel');
const Transaction = require('../models/TransactionModel');

exports.createLinkToken = async (req, res) => {
  try {
    // Use dummy user ID if req.user is undefined
    const userId = req.user ? String(req.user.id) : 'test_user_123';

    const request = {
      user: { client_user_id: userId },
      client_name: 'Personal Finance Dashboard',
      language: 'en',
      products: ['transactions', 'investments'],
      country_codes: ['US']
    };

    const response = await plaidClient.linkTokenCreate(request);
    res.json(response.data);
  } catch (err) {
    console.error('link token error', err?.response?.data || err);
    res.status(500).json({ error: 'Could not create link token' });
  }
};

exports.exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;
    if (!public_token) return res.status(400).json({ error: 'Missing public_token' });

    const exchangeRes = await plaidClient.itemPublicTokenExchange({ public_token });
    const access_token = exchangeRes.data.access_token;
    const item_id = exchangeRes.data.item_id;

    // Use dummy user for testing
    const userId = req.user ? req.user.id : 'dummy_user_id';
    let user = await User.findById(userId);
    if (!user) {
      // Create dummy user if it doesn't exist
      user = new User({ _id: userId, name: 'Test User', email: 'test@example.com', plaidItems: [] });
    }

    user.plaidItems.push({
      itemId: item_id,
      accessToken: encrypt(access_token),
      createdAt: new Date()
    });
    await user.save();

    res.json({ item_id });
  } catch (err) {
    console.error('exchange error', err?.response?.data || err);
    res.status(500).json({ error: 'Exchange failed' });
  }
};

exports.fetchTransactions = async (req, res) => {
  try {
    const mockTxs = [
      { transaction_id: '1', date: '2025-09-01', name: 'Walmart', amount: 25.5, category: ['Shopping'] },
      { transaction_id: '2', date: '2025-09-02', name: 'Starbucks', amount: 5.75, category: ['Coffee'] },
    ];

    // Optionally save to DB if you want to test your table
    for (const t of mockTxs) {
      await Transaction.updateOne(
        { transaction_id: t.transaction_id },
        { $set: { ...t } },
        { upsert: true }
      );
    }

    res.json({ imported: mockTxs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch transactions' });
  }
};
// exports.fetchTransactions = async (req, res) => {
//   try {
//     const { start_date, end_date } = req.body;

//     // Use dummy user ID if req.user is undefined
//     const userId = req.user ? req.user.id : 'dummy_user_id';
//     let user = await User.findById(userId);

//     // If dummy user doesn't exist, create it with a dummy linked item
//     if (!user) {
//       console.log('Creating dummy user for testing');
//       user = new User({
//         _id: userId,
//         name: 'Test User',
//         email: 'test@example.com',
//         plaidItems: [] // You will need to add a valid access token after exchangePublicToken
//       });
//       await user.save();
//     }

//     if (!user.plaidItems.length) {
//       return res.status(400).json({ error: 'No linked items. Run exchangePublicToken first.' });
//     }

//     const item = user.plaidItems[0];
//     const accessToken = decrypt(item.accessToken);

//     const txRes = await plaidClient.transactionsGet({
//       access_token: accessToken,
//       start_date,
//       end_date
//     });

//     const txs = txRes.data.transactions;

//     for (const t of txs) {
//       await Transaction.updateOne(
//         { transaction_id: t.transaction_id },
//         {
//           $set: {
//             user: user._id,
//             account_id: t.account_id,
//             amount: t.amount,
//             date: t.date,
//             name: t.name,
//             merchant_name: t.merchant_name,
//             category: t.category,
//             raw: t
//           }
//         },
//         { upsert: true }
//       );
//     }

//     res.json({ imported: txs.length });
//   } catch (err) {
//     console.error('fetch tx error', err?.response?.data || err);
//     res.status(500).json({ error: 'Could not fetch transactions' });
//   }
// };

// exports.createLinkToken = async (req, res) => {
//   try {
//     const userId = String(req.user.id);
//     const request = {
//       user: { client_user_id: userId },
//       client_name: 'Personal Finance Dashboard',
//       language: 'en',
//       products: ['transactions', 'investments'],
//       country_codes: ['US']
//     };
//     const response = await plaidClient.linkTokenCreate(request);
//     res.json(response.data);
//   } catch (err) {
//     console.error('link token error', err?.response?.data || err);
//     res.status(500).json({ error: 'Could not create link token' });
//   }
// };

// exports.exchangePublicToken = async (req, res) => {
//   try {
//     const { public_token } = req.body;
//     if (!public_token) return res.status(400).json({ error: 'Missing public_token' });

//     const exchangeRes = await plaidClient.itemPublicTokenExchange({ public_token });
//     const access_token = exchangeRes.data.access_token;
//     const item_id = exchangeRes.data.item_id;

//     const user = await User.findById(req.user.id);
//     user.plaidItems.push({
//       itemId: item_id,
//       accessToken: encrypt(access_token),
//       createdAt: new Date()
//     });
//     await user.save();

//     res.json({ item_id });
//   } catch (err) {
//     console.error('exchange error', err?.response?.data || err);
//     res.status(500).json({ error: 'Exchange failed' });
//   }
// };

// exports.fetchTransactions = async (req, res) => {
//   try {
//     const { start_date, end_date } = req.body;
//     const user = await User.findById(req.user.id);
//     if (!user || !user.plaidItems.length) return res.status(400).json({ error: 'No linked items' });

//     const item = user.plaidItems[0];
//     const accessToken = decrypt(item.accessToken);

//     const txRes = await plaidClient.transactionsGet({
//       access_token: accessToken,
//       start_date,
//       end_date
//     });

//     const txs = txRes.data.transactions;
//     for (const t of txs) {
//       await Transaction.updateOne(
//         { transaction_id: t.transaction_id },
//         {
//           $set: {
//             user: user._id,
//             account_id: t.account_id,
//             amount: t.amount,
//             date: t.date,
//             name: t.name,
//             merchant_name: t.merchant_name,
//             category: t.category,
//             raw: t
//           }
//         },
//         { upsert: true }
//       );
//     }

//     res.json({ imported: txs.length });
//   } catch (err) {
//     console.error('fetch tx error', err?.response?.data || err);
//     res.status(500).json({ error: 'Could not fetch transactions' });
//   }
// };

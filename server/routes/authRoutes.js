const express = require('express');
const registerController = require('../Controllers/RegisterController');
const loginController = require('../Controllers/loginController');


const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);


module.exports = router;

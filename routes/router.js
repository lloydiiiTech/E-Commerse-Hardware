
const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController');

// Login routes
router.get('/login', UserController.login);
router.post('/login', UserController.loginPost);

// Registration routes
router.get('/register', UserController.register);
router.post('/register', UserController.registerPost);

// Protected route (requires authentication)
router.get('/dashboard', UserController.verifyToken, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// Logout route
router.get('/logout', UserController.logout);



router.get('/forgot-password', UserController.forgotPassword);
router.post('/forgot-password', UserController.forgotPasswordPost);
router.get('/reset-password/:token', UserController.resetPassword);
router.post('/reset-password/:token', UserController.resetPasswordPost);



module.exports = router;

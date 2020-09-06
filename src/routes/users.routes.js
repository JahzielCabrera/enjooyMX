const { Router } = require('express');
const router = Router();
const bodyParser = require('body-parser');
const {isAuthenticated} = require('../helpers/validateAuth');

const { renderSignUpForm, 
        signUp, 
        confirmAccount,
        renderSignInForm, 
        signIn, 
        logOut,
        restorePasswordForm,
        restorePassword, 
        validateUrlResetPassword, 
        updatePassword,
        stripeWebHooks,
        renderSubscriptions,
        createSubscription, 
        paymentInfo,
        renderTest } = require('../controllers/users.controller')

// SignUp
router.get('/signup', renderSignUpForm);
router.post('/signup', signUp);

// Confirm Email Account
router.get('/confirmaccount/:email', confirmAccount);

// SignIn
router.get('/signin', renderSignInForm);
router.post('/signin', signIn);

// LogOut
router.get('/logout', logOut);

// Restore Password
router.get('/restorepassword', restorePasswordForm);
router.post('/restorepassword', restorePassword);
router.get('/restorepassword/:token', validateUrlResetPassword);
router.post('/restorepassword/:token', updatePassword);

// Subscriptions
router.post('/stripewh', bodyParser.raw({ type: 'application/json' }), stripeWebHooks);
router.get('/subscriptions', isAuthenticated, renderSubscriptions);

// Payments
router.get('/subscription/create/:id', isAuthenticated, paymentInfo);
router.post('/subscription/create', isAuthenticated, createSubscription);

module.exports =  router; 
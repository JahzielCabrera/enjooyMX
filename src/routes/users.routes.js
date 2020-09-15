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
        retryInvoice,
        retriveCustomerPaymenthMethod,
        saveSubscriptiomInfo,
        paymentInfo,
        renderMySubscriptionForm,
        renderConfigForm,
        updateConfig
 } = require('../controllers/users.controller')

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

// Render Subscription Info 
router.get('/subscriptions/my-subscription', isAuthenticated, renderMySubscriptionForm);
router.get('/subscription/create', isAuthenticated, saveSubscriptiomInfo);

// Retry Invoice 
router.post('/subscription/retry-invoice', isAuthenticated, retryInvoice);

// Retrive Customer Paymenth Method
router.post('/retrieve-customer-payment-method', isAuthenticated, retriveCustomerPaymenthMethod);

// Payments
router.get('/subscription/create/:id', isAuthenticated, paymentInfo);
router.post('/subscription/create', isAuthenticated, createSubscription);

// Config
router.get('/config', isAuthenticated, renderConfigForm);
router.put('/config', isAuthenticated, updateConfig);

module.exports =  router; 
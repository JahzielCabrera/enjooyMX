const { Router } = require('express');
const router = Router();

const { renderSignUpForm, 
        signUp, 
        renderSignInForm, 
        signIn, 
        logOut,
        restorePasswordForm,
        restorePassword, 
        validateUrlResetPassword, 
        updatePassword } = require('../controllers/users.controller')

// SignUp
router.get('/signup', renderSignUpForm);
router.post('/signup', signUp);

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

module.exports =  router;
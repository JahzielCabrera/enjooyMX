const { Router } = require('express');
const router = Router();

const { renderSignUpForm, 
        signUp, 
        renderSignInForm, 
        signIn, 
        logOut } = require('../controllers/users.controller')

// SignUp
router.get('/signup', renderSignUpForm);
router.post('/signup', signUp);

// SignIn
router.get('/signin', renderSignInForm);
router.post('/signin', signIn);

// LogOut
router.get('/logout', logOut);

module.exports =  router;
const userCtrl = {};

const passport = require('passport');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

userCtrl.renderSignUpForm = (req, res) => {
    res.render('users/signUp');
};

const User = require('../models/User');
const { reset } = require('nodemon');
const { connection } = require('mongoose');

userCtrl.signUp = async (req, res, next) => {
    try{
        const errors = [];
        const { name, 
                lastName, 
                email, 
                password, 
                confirm_password, 
                restaurantName, 
                restaurantCategory 
            } = req.body;
    
        if (password != confirm_password){
            errors.push({text: 'Contraseñas no coinciden'});
        }
        if (password.length < 8) {
            errors.push({text: 'La contraseña dede contener al menos 8 carácteres.'});
        }
        if (errors.length > 0) {
            res.render('users/signUp', { errors, name, lastName, email, restaurantName, restaurantCategory });
        } else {
            const emailUser = await User.findOne({email: email}).lean();

            if ( emailUser ) {
                req.flash('error_msg', 'Este correo ya ha sido registrado');
                res.redirect('/signup');
            } else {
                const newUser = new User({name, lastName, email, password, restaurantName, restaurantCategory});
                newUser.password = await newUser.encryptPassword(password);
                req.flash('alert_success', 'Has sido registrado correctamente')
                await newUser.save();
                res.redirect('/signin');
            }
        
        }
    } catch(err){
        console.log(err);
        next(); 
    }
};

userCtrl.renderSignInForm = (req,res) => {
    res.render('users/signIn');
};

userCtrl.signIn = passport.authenticate('local', {
        failureRedirect: '/signin',
        successRedirect: '/admin',
        failureFlash: true
});
    
userCtrl.logOut = (req, res) => {
    req.logout(); 
    req.flash('alert_success', 'Sesión cerrada con éxito');
    res.redirect('/signin');
};

// Reset Password 

userCtrl.restorePasswordForm = (req, res) => {
    res.render('users/resetPassword');
};

userCtrl.restorePassword = async (req, res) => {
    const {email} = req.body;
    const user_password = await User.findOne({email});
    if(!user_password){
        req.flash('error_msg', 'Correo no registrado');
        res.redirect('/restorepassword')
    }
    else{
       user_password.token.token = crypto.randomBytes(30).toString('hex');
       user_password.token.expiration = Date.now() + 3600000;
       await user_password.save();

       const resetUrl = `http://${req.headers.host}/restorepassword/${user_password.token.token}`;
       console.log(resetUrl);
       req.flash('alert_success', `Hemos enviado un correo a ${email}, revisa tu bandeja de entrada.`)
       res.redirect('/signin');
    }
};

userCtrl.validateUrlResetPassword = async (req, res) => {
    const user_password = await User.findOne({'token.token': req.params.token}).lean();
    
    if(!user_password){
        req.flash('error_msg', 'No válido');
        res.redirect('/restorepassword');
    }
    res.render('users/changePassword', {user_password}) 
};

userCtrl.updatePassword = async (req, res, next) => {
    try{
        const user_password = await User.findOne({'token.token': req.params.token}).lean();
        const time_validation = (user_password.token.expiration >= Date.now());
        if(time_validation == false){
            req.flash('error_msg', 'El tiempo válido a expirado, por favor genera otra solicitud');
            res.redirect('/restorepassword');
        }
        if(req.body.password != req.body.confirm_password){
            req.flash('error_msg', 'Las contraseñas no coinciden');
            res.redirect(`/restorepassword/${req.params.token}`);
        }
        if(req.body.password.length < 8){
            req.flash('error_msg', 'La nueva contraseña debe tener al menos 8 caracteres');
            res.redirect(`/restorepassword/${req.params.token}`);
        }
        else{
            const password = req.body.password;
            console.log(password);
            const newPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            //const user = await User.update({password: req.body.password});
            await User.findByIdAndUpdate(user_password._id, {password: newPassword});
            user_password.token.token = null;
            user_password.token.expiration = null;
            
        }
    } catch(err){
        console.log(err);
        next();
    }
    req.flash('alert_success', 'Contraseña actualizada con éxito');
    res.redirect('/signin');
};

module.exports = userCtrl;
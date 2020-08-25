const userCtrl = {};

const passport = require('passport');

userCtrl.renderSignUpForm = (req, res) => {
    res.render('users/signUp');
};

const User = require('../models/User');

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
}

module.exports = userCtrl;
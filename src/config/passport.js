const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser( async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
})

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
        // Confirm email in database

        const user = await User.findOne({ email: email} );
    
        if(!user){
            return done(null, false, req.flash('error', 'Usuario no encontrado'));
        } 
        if(!user.comparePassword(password)){
            return done(null, false, req.flash('error', 'Contraseña incorrecta'));
        }
        return done(null, user);
        // else {
        //     // match passwords
        //     console.log({user});

        //     const match = await user.matchPassword(password);

        //     if (password == user.password){
        //         console.log(password==user.password);
        //         return done(null, user);

        //     } else{
        //         return done(null, false, {message: 'Contraseña Incorrecta'});
        //     }
        // }
}));

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//     const user = User.findById(id, (err, user) => {
//         done(err, user);
//     });
// });
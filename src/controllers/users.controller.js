const userCtrl = {};

const passport = require('passport');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { reset } = require('nodemon');
const { connection } = require('mongoose');
const { user } = require('../config/email');
const cloudinary = require('cloudinary');
const fs = require('fs-extra');
const { exists } = require('../models/User');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

userCtrl.renderSignUpForm = (req, res) => {
    if(!req.user){
        res.render('users/signUp');
    } else{
        res.redirect('/admin');
    }
    
};

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
                const customer = await stripe.customers.create({email: email, preferred_locales: ['es']});
                const newUser = new User({name, lastName, email, password, restaurantName, restaurantCategory, stripeCustomerId: customer.id});
                newUser.password = await newUser.encryptPassword(password);
                req.flash('alert_success', `Has sido registrado correctamente. Enviamos un enlace de confirmación a ${email}, confirma tu cuenta para acceder.`);
                await newUser.save();

                // Create a URL to confirm email
                const confirmURL = `http://${req.headers.host}/confirmaccount/${email}`;
                console.log(confirmURL);

                confirmAccountHTML = `

                    <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                        }
   
                        h2 {
                            font-size: 3rem;
                            text-align: center;
                        }
   
                        a {
                            margin-top: 2rem;
                            text-align: center;
                            display: block;
                            padding: 1.5rem 0;
                            color: rgb(255, 255, 255);
                            background-color: rgb(74, 105, 243);
                            font-weight: bold;
                            text-transform: uppercase;
                            text-decoration: none;
                        }
   
                        p {
                            line-height: 2;
                        }
                    </style>
   
                    <body>
                        <h2>Confirma tu cuenta</h2>
            
                        <p>Hola ${name}, para accerder a todas las funciones de Menup debes confirmar tu correo. Por favor haz click en el siguiente
                        botón. 
                        <a href="${confirmURL}">Confirmar cuenta</a>
                        </p>
   
                        <p>
                        <p style="font-size: 12px">Si no puedes accerder al enlace, visita: ${confirmURL}</p>
                        </p>
   
                        <p>
                        Si tú no solicitaste este enlace puedes ignorarlo.
                        </p>
   
                    </body>
       
                `;

                const transporter = nodemailer.createTransport({
                    host: emailConfig.host,
                    port: emailConfig.port,
                    auth: {
                        user: emailConfig.user,
                        pass: emailConfig.pass
                    }
                });

                const info = await transporter.sendMail({
                    from: 'Menup <no-reply@menup.com>',
                    to: email,
                    subject: 'Confirma tu cuenta Menup',
                    html: confirmAccountHTML
                });


                res.redirect('/signin');
            }
        
        }
    } catch(err){
        console.log(err);
        next(); 
    }
};

userCtrl.confirmAccount = async (req, res) => {
    const userConfirmEmail = await User.findOne({email: req.params.email});

    if(!userConfirmEmail){
        req.flash('error_msg', 'No válido, regístrate por favor');
        res.redirect('/signup');
    }
    else{
        userConfirmEmail.activeAccount = 1;
        await userConfirmEmail.save();
        req.flash('alert_success', '¡Cuenta activada! Ahora puedes ingresar a tu cuenta');
        res.redirect('/signin');
    }
    
   
};

userCtrl.renderSignInForm = (req,res) => {
    if(!req.user){
        res.render('users/signIn');
    } else {
        res.redirect('/admin');
    }
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
        
       contentHTML = `

        <style>
            body {
                font-family: 'Roboto', sans-serif;
            }
   
            h2 {
                font-size: 3rem;
                text-align: center;
            }
   
            a {
                margin-top: 2rem;
                text-align: center;
                display: block;
                padding: 1.5rem 0;
                color: rgb(255, 255, 255);
                background-color: rgb(74, 105, 243);
                font-weight: bold;
                text-transform: uppercase;
                text-decoration: none;
            }
   
            p {
                line-height: 2;
            }
        </style>
   
        <body>
            <h2>Reestablecer contraseña</h2>
            
            <p>Hola ${user_password.name}, has solicitado reestablecer la contraseña de tu cuenta. Por favor haz click en el siguiente
                botón. 
            <a href="${resetUrl}">Cambiar contraseña</a>
            </p>
   
            <p>
                Este enlace es temporal, si se vence puedes volver a generarlo.
                <p style="font-size: 12px">Si no puedes accerder al enlace, visita: ${resetUrl}</p>
            </p>
   
            <p>
                Si tú no solicitaste este enlace puedes ignorarlo.
            </p>
   
        </body>
       
       `;

        const transporter = nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            }
        });

        const info = await transporter.sendMail({
            from: 'Menup <no-reply@menup.com>',
            to: user_password.email,
            subject: 'Cambia la contraseña de tu cuenta Menup',
            html: contentHTML
        });

       console.log(resetUrl);
       console.log('Email sent', info.messageId);
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
            await User.findByIdAndUpdate(user_password._id, {password: newPassword, 'token.token': null, 'token.expiration': null});
            
        }
    } catch(err){
        console.log(err);
        next();
    }
    req.flash('alert_success', 'Contraseña actualizada con éxito');
    res.redirect('/signin');
};


userCtrl.stripeWebHooks = async (req, res) => {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
    
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
          );
        } catch (err) {
          console.log(err);
          console.log(`⚠️  Webhook signature verification failed.`);
          console.log(
            `⚠️  Check the env file and enter the correct webhook secret.`
          );
          return res.sendStatus(400);
        }
        // Extract the object from the event.
        const dataObject = event.data.object;
        
        console.log(dataObject);
        // Handle the event
        // Review important events for Billing webhooks
        // https://stripe.com/docs/billing/webhooks
        // Remove comment to see the various objects sent for this sample
        switch (event.type) {
          case 'invoice.paid':
            // Used to provision services after the trial has ended.
            // The status of the invoice will show up as paid. Store the status in your
            // database to reference when a user accesses your service to avoid hitting rate limits.

            res.send('Paid successs')
            break;
          case 'invoice.payment_failed':
            // If the payment fails or the customer does not have a valid payment method,
            //  an invoice.payment_failed event is sent, the subscription becomes past_due.
            // Use this webhook to notify your user that their payment has
            // failed and to retrieve new card details.
            break;
          case 'invoice.finalized':
            // If you want to manually send out invoices to your customers
            // or store them locally to reference to avoid hitting Stripe rate limits.
            break;
          case 'customer.subscription.deleted':
            if (event.request != null) {
              // handle a subscription cancelled by your request
              // from above.
            } else {
              // handle subscription cancelled automatically based
              // upon your subscription settings.
            }
            break;
          case 'customer.subscription.trial_will_end':
            if (event.request != null) {
              // handle a subscription cancelled by your request
              // from above.
            } else {
              // handle subscription cancelled automatically based
              // upon your subscription settings.
            }
            break;
          default:
          // Unexpected event type 
        }
        res.sendStatus(200);
}

userCtrl.renderSubscriptions = async (req, res) => {
    const basic = await Subscription.findOne({subscriptionName: 'Básico'}).lean();
    const intermediate = await Subscription.findOne({subscriptionName: 'Intermedio'}).lean();
    const advance = await Subscription.findOne({subscriptionName: 'Avanzado'}).lean();
    res.render('users/subscriptionPayment', {basic, intermediate, advance});
}

userCtrl.paymentInfo = async (req, res) => {
    const user = req.user;
    const user_json = user.toJSON();
    console.log(user.toJSON());
    const subscription = await Subscription.findById(req.params.id).lean();
    res.render('users/paymentForm', {subscription, user_json});
}

userCtrl.createSubscription = async (req, res) => {
    console.log(`PaymenthMethodId: ${req.body.paymentMethodId}`);
    console.log(`CustomerId: ${req.body.customerId}`);
    try {
        await stripe.paymentMethods.attach(req.body.paymentMethodId, {
            customer: req.body.customerId,
        });
    } catch (error) {
            return res.status('402').send({ error: { message: error.message } });
    }
    
      // Change the default invoice settings on the customer to the new payment method
    await stripe.customers.update(
        req.body.customerId,
        {
          invoice_settings: {
            default_payment_method: req.body.paymentMethodId,
          },
        }
    );
    
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
        customer: req.body.customerId,
        items: [{ price: req.body.priceId}],
        expand: ['latest_invoice.payment_intent'],
    });

    console.log(subscription.latest_invoice.payment_intent.status);

}

userCtrl.renderMySubscriptionForm = (req, res) => {
    res.render('users/mySubscription');
}


userCtrl.renderChangeSubscriptionForm = (req, res) => {
    res.render('users/changeSubscription');
}

userCtrl.updateSubscription = (req, res) => {
    res.send('Subscription Updated 😨')
}

userCtrl.deleteSubscription = (req, res) => {
    res.send('Subscription Deleted 😡');
}












userCtrl.renderConfigForm = (req, res) => {
    res.render('users/configForm');
}

userCtrl.updateConfig = async (req, res) => {
    const { name, lastName, restaurantName, color, facebook, instagram } = req.body;
    const userConfig = await User.findById(req.user.id);
    userConfig.name = name;
    userConfig.lastName = lastName;
    userConfig.restaurantName = restaurantName;
    userConfig.color = color;
    userConfig.socialNetworks.facebook = facebook;
    userConfig.socialNetworks.instagram = instagram;
    if(req.files.image){
        if(userConfig.logo_public_id){
            await cloudinary.v2.uploader.destroy(userConfig.logo_public_id);
        }
        const resLogo = await cloudinary.v2.uploader.upload(req.files.image[0].path);
        userConfig.logo = resLogo.secure_url;
        userConfig.logo_public_id = resLogo.public_id;
        await fs.unlink(req.files.image[0].path);
    } 
    if(req.files.portada){
        if(userConfig.portada_public_id){
            await cloudinary.v2.uploader.destroy(userConfig.portada_public_id);
        }
        const resPortada = await cloudinary.v2.uploader.upload(req.files.portada[0].path, {width: 1000});
        userConfig.portada = resPortada.secure_url;
        userConfig.portada_public_id = resPortada.public_id;
        await fs.unlink(req.files.portada[0].path);
    }
    await userConfig.save();
    req.flash('success_msg', 'Información actualizada con éxito 👽');
    res.redirect('/admin');
}

module.exports = userCtrl;
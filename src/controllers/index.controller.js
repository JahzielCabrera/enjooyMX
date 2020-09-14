const indexCtrl = {};
const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

indexCtrl.renderIndex = (req, res) => {
    res.render('index')
};

indexCtrl.sendEmailContact = async (req, res) => {
    console.log(req.body);
    const {name, email, subject, message} = req.body;

    const firstName = name.split(" ")[0];

    thanksHTML = `
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            padding: 10px 10px 10px 10px;
            margin-left: 30px;
        }
        h1 {
            text-align: center;
        }
        img {
            margin-top: 40px;
            width: 90px;
        }
    </style>
    <body>
        <h1>Hola ${firstName}, gracias por contactarnos 🚀</h1>

        <p>Hemos recbido tu mensaje, tan pronto nos sea posible te responderemos.</p>

        <strong>Mensaje recibido: </strong> <p class="cursiva"><i>"${message}".</i></p>
        <br>
        <p><Strong>El equipo de enjooy México 🇲🇽</Strong></p>
        <a href="https://www.enjooy.mx"><img src="https://res.cloudinary.com/djxxgphqp/image/upload/v1600046215/logos/LogoMakr_6S5FEW_y2aatz.png" alt=""></a>
    </body>
    

    `

    contactFormHTML = `
    
    <h1>Nueva solicitud de contacto de ${firstName}</h1>
    <p><strong>User Name:</strong> ${name}</p>
    <p><strong>User Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong> ${message}</p>

    <h1>Adios 🚀</h1>
    
    `

    const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        auth: {
            user: emailConfig.user,
            pass: emailConfig.pass
        }
    });

    const info = await transporter.sendMail({
        from: 'Enjooy MX <no-reply@enjooy.mx>',
        to: email,
        subject: 'Gracias por contactarnos',
        html: thanksHTML
    });
    const infoToEnjooy = await transporter.sendMail({
        from: 'Contact Form <no-reply@enjooy.mx>',
        to: 'jahziel@enjooy.mx',
        subject: 'Contact Form',
        html: contactFormHTML
    });
    req.flash('alert_success', 'Hemos recibido tu solicitud 🚀');
    res.redirect('/');
};

indexCtrl.renderTest = (req, res) => {
    res.render('test', {layout: false});
}

module.exports = indexCtrl; 
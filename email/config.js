const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    port: 465,
    host: process.env.EMAIL_SMTP,
       auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
         },
    secure: true,
});

module.exports = transporter
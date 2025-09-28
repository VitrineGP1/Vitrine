const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // Seu e-mail
        user: process.env.EMAIL_USER,
        // Sua senha, ou preferenciamente a senha configurada para App password
        pass: process.env.EMAIL_PASS

    },
    tls: {
        // Ignorar certificado digital - APENAS EM DESENVOLVIMENTO
        secure: false,
        ignoreTLS: true,
        rejectUnauthorized: false,
    }
});

function enviarEmail(to, subject, text=null ,html = null, callback) {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject
    };
    if(text!= null){
        mailOptions.text = text;
    }else if(html != null){
        mailOptions.html = html;
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email enviado: " + info.response);
            if (callback && typeof callback === 'function') {
                // Chama a função de callback apenas em caso de sucesso no envio do e-mail
                callback();
            }
        }
    });

}

module.exports = { enviarEmail };
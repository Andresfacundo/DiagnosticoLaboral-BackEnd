const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'andresfelipefacundo@gmail.com',
        pass: process.env.PASS_APLICATION,
    },
});

const sendEmail = async (data) => {
    const { nombre, correo, telefono, mensaje, intereses = [] } = data;

    const mailOptions = {
        from: `"Formulario Contacto - Gómez Valencia Abogados" <andresfelipefacundo@gmail.com>`,
        to: 'andresfacundo2000@gmail.com', 
        subject: 'Nuevo mensaje de contacto - Gómez Valencia Abogados',
        html: `
            <h3>Nuevo mensaje de contacto desde la web</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Correo:</strong> ${correo}</p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
            <p><strong>Mensaje:</strong> ${mensaje}</p>        
            <p><strong>Intereses:</strong> ${intereses.join(', ')}</p>        
            <hr>
            <p><em>Este mensaje fue enviado desde el formulario de contacto en la página web de Gómez Valencia Abogados.</em></p>
        `,
        replyTo: correo, // Para que al responder, se dirija al correo del remitente
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };

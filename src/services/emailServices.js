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
        from: `"Contacto Web" <andresfelipefacundo@gmail.com`,
        to: `${correo}`,
        subject: 'Nuevo mensaje de contacto',
        html: `
            <h3>Nuevo mensaje de contacto</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Correo:</strong> ${correo}</p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
            <p><strong>Mensaje:</strong> ${mensaje}</p>
            <p><strong>Intereses:</strong> ${intereses.join(', ')}</p>
        `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };

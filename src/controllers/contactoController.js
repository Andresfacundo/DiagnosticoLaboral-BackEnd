const { sendEmail } = require('../services/emailServices');

const enviarContacto = async (req, res) => {
    try {
        await sendEmail(req.body);
        res.status(200).json({ mensaje: '¡Mensaje recibido y correo enviado correctamente!' });
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({ mensaje: 'Hubo un error al enviar el correo.' });
    }
};

module.exports = {
    enviarContacto,
};

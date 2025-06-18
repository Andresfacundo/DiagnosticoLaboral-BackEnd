const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
  const { email, nombre } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'andresfelipefacundo@gmail.com',
      pass: process.env.PASS_APLICATION,
    },
  });

  const mailOptions = {
    from: 'andresfelipefacundo@gmail.com',
    to: email,
    subject: 'Hemos revisado tu diagnóstico – Agendemos una llamada',
    html: `
        <p>Hola ${nombre},</p>
        <p>Gracias por responder nuestro diagnóstico de cumplimiento en normas laborales y de seguridad social. Ya revisamos tus respuestas y encontramos algunos aspectos clave que podrías fortalecer para asegurar que tu empresa cumpla al 100% con la normativa vigente.</p>
        <p>En GVA Abogados podemos ayudarte a implementar esos ajustes, de manera práctica y efectiva.</p>
        <p>¿Te parece si lo conversamos en una llamada de 20 minutos?<br>
        Solo debes hacer clic en el siguiente botón para agendarla en el momento que mejor te funcione:</p>
        <p>📅 <a href="https://calendly.com/juandaniel-2">Agendar reunión</a></p>
        <p>Quedamos atentos. Nos encantará ayudarte a llevar tu empresa al siguiente nivel de cumplimiento.</p>
        <p>Saludos,</p>
        <p>Juan Daniel Valencia Echeverry<br>
        Abogado especialista en Derecho Laboral y Seguridad Social<br>
        GVA Abogados – Gestión y Administración de Personal<br>
        <a href="https://www.gva-abogados.co">www.gva-abogados.co</a></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Correo enviado con éxito' });
  } catch (err) {
    console.error('Error al enviar correo:', err);
    res.status(500).json({ success: false, message: 'Error al enviar el correo' });
  }
};

module.exports = {
  sendEmail,
}

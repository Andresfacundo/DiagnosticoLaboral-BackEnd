const jwt = require('jsonwebtoken');

const generarJWT = (usuario) => {
    return jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );
};

const verificarJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = { generarJWT, verificarJWT };
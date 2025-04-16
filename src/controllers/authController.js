const Usuario = require('../models/Usuario.js');
const { generarJWT } = require('../utils/jwt');
const tokenBlackList = require('../models/TokenBlackList');
const jwt = require('jsonwebtoken');


const crearUsuario = async (req, res) => {
    try {
        const { email, password, nombre, rol } = req.body;


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                msg: 'El email no es válido'
            });
        }

        // Verificar si ya existe el email
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({
                msg: 'El email ya está registrado'
            });
        }

        // Crear usuario (ahora solo accesible por superadmin)
        const usuario = await Usuario.create({
            email,
            password,
            nombre,
            rol: rol || 'user' // El superadmin puede especificar cualquier rol
        });
        res.status(201).json({
            msg: 'Usuario creado correctamente',
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al crear usuario'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si existe el usuario
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario no registrado'
            });
        }

        // Verificar si la contraseña es correcta
        const passwordValido = await usuario.compararPassword(password);
        if (!passwordValido) {
            return res.status(400).json({
                msg: 'Usuario o contraseña incorrectos'
            });
        }

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return res.status(401).json({
                msg: 'La cuenta está desactivada'
            });
        }

        // Generar JWT
        const token = generarJWT(usuario);

        res.json({
            msg: 'Login exitoso',
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol
            },
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error en el servidor'
        });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ msg: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];

        // Decodificar el token para obtener fecha de expiración
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return res.status(400).json({ msg: 'Token inválido' });
        }

        const expiresAt = new Date(decoded.exp * 1000); // Convertir de segundos a ms

        // Guardar token en la blacklist
        await tokenBlackList.create({ token, expiresAt });

        res.json({ msg: 'Sesión cerrada correctamente. Token invalidado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor durante el cierre de sesión' });
    }
};

module.exports = {
    crearUsuario,
    login,
    logout
};
const Usuario = require('../models/usuario');
const { generarJWT } = require('../utils/jwt');

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

module.exports = {
    crearUsuario,
    login
};
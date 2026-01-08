const Usuario = require('../models/Usuario.js');
const { generarJWT } = require('../utils/jwt');
const tokenBlackList = require('../models/TokenBlackList');
const jwt = require('jsonwebtoken');


// Registro con estado inactivo por defecto
const crearUsuario = async (req, res) => {
    try {
        const { email, password, nombre, rol } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'El email no es válido' });
        }

        // Verificar si ya existe
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ msg: 'El email ya está registrado' });
        }

        // Crear usuario inactivo
        const usuario = await Usuario.create({
            email,
            password,
            nombre,
            rol: rol || 'asociado',
            activo: false
        });
        const emitirNotificacion = req.app.get("emitirNotificacion");
        emitirNotificacion("nuevo-usuario-pendiente", {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            mensaje: "Nuevo usuario pendiente de aprobación.",
        });

        res.status(201).json({
            msg: 'Usuario registrado correctamente. Pendiente de aprobación por un administrador.',
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol,
                activo: usuario.activo
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar usuario' });
    }
};

// Login: Solo si está activo
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({ msg: 'Usuario no registrado' });
        }

        const passwordValido = await usuario.compararPassword(password);
        if (!passwordValido) {
            return res.status(400).json({ msg: 'Usuario o contraseña incorrectos' });
        }

        if (!usuario.activo) {
            return res.status(401).json({ msg: 'Tu cuenta aún no ha sido aprobada por un administrador' });
        }

        const token = generarJWT(usuario);
        // Emitir evento de inicio de sesión exitoso
        const emitirNotificacion = req.app.get("emitirNotificacion");
        emitirNotificacion("usuario-login", {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            mensaje: "Usuario ha iniciado sesión correctamente.",
        });

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
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ msg: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return res.status(400).json({ msg: 'Token inválido' });
        }

        const expiresAt = new Date(decoded.exp * 1000);

        // Guardar token en la blacklist
        await tokenBlackList.create({ token, expiresAt });

        res.json({ msg: 'Sesión cerrada correctamente. Token invalidado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor durante el cierre de sesión' });
    }
};
const perfil = async (req, res) => {
    try {
        const usuario = req.usuario;
        res.json({
            msg: 'Perfil obtenido correctamente',
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: 'Error al obtener el perfil' });
    }

};

const listarPendientes = async (req, res) => {
    try {
        const pendientes = await Usuario.findAll({ where: { activo: false } });
        res.json(pendientes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al listar usuarios pendientes' });
    }
};

const aprobarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        usuario.activo = true;
        await usuario.save();

        const emitirNotificacion = req.app.get("emitirNotificacion");
        emitirNotificacion("usuario-aprobado", {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            mensaje: "Tu cuenta ha sido aprobada por un administrador.",
        });

        res.json({ msg: 'Usuario aprobado correctamente', usuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al aprobar usuario' });
    }
};

const rechazarUsuario = async (req, res) => {
    try {

        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
 
        await usuario.destroy();

        const emitirNotificacion = req.app.get("emitirNotificacion");
        emitirNotificacion("usuario-rechazado", {
            id,
            mensaje: "Un usuario ha sido rechazado y eliminado del sistema.",
        });

        res.json({ msg: 'Usuario rechazado y eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al rechazar usuario' });
    }
};

module.exports = {
    crearUsuario,
    login,
    logout,
    perfil,
    listarPendientes,
    aprobarUsuario,
    rechazarUsuario

};
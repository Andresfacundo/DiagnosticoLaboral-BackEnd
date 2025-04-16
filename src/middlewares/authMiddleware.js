const { verificarJWT } = require('../utils/jwt');
const tokenBlackList = require('../models/TokenBlackList')


const verificarAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        msg: 'No hay token en la petición'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar si el token está en la blacklist
    const enBlacklist = await tokenBlackList.findOne({ where: { token } });
    if (enBlacklist) {
      return res.status(401).json({
        msg: 'El token ha sido invalidado. Debes iniciar sesión nuevamente.'
      });
    }

    let payload;
    try {
      payload = verificarJWT(token);
    } catch (error) {
      return res.status(401).json({
        msg: 'Token no válido'
      });
    }

    req.usuario = payload;
    req.token = token;
    next();



  } catch (error) {
    console.log(error);
    res.status(401).json({
      msg: 'Token no válido o error en autenticación'
    });
  }
};

const esSuperAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(500).json({
      msg: 'Se quiere verificar el rol sin validar el token primero'
    });
  }
  
  if (req.usuario.rol !== 'superadmin' && req.usuario.rol !== 'admin') {
    return res.status(403).json({
      msg:'No tienes permisos para esta acción'
    });
  }
  
  next();
};

const esAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(500).json({
      msg: 'Se quiere verificar el rol sin validar el token primero'
    });
  }
  
  if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'superadmin') {
    return res.status(403).json({
      msg: 'No tienes permisos de administrador'
    });
  }
  
  next();
};

const esEmpleador = (req, res, next) => {
  if (!req.usuario) {
    return res.status(500).json({
      msg: 'Se quiere verificar el rol sin validar el token primero'
    });
  }
  
  if (req.usuario.rol !== 'empleador' && req.usuario.rol !== 'admin' && req.usuario.rol !== 'superadmin') {
    return res.status(403).json({
      msg: 'No tienes permisos de empleador'
    });
  }
  
  next();
};

module.exports = {
  verificarAuth,
  esSuperAdmin,
  esAdmin,
  esEmpleador
};
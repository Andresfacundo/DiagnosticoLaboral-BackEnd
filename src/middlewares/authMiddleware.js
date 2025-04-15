const { verificarJWT } = require('../utils/jwt');

const verificarAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        msg: 'No hay token en la petición'
      });
    }
    
    const payload = verificarJWT(token);
    if (!payload) {
      return res.status(401).json({
        msg: 'Token no válido'
      });
    }
    
    req.usuario = payload;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      msg: 'Token no válido'
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
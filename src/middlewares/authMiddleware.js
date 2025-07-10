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

const esAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(500).json({
      msg: 'Se quiere verificar el rol sin validar el token primero'
    });
  }
  
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      msg:'No tienes permisos para esta acción'
    });
  }
  
  next();
};

const asociado = (req, res, next) => {
  if (!req.usuario) {
    return res.status(500).json({
      msg: 'Se quiere verificar el rol sin validar el token primero'
    });
  }
  
  if (req.usuario.rol !== 'asociado') {
    return res.status(403).json({
      msg: 'No tienes permisos  para esta accion'
    });
  }
  
  next();
};

const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(500).json({ msg: 'No se ha validado el token.' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ msg: 'No tienes permisos para esta acción' });
    }

    next();
  };
};




module.exports = {
  verificarAuth,
  asociado,
  esAdmin,
  permitirRoles,
};
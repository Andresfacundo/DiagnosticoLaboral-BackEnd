const { v4: uuidv4 } = require("uuid");

function sessionIdMiddleware(req, res, next) {
  let sessionId = req.headers["sessionid"] || req.headers["sessionId"];

  if (!sessionId) {
    sessionId = uuidv4();
  }

  // siempre lo pones en la respuesta
  res.setHeader("sessionid", sessionId);
  req.sessionId = sessionId;

  next();
}

module.exports = sessionIdMiddleware;

import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate the JWT token in the Authorization header.
 * Expects the header format: 'Bearer <token>'
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  const secret = process.env.JWT_SECRET || 'surfconnect_super_secret_jwt_key_12345';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    
    // Attach the authenticated user info (id, name, role) to the request object
    req.user = user;
    next();
  });
};

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * @param {string[]} allowedRoles - List of roles permitted to access the route
 */
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
  };
};

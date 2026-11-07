const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Akses ditolak. Token tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nis: true,
        qrCodeMember: true,
        points: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Pengguna dengan token ini tidak lagi terdaftar.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak valid atau telah kadaluwarsa.',
      error: error.message,
    });
  }
};

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki hak akses untuk fitur ini.',
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
};

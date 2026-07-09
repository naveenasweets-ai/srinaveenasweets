import jwt from 'jsonwebtoken';
import AdminSchema from '../schemas/AdminSchema.js';
import CustomerSchema from '../schemas/CustomerSchema.js';

const requireAuth = async (req, res, next, schema) => {
  // verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await schema.findOne({ _id }).select('_id');
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

const requireAdminAuth = (req, res, next) => {
  return requireAuth(req, res, next, AdminSchema);
};

const requireCustomerAuth = (req, res, next) => {
  return requireAuth(req, res, next, CustomerSchema);
};

export { requireAdminAuth, requireCustomerAuth };

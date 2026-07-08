import AdminSchema from '../schemas/AdminSchema.js';
import { createToken } from '../utils/utils.js';

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await AdminSchema.login(email, password);

    // create a token
    const token = createToken(user._id);

    const fullName = user.fullName;
    const _id = user.id;

    res.status(200).json({
      user: { _id, fullName, email, token, role: 'admin' },
      message: 'Login successful',
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/** insert all questinos */
export async function signupUser(req, res) {
  const { fullName, email, password } = req.body;

  const adminSecret = req.headers['x-admin-secret'];

  if (adminSecret === undefined || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    console.log('Signup request received:', { fullName, email, password });
    const user = await AdminSchema.signup(fullName, email, password);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({
      user: { _id: user._id, fullName, email, token },
      message: 'Signup successful',
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

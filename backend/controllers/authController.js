import AdminSchema from '../schemas/AdminSchema.js';
import Customer from '../schemas/CustomerSchema.js';
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

export async function googleLogin(req, res) {
  const { uid, name, email } = req.body;

  if (!uid)
    return res
      .status(400)
      .json({ success: false, message: 'Missing user info' });

  try {
    const now = new Date();
    const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const saved = await Customer.findByIdAndUpdate(
      uid,
      {
        _id: uid,
        fullName: name,
        email: email,
        loggedInAtIST: istString,
        role: 'customer',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const token = createToken(saved._id);

    return res.json({ success: true, customer: saved, token });
  } catch (err) {
    console.error('Error saving Google user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

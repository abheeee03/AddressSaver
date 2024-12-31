const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new user
      const user = new User({ email, password });
      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  }
}

module.exports = AuthController; 
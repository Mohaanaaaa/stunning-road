const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const logger = require('./logger'); // Import the logger
const fs = require('fs');
const path = require('path'); // Ensure path is imported
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: 'admin-secret-key-Bengaluru',
    resave: false,
    saveUninitialized: true,
  })
);

// MySQL Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    logger.error({ message: 'Error connecting to MySQL', error: err });
    process.exit(1);
  }
  logger.info('Connected to MySQL');
  console.log('connect to Mysql');
});


// In-memory storage for demo purposes
const users = {}; // Email => { password, otp }
const otpExpiryTime = 300000; // OTP valid for 5 minutes

// Set up nodemailer transport (example for Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email from .env
    pass: process.env.EMAIL_PASS, // Your email password from .env
  }
});

// Helper function to log requests
function logRequest(req, res, statusCode, userId = null, email = null, error = null, executionTime = null) {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'AuthService',
    environment: 'production',
    endpoint: req.originalUrl,
    method: req.method,
    statusCode,
    clientIp: req.ip,
    userAgent: req.headers['user-agent'],
    userId,
    email,
    executionTime,
    error,
  };

  // Log as error if error is defined or status code is 500 or above
  if (error || statusCode >= 500) {
    logger.error(logData);
  } else {
    logger.info(logData);
  }
}

//Admin login route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const startTime = Date.now();

  if (!email || !password) {
    logRequest(req, res, 400);
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.query('SELECT * FROM admins WHERE email = ?', [email], async (err, results) => {
    if (err) {
      logRequest(req, res, 500);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      logRequest(req, res, 401, null, email, { message: 'Invalid credentials' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = results[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      logRequest(req, res, 401, null, email, { message: 'Invalid credentials' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.admin = { id: admin.id, email: admin.email };
    const executionTime = Date.now() - startTime;
    logRequest(req, res, 200, admin.id, admin.email, null, `${executionTime}ms`);
    res.json({ message: 'Login successful' });
    console.log('Login successful');
  });
});

// Admin logout route
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logRequest(req, res, 500);
      return res.status(500).json({ message: 'Logout failed' });
    }
    logRequest(req, res, 200);
    res.json({ message: 'Logout successful' });
    console.log('Logout successful');
  });
});

// Verify Email API
app.post('/api/verify-email', (req, res) => {
  const { email } = req.body;
  const startTime = Date.now();

  if (!email) {
    logRequest(req, res, 400);
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  db.query('SELECT * FROM admins WHERE email = ?', [email], (err, results) => {
    if (err) {
      logRequest(req, res, 500);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      logRequest(req, res, 404, null, email, { message: 'Email not found' });
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const executionTime = Date.now() - startTime;
    logRequest(req, res, 200, null, email, null, `${executionTime}ms`);
    res.json({ success: true, message: 'Email verified' });
  });
});

// Reset Password API
app.post('/api/forgot-password', async (req, res) => {
  const { email, password } = req.body;
  const startTime = Date.now();

  if (!email || !password) {
    logRequest(req, res, 400);
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query('UPDATE admins SET password = ? WHERE email = ?', [hashedPassword, email], (err, results) => {
    if (err) {
      logRequest(req, res, 500);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.affectedRows === 0) {
      logRequest(req, res, 404, null, email, { message: 'Email not found' });
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const executionTime = Date.now() - startTime;
    logRequest(req, res, 200, null, email, null, `${executionTime}ms`);
    res.json({ success: true, message: 'Password reset successfully' });
    console.log('Password reset successfully');
  });
});

// Log endpoint
app.post('/api/log', (req, res) => {
  const { level, message, data } = req.body;

  // Create log string
  const logMessage = `${new Date().toISOString()} [${level.toUpperCase()}]: ${message} ${
    data ? JSON.stringify(data) : ''
  }\n`;

  // Append log to a file in the current folder
  const logFilePath = path.join(__dirname, 'logs.txt'); // __dirname ensures it uses the current directory
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file', err);
      return res.status(500).send('Error writing to log file');
    }
    //console.log('Log saved:', logMessage.trim());
    //console.log('Log saved');
    res.status(200).send('Log saved successfully');
  });
});

// Endpoint to request OTP
app.post('/api/request-otp', async (req, res) => {
  const { email } = req.body;
  
  // Generate a random OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiry = Date.now() + otpExpiryTime;

  // Store OTP temporarily
  users[email] = { otp, expiry };

  // Send OTP via email
  try {
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });

    console.log({ message: 'OTP sent to your email!'});
    logRequest(req, res, 200, null, email,{ message: 'OTP sent to your email!' }, null, `${executionTime}ms`);
    return res.status(200).json({ message: 'OTP sent to your email!' });

  } catch (error) {
    console.error(error);
    //console.log({ error: 'Failed to send OTP' });
    logRequest(req, res,{message: 'Failed to send OTP'}, 500);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Endpoint to verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  
  const user = users[email];
  if (!user) {
    logRequest(req, res, 404, null, email, { message: 'No OTP sent to this email.' });
    return res.status(400).json({ error: 'No OTP sent to this email.' });
  }

  if (Date.now() > user.expiry) {
    logRequest(req, res, 404, null, email, { message: 'OTP has expired.' });
    return res.status(400).json({ error: 'OTP has expired.' });
  }

  if (user.otp !== otp) {
    logRequest(req, res, 404, null, email, { message: 'Invalid OTP.' });
    return res.status(400).json({ error: 'Invalid OTP.' });
  }

  // OTP is verified successfully
  delete users[email]; // Clear OTP from memory
  logRequest(req, res, 200, null, email,{message:'OTP verified successfully! You can now reset your password.'}, `${executionTime}ms`);
  return res.status(200).json({ message: 'OTP verified successfully! You can now reset your password.' });
});

// Endpoint to reset the password
app.post('/api/reset-password', (req, res) => {
  const { email, password } = req.body;
  
  // In a real application, you would have a user database and additionally hash the password
  users[email] = { password }; // Store the new password (for demo purposes)
  
  console.log({message:'Password reset successfully'});
  logRequest(req, res, 200, null, email,{message:'Password reset successfully!'},null, `${executionTime}ms`);
  return res.status(200).json({ message: 'Password reset successfully!' });
});

// Check if admin is authenticated
app.get('/api/check-auth', (req, res) => {
  const startTime = Date.now();
  if (req.session.admin) {
    const executionTime = Date.now() - startTime;
    logRequest(req, res, 200, req.session.admin.id, req.session.admin.email, null, `${executionTime}ms`);
    res.json({ authenticated: true, admin: req.session.admin });
  } else {
    const executionTime = Date.now() - startTime;
    logRequest(req, res, 401);
    res.json({ authenticated: false });
  }
});

// Start server
const PORT = process.env.PORT; // Use the port from .env
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
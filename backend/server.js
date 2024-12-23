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
  host: 'localhost',
  user: 'root',
  password: 'Welcome@123',
  database: 'admin',
});

db.connect((err) => {
  if (err) {
    logger.error({ message: 'Error connecting to MySQL', error: err });
    process.exit(1);
  }
  logger.info('Connected to MySQL');
  console.log('connect to Mysql');
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

/*app.post('/api/login', (req, res) => {
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

    // Generate JWT
    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
      expiresIn: '1h', // Token expiry time
    });

    const executionTime = Date.now() - startTime;
    logRequest(req, res, 200, admin.id, admin.email, null, `${executionTime}ms`);
    
    // Send back the token
    res.json({ token }); // Respond with the JWT
    console.log('Login successful');
  });
});

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from header

  if (!token) {
    return res.sendStatus(403); // Forbidden
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user; // Attach user data to the request
    next();
  });
};

// Protected route example
app.get('/api/protected', authenticateJWT, (req, res) => {
  res.send('This is a protected route, and you are authenticated!');
});*/


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
    console.log('Log saved');
    res.status(200).send('Log saved successfully');
  });
});

//OTP send route
app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Step 1: Check if email exists in `admins` table
  const checkAdminQuery = 'SELECT * FROM admins WHERE email = ?';
  db.query(checkAdminQuery, [email], (adminErr, adminResults) => {
    if (adminErr) {
      console.error('Error querying admins table:', adminErr);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (adminResults.length === 0) {
      return res.status(404).json({ message: 'Email not found in admin records' });
    }

    // Step 2: Ensure email exists in `users` table
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], (userErr, userResults) => {
      if (userErr) {
        console.error('Error querying users table:', userErr);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (userResults.length === 0) {
        // Insert email into `users` table if not found
        const insertUserQuery = 'INSERT INTO users (email) VALUES (?)';
        db.query(insertUserQuery, [email], (insertErr) => {
          if (insertErr) {
            console.error('Error inserting email into users table:', insertErr);
            return res.status(500).json({ message: 'Internal server error' });
          }
          generateAndSendOtp(email, res); // Proceed to OTP generation and email
        });
      } else {
        generateAndSendOtp(email, res); // Proceed to OTP generation and email
      }
    });
  });
});

function generateAndSendOtp(email, res) {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // Convert expiry to DATETIME

  // Save OTP and expiry in `users` table
  const saveOtpQuery = 'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?';
  db.query(saveOtpQuery, [otp, expiry, email], async (saveErr) => {
    if (saveErr) {
      console.error('Error updating users table with OTP:', saveErr);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      port:587,
      secure:false,
      auth: { user: 'mohankumer8@gmail.com', pass: 'pdmn mdsj nkzi tjgl' }, // Replace with secure credentials
    });

    const mailOptions = {
      from: 'no-reply@example.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 5 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}: ${otp}`);
      res.status(200).json({ message: `OTP sent to ${email}` });
    } catch (mailErr) {
      console.error('Error sending email:', mailErr);
      res.status(500).json({ message: 'Error sending OTP email' });
    }
  });
}

// Route to verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body; // Get email and OTP from request body

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  // Use a prepared statement
  const verifyOtpQuery = 'SELECT otp_expiry FROM users WHERE email = ? AND otp = ?';
  db.query({ sql: verifyOtpQuery, values: [email, otp] }, (err, results) => {
    if (err) {
      console.error('Error querying users table:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Check if we found a valid OTP
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const { otp_expiry } = results[0];
    const currentTime = new Date();

    // Check if the OTP has expired
    if (currentTime > new Date(otp_expiry)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Start a transaction
    db.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Clear OTP after successful verification
      const clearOtpQuery = 'UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?';
      db.query(clearOtpQuery, [email], (clearErr) => {
        if (clearErr) {
          console.error('Error clearing OTP in users table:', clearErr);
          db.rollback(() => {});
          return res.status(500).json({ message: 'Internal server error' });
        }

        // Commit the transaction
        db.commit((commitErr) => {
          if (commitErr) {
            console.error('Error committing transaction:', commitErr);
            db.rollback(() => {});
            return res.status(500).json({ message: 'Internal server error' });
          }

          // Respond to indicate OTP is valid
          res.status(200).json({ message: 'OTP is valid. Please enter your new password.' });
        });
      });
    });
  });
});

// Route to reset password
app.post('/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Email, new password, and confirmation password are required' });
  }

  // Check if the new password and confirm password match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New password and confirmation password do not match' });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in admins table associated with the email
    const updateQuery = 'UPDATE admins SET password = ? WHERE email = ?';
    db.query(updateQuery, [hashedPassword, email], (updateErr, results) => {
      if (updateErr) {
        console.error('Error updating password in admins table:', updateErr);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // If no rows were affected, the email might not exist in admins table
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Email not found in admins table' });
      }

      res.status(200).json({ message: 'Password has been reset successfully.' });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
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
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
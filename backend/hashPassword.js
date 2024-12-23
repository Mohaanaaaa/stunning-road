// hashPassword.js
const bcrypt = require('bcrypt');
const readline = require('readline');

// Create an interface for reading input from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to hash the password
async function hashPassword(password) {
  const saltRounds = 10; // You can adjust the salt rounds for more security
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed Password:', hashedPassword);
  } catch (error) {
    console.error('Error hashing password:', error.message);
  } finally {
    rl.close(); // Close the readline interface
  }
}

// Prompt the user for a password
rl.question('Enter a password to hash: ', (password) => {
  hashPassword(password);
});
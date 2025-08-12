const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail", // or your SMTP provider
//   auth: {
//     user: "your-email@gmail.com",
//     pass: "your-app-password", // use app password if 2FA is on
//   },
// });
console.log("USER:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true, // Use SSL
  port: 465,    // Secure port for SMTP
  auth: {
    user: process.env.EMAIL_USER,   // Email address from the .env file
    pass: process.env.EMAIL_PASS,   // App password or email password from the .env file
  },
  logger: true,  // Optional: Enables debug logging (set to true for more detailed logs)
  debug: true,   // Optional: Enable SMTP debugging
});

/**
 * Generate email content based on type
 */
function getEmailTemplate(type, data) {
  if (type === "create") {
    return {
      subject: "Your Account Credentials",
      html: `
        <h2>Welcome, ${data.name}</h2>
        <p>Your account has been created.</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
        <p>Use this to login to your account.</p>
      `,
    };
  }

  if (type === "reset") {
  return {
    subject: "Password Reset",
    html: `
      <h2>Hello, ${data.name}</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="http://localhost:3000/reset-password/${data.password}">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    `
  };
}

  return {
    subject: "Notification",
    html: "<p>This is a default message.</p>",
  };
}

/**
 * Send email function
 */
const sendEmail = async (to, type, data) => {
  const { subject, html } = getEmailTemplate(type, data);

  await transporter.sendMail({
    from: '"TaskFlow" <your-email@gmail.com>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;

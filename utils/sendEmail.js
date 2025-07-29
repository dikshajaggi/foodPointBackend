// utils/sendEmail.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",         // no-reply email
    pass: "your_email_app_password",      // use App Password if 2FA is on
  },
});

const sendVerificationEmail = async ({ to, type, restaurantName }) => {
  let subject = "";
  let html = "";

  const adminEmail = "admin@foodpoint.com";

  switch (type) {
    case "verified":
      subject = "✅ Your Restaurant Verification is Complete – Welcome to FoodPoint!";
      html = `
        <p>Dear ${restaurantName},</p>
        <p>Congratulations! 🎉</p>
        <p>Your restaurant has been successfully verified and is now live on the FoodPoint platform.</p>
        <p>If you have any questions, please contact our admin: <b>${adminEmail}</b></p>
        <p style="color:gray;">(This is an automated email – please do not reply)</p>
        <p>Best regards,<br/>Team FoodPoint</p>
      `;
      break;

    case "rejected":
      subject = "⚠️ Restaurant Verification Rejected – Action Required";
      html = `
        <p>Dear ${restaurantName},</p>
        <p>We regret to inform you that your restaurant’s verification has been <b>rejected</b>.</p>
        <p>Please contact our admin for more details: <b>${adminEmail}</b></p>
        <p style="color:gray;">(This is an automated email – please do not reply)</p>
        <p>Team FoodPoint</p>
      `;
      break;

    case "discontinued":
      subject = "🚫 Restaurant Removed from FoodPoint Platform";
      html = `
        <p>Dear ${restaurantName},</p>
        <p>Your restaurant has been <b>discontinued</b> from the FoodPoint platform.</p>
        <p>If you think this is a mistake, contact our admin: <b>${adminEmail}</b></p>
        <p style="color:gray;">(This is an automated email – please do not reply)</p>
        <p>Team FoodPoint</p>
      `;
      break;

    default:
      throw new Error("Invalid email type");
  }

  await transporter.sendMail({
    from: '"FoodPoint - No Reply" <your_email@gmail.com>',
    to,
    subject,
    html,
  });
};

module.exports = sendVerificationEmail;

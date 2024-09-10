import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SERVER_URL = process.env.SERVER_URL;
const EMAIL_CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const EMAIL_CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
const EMAIL_REDIRECT_URI = process.env.EMAIL_REDIRECT_URI;
const EMAIL_REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

const oAuth2Client = new google.auth.OAuth2(
  EMAIL_CLIENT_ID,
  EMAIL_CLIENT_SECRET,
  EMAIL_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: EMAIL_REFRESH_TOKEN });

async function sendPasswordResetEmail(email, resetToken) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: EMAIL_CLIENT_ID,
        clientSecret: EMAIL_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `Yourstruel <${EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      text: " Admin",
      html: `
      <p>Hello,</p>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p><a href="${SERVER_URL}/reset-password/${email}/${resetToken}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Click here</a> to reset your password.</p>
      <p>Best regards,<br/> Maths Quiz</p>
      <style>
        
        body {
          font-family: Arial, sans-serif;
          font-size: 16px;
        }
        p {
          margin-bottom: 10px;
        }
        a.button {
          display: inline-block;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
        }
      </style>
  
    `,
  };

    const result = await transport.sendMail(mailOptions);
    //console.log("Email sent successfully:", "result ",result);
    return result;
  } catch (error) {
    console.log("send email some error", error);
    return error;
  }
}

export { sendPasswordResetEmail };

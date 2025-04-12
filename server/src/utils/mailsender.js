import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config({
	path: "./.env",
});

const sendOtpMail = async (to, otp) => {
	// Generate a 6-digit OTP

	const transporter = nodemailer.createTransport({
		service: "gmail", // Using Gmail as the email service
		secure: true,
		port: 465,
		auth: {
			user: process.env.MAIL_ID,
			pass: process.env.MAIL_PASSWORD,
		},
	});

	const info = await transporter.sendMail({
		from: process.env.MAIL_ID, // Sender address
		to, // Recipient
		subject: "Your OTP Code for Secure Login", // Professional subject line
		text: `Dear user,\n\nYour One-Time Password (OTP) is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share it with anyone.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nYour Company Name`, // Plain text fallback
		html: `
		<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
			<h2 style="color: #0d6efd;">Your One-Time Password (OTP)</h2>
			<p>Dear User,</p>
			<p>Your OTP for secure login is:</p>
			<h3 style="background: #f3f3f3; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h3>
			<p>This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
			<p>If you did not request this, please ignore this email.</p>
			<br>
			<p>Best regards,</p>
			<p><strong>PAT @ PERSONAL AI TUTOR PVT. LTD. </strong></p>
		</div>
	  `, // HTML body
	});

	console.log("OTP Email sent: %s", info.messageId);
};

export { sendOtpMail };

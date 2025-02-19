import { FRONTEND_URL } from "../config/variables.js";
import { sendEmail } from "../services/EmailService.js";

export const sendResetPasswordEmail = async (email, id, code) => {
    try {
        const subject = 'Reset your password';
        const html = `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="font-size: 24px; font-weight: bold; color: #333333; margin-bottom: 20px;">Reset Your Password</h1>
                <p style="font-size: 16px; color: #555555; margin-bottom: 30px;">
                    We received a request to reset your password. If you did not request this change, please ignore this email.
                </p>
                <a 
                    href="${FRONTEND_URL}/reset-password?oobCode=${code}&secretUserID=${id}" 
                    style="display: block; width: 100%; text-align: center; background-color: #1D4ED8; color: #ffffff; text-decoration: none; font-weight: bold; padding: 15px 0; border-radius: 4px;"
                    >
                        Reset Password
                </a>
                <p style="font-size: 14px; color: #888888; margin-top: 30px;">
                    If you have any questions, feel free to contact our support team.
                </p>
                <p style="font-size: 12px; color: #aaaaaa; text-align: center; margin-top: 20px;">
                    &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
                </p>
            </div>
        `;

        await sendEmail(email, subject, html);

    } catch (error) {
        throw new Error(error.message);
    }
}
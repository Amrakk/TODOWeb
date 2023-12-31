import { Request, Response } from "express";
import database from "../../../database/db.js";
import { valEmail } from "../../../middleware/validateInput.js";
import sendForgotOTP from "../../../middleware/sendForgotOTP.js";

export default async function forgotPassword(req: Request, res: Response) {
    const { email } = req.body ?? "";

    if (!email) return res.status(400).json({ message: "Email not provided" });
    if (!valEmail(email))
        return res.status(400).json({ message: "Invalid email" });

    const user = await database.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isSent = await sendForgotOTP(email);
    if (!isSent)
        return res.status(500).json({
            message: "Error sending OTP verification email",
        });

    return res.status(200).json({ message: "Email sent" });
}

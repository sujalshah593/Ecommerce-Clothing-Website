import { hash } from "bcryptjs";
import User from "../Models/User.js";
import generateToken from "../utils/generateToken.js";
import { enqueueEmail } from "../Queue/emailQueue.js";
import generateOTP from "../utils/generateOtp.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    if (!userExists.isVerified) {
      userExists.name = name;
      userExists.password = password;
      const otp = generateOTP();
      userExists.otp = otp;
      userExists.otpExpires = Date.now() + 10 * 60 * 1000;
      await userExists.save();

      await enqueueEmail("emailJob", {
        to: userExists.email,
        subject: "Verify your account - OTP",
        html: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes</p>`,
      });
    }
    return res.status(201).json({
      message: "Registration successful. Please login to continue."
    });
  }

  const user = await User.create({ name, email, password});

  await enqueueEmail("emailJob", {
    to: user.email,
    subject: "Welcome to Shreeji Cloth Store",
    html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome, ${user.name}!</h2>
          <p>Thanks for registering at <b>Shreeji Store</b>.</p>
          <p>Your account has been created successfully.</p>
          <br />
          <p>Happy Shopping! 🛍️</p>
          <p><b>Shreeji Team</b></p>
        </div>
      `,
  });

  res.status(201).json({
    message: "Registration successful. Please login to continue."
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const user = await User.findOne({ email });

  if (!user || user.googleId) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if(!user.isVerified){
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await enqueueEmail("emailJob", {
      to: user.email,
      subject: "Verify your account - OTP",
      html: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes</p>`,
    });

    return res.status(403).json({
      requiresOtp: true,
      userId: user._id,
      email: user.email,
      message: "OTP sent to your email"
    });
  }
  if (user && user.password && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }

  
};

export const verifyOtp = async (req, res) => {
  const { userId, otp} = req.body;

  const user = await User.findById(userId);
  if(!user || user.otp !== otp || user.otpExpires < Date.now())
    return res.status(400).json({ message: "Invalid OTP"});

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();
  
  res.json({message: "OTP verified"});
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: "OTP resent" });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await enqueueEmail("emailJob", {
    to: email,
    subject: "Resend OTP",
    html: `<h2>Your OTP is ${otp}</h2>`,
  });

  res.json({ message: "OTP resent" });
};



export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;

    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericMessage = "If the account exists, a password reset instruction has been sent.";

  if (typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const user = await User.findOne({ email });
  if(!user) return res.json({ message: genericMessage });

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();
const resetUrl = `http://localhost:5173/login?resetToken=${resetToken}`;

  await enqueueEmail("emailJob", {
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link is valid for 1 hour.</p>
    `,
  }); 
  res.json({ message: genericMessage });
}

export const resetPassowrd = async (req, res) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if(!user) return res.status(400).json({ message: "Invalid or expired token"});

user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: "Password reset successful" });
};

export const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.addresses.push(req.body);
  await user.save();

  res.json(user.addresses);
};

export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.addresses = user.addresses.filter(
    (a) => a._id.toString() !== req.params.id
  );
  await user.save();
  res.json(user.addresses);
}

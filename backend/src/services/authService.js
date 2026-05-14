import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// Read at call-time, not at import-time, so dotenv has already run
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment");
  return secret;
}

const JWT_EXPIRES_IN = () => process.env.JWT_EXPIRES_IN || "7d";

function generateToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN() });
}

export async function signupService(userData) {
  const { name, email, password, role } = userData;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw { status: 409, message: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash: hashedPassword,
    role,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}

export async function loginService(userData) {
  const { email, password } = userData;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }

  if (user.status !== "active") {
    throw { status: 403, message: "Account is suspended or deleted" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw { status: 401, message: "Invalid email or password" };
  }

  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
}

export async function getWeb3Nonce(walletAddress) {
  walletAddress = walletAddress.toLowerCase();
  
  try {
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = new User({
        walletAddress,
        email: `${walletAddress}@web3.local`,
        name: "Web3 User",
        role: "donor",
        nonce: Math.floor(Math.random() * 1000000).toString()
      });
      await user.save();
    } else {
      user.nonce = Math.floor(Math.random() * 1000000).toString();
      await user.save();
    }
    return { nonce: user.nonce };
  } catch (error) {
    console.error("getWeb3Nonce Database Error:", error);
    throw { status: 500, message: "Database operation failed." };
  }
}

export async function web3Login(walletAddress, signature) {
  walletAddress = walletAddress.toLowerCase();
  let user;
  
  try {
    user = await User.findOne({ walletAddress });
  } catch (error) {
    console.error("web3Login Database Query Error:", error);
    throw { status: 500, message: "Database query failed." };
  }
  
  if (!user) {
    throw { status: 404, message: "User not found for this wallet address. Please request a nonce first." };
  }

  if (user.status !== "active") {
    throw { status: 403, message: "Account is suspended or deleted" };
  }

  // Define the message exactly how the frontend signs it
  const message = `Sign this message to authenticate with UnityGive.\n\nNonce: ${user.nonce}`;
  
  let recoveredAddress;
  try {
    recoveredAddress = ethers.verifyMessage(message, signature);
  } catch (error) {
    throw { status: 400, message: "Invalid signature format" };
  }

  if (recoveredAddress.toLowerCase() !== walletAddress) {
    throw { status: 401, message: "Signature verification failed" };
  }

  try {
    // Update nonce to prevent replay attacks
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    user.lastLogin = new Date();
    await user.save();
  } catch (error) {
    console.error("web3Login User Update Error:", error);
    throw { status: 500, message: "Failed to update user session." };
  }

  let token;
  try {
    token = generateToken({
      id: user._id,
      walletAddress: user.walletAddress,
      role: user.role,
    });
  } catch (error) {
    console.error("web3Login Token Generation Error:", error);
    throw { status: 500, message: "Failed to generate authentication token." };
  }

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      walletAddress: user.walletAddress,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
}

export async function forgotPasswordService(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw { status: 404, message: "There is no user with that email address." };
  }

  // Generate Reset Token (raw)
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash Token securely and set into User object
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  await user.save();

  // Create reset URL (This sends the token RAW, so the user can send it back to the backend. Backend will rehash to compare)
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'UnityGive - Password Reset Request',
      message
    });

    return { message: "An email has been sent with recovery instructions." };
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.error("Email could not be sent", err);
    throw { status: 500, message: "Email could not be sent. Please try again later." };
  }
}

export async function resetPasswordService(token, newPassword) {
  // We recreate the hash from the raw token provided to lookup the user
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw { status: 400, message: "Invalid or expired reset token." };
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: "Password has been successfully updated!" };
}

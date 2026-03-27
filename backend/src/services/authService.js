import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

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
  let user = await User.findOne({ walletAddress });
  
  if (!user) {
    // Check if a user with this email but without wallet exists
    // (We skip this complex merge logic. Just create a bare user with wallet address)
    user = new User({
      walletAddress,
      name: "Web3 User",
      role: "donor",
      nonce: Math.floor(Math.random() * 1000000).toString()
    });
    await user.save();
  } else {
    // Regenerate nonce just in case
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();
  }

  return { nonce: user.nonce };
}

export async function web3Login(walletAddress, signature) {
  walletAddress = walletAddress.toLowerCase();
  const user = await User.findOne({ walletAddress });
  
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
    recoveredAddress = ethers.utils.verifyMessage(message, signature);
  } catch (error) {
    throw { status: 400, message: "Invalid signature format" };
  }

  if (recoveredAddress.toLowerCase() !== walletAddress) {
    throw { status: 401, message: "Signature verification failed" };
  }

  // Update nonce to prevent replay attacks
  user.nonce = Math.floor(Math.random() * 1000000).toString();
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken({
    id: user._id,
    walletAddress: user.walletAddress,
    role: user.role,
  });

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
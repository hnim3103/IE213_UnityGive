import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
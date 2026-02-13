import { validateEmail, validatePassword } from './validators/AuthValidator';
import { hashPassword, comparePassword, generateSalt } from './crypto/PasswordHasher';
import { generateToken, verifyToken } from './crypto/TokenManager';
import { findUserByEmail, createUser, updateLastLogin } from './database/UserRepository';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function registerUser(request: RegisterRequest): Promise<string> {
  // Step 1: Validate email
  if (!validateEmail(request.email)) {
    throw new Error('Invalid email format');
  }

  // Step 2: Validate password strength
  const passwordValidation = validatePassword(request.password);
  if (!passwordValidation.isValid) {
    throw new Error(`Weak password: ${passwordValidation.errors.join(', ')}`);
  }

  // Step 3: Check if user exists
  const existingUser = await findUserByEmail(request.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Step 4: Generate salt and hash password
  const salt = generateSalt();
  const hashedPassword = await hashPassword(request.password, salt);

  // Step 5: Create user record
  const userId = await createUser({
    email: request.email,
    passwordHash: hashedPassword,
    salt: salt,
    name: request.name,
    createdAt: new Date(),
  });

  // Step 6: Generate JWT token
  const token = generateToken({
    userId,
    email: request.email,
  });

  // Step 7: Send welcome email
  await sendWelcomeEmail(request.email, request.name);

  return token;
}

export async function loginUser(request: LoginRequest): Promise<string> {
  // Step 1: Validate input
  if (!validateEmail(request.email)) {
    throw new Error('Invalid email');
  }

  // Step 2: Find user
  const user = await findUserByEmail(request.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Step 3: Verify password
  const isValidPassword = await comparePassword(
    request.password,
    user.passwordHash
  );

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Step 4: Update last login
  await updateLastLogin(user.id);

  // Step 5: Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return token;
}

export async function verifyUserToken(token: string): Promise<boolean> {
  try {
    const payload = verifyToken(token);
    return !!payload;
  } catch (error) {
    return false;
  }
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  // Step 1: Get user
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Step 2: Verify old password
  const isValid = await comparePassword(oldPassword, user.passwordHash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Step 3: Validate new password
  const validation = validatePassword(newPassword);
  if (!validation.isValid) {
    throw new Error(`New password is weak: ${validation.errors.join(', ')}`);
  }

  // Step 4: Hash new password
  const salt = generateSalt();
  const hashedPassword = await hashPassword(newPassword, salt);

  // Step 5: Update password
  await updateUserPassword(userId, hashedPassword, salt);

  // Step 6: Send notification
  await sendPasswordChangedEmail(user.email);
}

async function getUserById(userId: string): Promise<any> {
  // Implementation
  return null;
}

async function updateUserPassword(
  userId: string,
  hash: string,
  salt: string
): Promise<void> {
  // Implementation
}

async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  // Implementation
}

async function sendPasswordChangedEmail(email: string): Promise<void> {
  // Implementation
}

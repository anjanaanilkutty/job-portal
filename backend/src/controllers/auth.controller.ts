import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { ApiError } from '../utils/apiError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

async function issueTokens(user: User) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });
  // Persist a hash of the refresh token so it can be revoked on logout.
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();
  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role: role ?? 'user' });
  const tokens = await issueTokens(user);

  res.status(201).json({
    success: true,
    data: { user: user.toSafeJSON(), ...tokens },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokens(user);
  res.json({ success: true, data: { user: user.toSafeJSON(), ...tokens } });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token is invalid or expired');
  }

  const user = await User.findByPk(payload.sub);
  if (!user || !user.refreshTokenHash) {
    throw ApiError.unauthorized('Session no longer valid');
  }

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!matches) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  const tokens = await issueTokens(user);
  res.json({ success: true, data: { user: user.toSafeJSON(), ...tokens } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (userId) {
    await User.update({ refreshTokenHash: null }, { where: { id: userId } });
  }
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findByPk(req.user!.sub);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  res.json({ success: true, data: { user: user.toSafeJSON() } });
}

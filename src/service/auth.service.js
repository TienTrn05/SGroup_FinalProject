import defaultUsersRepository from "../repository/users.repository.js";
import defaultAuthSessionsRepository from "../repository/authSessions.repository.js";
import defaultUsersService from "./users.service.js";
import { randomUUID } from "node:crypto";
import { verifyPassword } from "../utils/passwordhelper.js";
import { signToken, verifyTokenPayload } from "../utils/jwt.helper.js";
import { UnauthorizedError } from "../core/error.response.js";

export class AuthService {
  constructor({
    usersRepository = defaultUsersRepository,
    usersService = defaultUsersService,
    authSessionsRepository = defaultAuthSessionsRepository,
  } = {}) {
    this.usersRepository = usersRepository;
    this.usersService = usersService;
    this.authSessionsRepository = authSessionsRepository;
  }

  register(data) {
    return this.usersService.createUser(data);
  }

  async login({ email, password }) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new UnauthorizedError("Invalid email or password");
    }
    const { password_hash, ...publicUser } = user;
    const sessionId = randomUUID();
    const accessToken = signToken(user.id, "access", sessionId);
    const refreshToken = signToken(user.id, "refresh", sessionId);
    const { exp } = verifyTokenPayload(refreshToken, "refresh");
    await this.authSessionsRepository.create({
      id: sessionId,
      userId: user.id,
      expiresAt: new Date(exp * 1000),
    });
    return {
      user: publicUser,
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedError("Account no longer exists");
    return user;
  }

  async refresh(refreshToken) {
    const { sub, sid } = verifyTokenPayload(refreshToken, "refresh");
    const userId = Number(sub);
    await this.#requireActiveSession(sid, userId);
    await this.getMe(userId);
    return { accessToken: signToken(userId, "access", sid) };
  }

  async authenticateAccessToken(accessToken) {
    const { sub, sid } = verifyTokenPayload(accessToken, "access");
    const userId = Number(sub);
    await this.#requireActiveSession(sid, userId);
    return this.getMe(userId);
  }

  async logout(refreshToken) {
    // The refresh token authenticates logout even when the access token expired.
    const { sub, sid } = verifyTokenPayload(refreshToken, "refresh");
    await this.authSessionsRepository.revoke(sid, Number(sub));
  }

  async #requireActiveSession(sessionId, userId) {
    const session = await this.authSessionsRepository.findActive(sessionId, userId);
    if (!session) throw new UnauthorizedError("Session expired or logged out");
  }
}

export default new AuthService();

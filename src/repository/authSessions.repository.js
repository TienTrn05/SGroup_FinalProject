import { IsNull, MoreThan } from "typeorm";
import { AuthSession } from "../entities/authSession.entity.js";
import { BaseRepository } from "./base.repository.js";

export class AuthSessionsRepository extends BaseRepository {
  constructor(database) {
    super(AuthSession, database);
  }

  async create({ id, userId, expiresAt }) {
    return (
      await this.insertRows({ id, user_id: userId, expires_at: expiresAt })
    )[0];
  }

  findActive(id, userId) {
    return this.repository.findOneBy({
      id,
      user_id: userId,
      revoked_at: IsNull(),
      expires_at: MoreThan(new Date()),
    });
  }

  async revoke(id, userId) {
    await this.repository.update(
      { id, user_id: userId, revoked_at: IsNull() },
      { revoked_at: new Date() },
    );
  }
}

export default new AuthSessionsRepository();

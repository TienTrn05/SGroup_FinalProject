import { randomUUID } from "node:crypto";
import { AuthSession } from "../entities/authSession.entity.js";
import { BaseFactory } from "./base.factory.js";

export class AuthSessionFactory extends BaseFactory {
  constructor(database) {
    super(AuthSession, database, ["user_id"]);
  }

  definition() {
    return {
      id: randomUUID(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      revoked_at: null,
    };
  }
}

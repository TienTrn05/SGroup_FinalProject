import { randomUUID } from "node:crypto";
import { User } from "../entities/user.entity.js";
import { hashPassword } from "../utils/passwordhelper.js";
import { BaseFactory } from "./base.factory.js";

export class UserFactory extends BaseFactory {
  constructor(database) {
    super(User, database);
  }

  definition(sequence) {
    return {
      name: `Sample user ${sequence}`,
      email: `sample-${randomUUID()}@example.com`,
      role: "MEMBER",
    };
  }

  async build({ password = "SamplePassword123!", ...overrides } = {}) {
    return super.build({
      ...overrides,
      password_hash: overrides.password_hash ?? (await hashPassword(password)),
    });
  }
}

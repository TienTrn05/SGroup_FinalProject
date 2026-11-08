import { ILike, Not } from "typeorm";
import { User } from "../entities/user.entity.js";
import { BaseRepository } from "./base.repository.js";

// Escape LIKE metacharacters so email lookup remains an exact match.
const exactEmail = (email) => ILike(email.replace(/[\\%_]/g, "\\$&"));

export class UsersRepository extends BaseRepository {
  constructor(database) {
    super(User, database);
  }

  findAll() {
    return this.repository.find({ order: { id: "ASC" } });
  }

  findByEmail(email) {
    return this.repository.findOne({
      where: { email: exactEmail(email) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
        password_hash: true,
      },
    });
  }

  findById(id) {
    return this.repository.findOneBy({ id });
  }

  emailExists(email, excludedId = null) {
    return this.repository.existsBy({
      email: exactEmail(email),
      ...(excludedId === null ? {} : { id: Not(excludedId) }),
    });
  }

  async create({ name, email, password_hash, role = "MEMBER" }) {
    return (await this.insertRows({ name, email, password_hash, role }))[0];
  }

  update(id, changes) {
    return this.updateRow(id, changes, [
      "name",
      "email",
      "password_hash",
      "role",
    ]);
  }

  remove(id) {
    return this.deleteRow({ id });
  }
}

export default new UsersRepository();

import AppDataSource from "../config/data-source.js";

export class BaseFactory {
  constructor(entity, database = AppDataSource, requiredIds = []) {
    this.entity = entity;
    this.database = database;
    this.requiredIds = requiredIds;
    this.sequence = 0;
  }

  definition() {
    return {};
  }

  async build(overrides = {}) {
    const data = { ...await this.definition(++this.sequence), ...overrides };
    for (const field of this.requiredIds) {
      if (!Number.isSafeInteger(data[field]) || data[field] <= 0) {
        throw new TypeError(`${this.constructor.name} requires a positive integer ${field}`);
      }
    }
    return data;
  }

  async buildMany(count, overrides = {}) {
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new TypeError("Factory count must be a non-negative integer");
    }
    const rows = [];
    for (let index = 0; index < count; index++) {
      rows.push(await this.build(overrides));
    }
    return rows;
  }

  async create(overrides = {}) {
    const data = await this.build(overrides);
    return this.database.getRepository(this.entity).save(data);
  }

  async createMany(count, overrides = {}) {
    const rows = await this.buildMany(count, overrides);
    if (rows.length === 0) return [];
    return this.database.getRepository(this.entity).save(rows);
  }
}

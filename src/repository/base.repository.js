import AppDataSource from "../config/data-source.js";

export class BaseRepository {
  constructor(entity, database = AppDataSource) {
    this.entity = entity;
    this.database = database;
  }

  get repository() {
    return this.database.getRepository(this.entity);
  }

  // RETURNING keeps mutations atomic; hydrate dates as TypeORM does for find().
  returningRows(result) {
    const columns = this.repository.metadata.columns.filter(
      (column) => column.isSelect,
    );
    return result.raw.map((row) =>
      Object.fromEntries(
        columns.map((column) => [
          column.propertyName,
          this.database.driver.prepareHydratedValue(
            row[column.databaseName],
            column,
          ),
        ]),
      ),
    );
  }

  get returningColumns() {
    return this.repository.metadata.columns
      .filter((column) => column.isSelect)
      .map((column) => column.propertyName);
  }

  async insertRows(values) {
    if (Array.isArray(values) && values.length === 0) return [];
    const result = await this.repository
      .createQueryBuilder()
      .insert()
      .values(values)
      .returning(this.returningColumns)
      .execute();
    return this.returningRows(result);
  }

  async updateRow(id, changes, allowedFields) {
    const values = Object.fromEntries(
      allowedFields
        .filter((field) => changes[field] !== undefined)
        .map((field) => [field, changes[field]]),
    );
    if (Object.keys(values).length === 0) return this.findById(id);
    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set(values)
      .where({ id })
      .returning(this.returningColumns)
      .execute();
    return this.returningRows(result)[0] || null;
  }

  async deleteRow(where) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where(where)
      .returning(this.returningColumns)
      .execute();
    return this.returningRows(result)[0] || null;
  }
}

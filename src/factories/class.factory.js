import { Class } from "../entities/class.entity.js";
import { BaseFactory } from "./base.factory.js";

export class ClassFactory extends BaseFactory {
  constructor(database) {
    super(Class, database);
  }

  definition(sequence) {
    return {
      name: `Sample class ${sequence}`,
      description: "Sample class for learning and testing.",
      start_date: null,
      end_date: null,
      mentor_id: null,
    };
  }
}

import { Assignment } from "../entities/assignment.entity.js";
import { BaseFactory } from "./base.factory.js";

export class AssignmentFactory extends BaseFactory {
  constructor(database) {
    super(Assignment, database, ["class_id"]);
  }

  definition(sequence) {
    return {
      title: `Sample assignment ${sequence}`,
      description: "Sample assignment description.",
      deadline: null,
      maximum_score: "100.00",
    };
  }
}

import { Submission } from "../entities/submission.entity.js";
import { BaseFactory } from "./base.factory.js";

export class SubmissionFactory extends BaseFactory {
  constructor(database) {
    super(Submission, database, ["assignment_id", "member_id"]);
  }

  definition(sequence) {
    return {
      content: `Sample submission ${sequence}`,
      repository_url: null,
      score: null,
      feedback: null,
      reviewed_at: null,
      reviewed_by: null,
    };
  }
}

import {
  UserFactory,
  ClassFactory,
  ClassMemberFactory,
  LessonFactory,
  LessonProgressFactory,
  AssignmentFactory,
  SubmissionFactory,
} from "../factories/index.js";
import { hashPassword } from "../utils/passwordhelper.js";

export const demoAccounts = [
  { name: "Admin", email: "admin.demo@example.com", role: "ADMIN" },
  { name: "Mentor", email: "mentor.demo@example.com", role: "MEMBER" },
  { name: "Member 1", email: "member1.demo@example.com", role: "MEMBER" },
  { name: "Member 2", email: "member2.demo@example.com", role: "MEMBER" },
  { name: "Member 3", email: "member3.demo@example.com", role: "MEMBER" },
];

export async function seedDemo(
  database,
  { password = "SamplePassword123!" } = {},
) {
  if (typeof password !== "string" || password.length < 8) {
    throw new TypeError("Seed password must contain at least 8 characters");
  }

  return database.transaction(async (manager) => {
    const created = {
      users: 0,
      classes: 0,
      class_members: 0,
      lessons: 0,
      lesson_progress: 0,
      assignments: 0,
      submissions: 0,
      user_images: 0,
    };
    const factories = {
      users: new UserFactory(manager),
      classes: new ClassFactory(manager),
      class_members: new ClassMemberFactory(manager),
      lessons: new LessonFactory(manager),
      lesson_progress: new LessonProgressFactory(manager),
      assignments: new AssignmentFactory(manager),
      submissions: new SubmissionFactory(manager),
    };

    async function ensure(table, where, values = {}) {
      const factory = factories[table];
      const existing = await manager
        .getRepository(factory.entity)
        .findOneBy(where);
      if (existing) return existing;
      const row = await factory.create({ ...where, ...values });
      created[table]++;
      return row;
    }

    // Reuse existing accounts without changing their password, role or profile.
    let passwordHash;
    const users = [];
    for (const account of demoAccounts) {
      const existing = await manager
        .getRepository(factories.users.entity)
        .findOneBy({ email: account.email });
      if (existing) {
        users.push(existing);
      } else {
        passwordHash ??= await hashPassword(password);
        users.push(
          await ensure(
            "users",
            { email: account.email },
            {
              name: account.name,
              role: account.role,
              password_hash: passwordHash,
            },
          ),
        );
      }
    }

    const [, mentor, member1, member2, member3] = users;
    const courses = [
      {
        name: "Demo - Node.js Fundamentals",
        members: [member1, member2],
        titles: [
          "Introduction to Node.js",
          "Express routing",
          "TypeORM repositories",
        ],
        assignmentTitle: "Build an Express REST API",
      },
      {
        name: "Demo - PostgreSQL Fundamentals",
        members: [member2, member3],
        titles: [
          "Tables and constraints",
          "Entity relationships",
          "Transactions",
        ],
        assignmentTitle: "Design normalized PostgreSQL schema",
      },
    ];

    for (const course of courses) {
      const classroom = await ensure(
        "classes",
        { name: course.name, mentor_id: mentor.id },
        {
          description: "Demo learning data created by npm run db:seed.",
        },
      );
      for (const member of course.members) {
        await ensure("class_members", {
          class_id: classroom.id,
          member_id: member.id,
        });
      }
      const lessons = [];
      for (const [index, title] of course.titles.entries()) {
        lessons.push(
          await ensure(
            "lessons",
            {
              class_id: classroom.id,
              order_index: index + 1,
            },
            {
              title,
              content: `Sample content: ${title}.`,
              created_by: mentor.id,
            },
          ),
        );
      }
      for (const member of course.members) {
        await ensure("lesson_progress", {
          lesson_id: lessons[0].id,
          member_id: member.id,
        });
      }

      const assignment = await ensure(
        "assignments",
        {
          class_id: classroom.id,
          title: course.assignmentTitle,
        },
        {
          description: `Complete the project: ${course.assignmentTitle}.`,
          maximum_score: "100.00",
        },
      );

      await ensure(
        "submissions",
        {
          assignment_id: assignment.id,
          member_id: course.members[0].id,
        },
        {
          content: `Completed ${course.assignmentTitle}.`,
          repository_url: "https://github.com/example/demo-submission",
        },
      );
    }

    // No image row means the user has no image; image_url itself is NOT NULL.

    return {
      created,
      accounts: users.map(({ email, role }) => ({ email, role })),
    };
  });
}

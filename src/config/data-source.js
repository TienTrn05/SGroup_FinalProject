import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./env.config.js";
import { User } from "../entities/user.entity.js";
import { Class } from "../entities/class.entity.js";
import { ClassMember } from "../entities/classMember.entity.js";
import { Lesson } from "../entities/lesson.entity.js";
import { LessonProgress } from "../entities/lessonProgress.entity.js";
import { UserImage } from "../entities/userImage.entity.js";
import { AuthSession } from "../entities/authSession.entity.js";
import { Assignment } from "../entities/assignment.entity.js";
import { Submission } from "../entities/submission.entity.js";

const AppDataSource = new DataSource({
  type: "postgres",
  ...(config.db.connectionString
    ? { url: config.db.connectionString }
    : {
        host: config.db.host,
        port: config.db.port,
        username: config.db.user,
        password: config.db.password,
        database: config.db.database,
      }),
  entities: [
    User,
    Class,
    ClassMember,
    Lesson,
    LessonProgress,
    UserImage,
    AuthSession,
    Assignment,
    Submission,
  ],
  synchronize: false,
  logging: false,
  extra: { connectionTimeoutMillis: 15000 },
});

export const connectDB = async () => {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  console.log("Connected to PostgreSQL database successfully!");
};

export default AppDataSource;

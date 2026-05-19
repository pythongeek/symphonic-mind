import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
  bigint,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Music generation projects
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 255 }),
  mood: varchar("mood", { length: 100 }),
  status: mysqlEnum("status", ["draft", "processing", "completed", "failed"])
    .default("draft")
    .notNull(),
  sessionsCount: int("sessionsCount").default(2).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Generated tracks
export const tracks = mysqlTable("tracks", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: bigint("projectId", { mode: "number", unsigned: true }).references(
    () => projects.id,
    { onDelete: "set null" }
  ),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 255 }),
  mood: varchar("mood", { length: 100 }),
  gender: varchar("gender", { length: 50 }),
  timbre: varchar("timbre", { length: 50 }),
  duration: int("duration"),
  audioUrl: text("audioUrl"),
  waveformUrl: text("waveformUrl"),
  lyrics: text("lyrics"),
  generationMode: mysqlEnum("generationMode", ["cot", "icl"]).default("cot"),
  status: mysqlEnum("status", [
    "processing",
    "completed",
    "failed",
    "draft",
  ])
    .default("processing")
    .notNull(),
  sessionsCount: int("sessionsCount").default(2),
  maxNewTokens: int("maxNewTokens").default(3000),
  repetitionPenalty: float("repetitionPenalty").default(1.1),
  stage2BatchSize: int("stage2BatchSize").default(4),
  seed: int("seed"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

// Training datasets
export const trainingDatasets = mysqlTable("training_datasets", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  datasetType: mysqlEnum("datasetType", [
    "audio",
    "lyrics",
    "midi",
    "mixed",
  ])
    .default("audio")
    .notNull(),
  fileCount: int("fileCount").default(0),
  totalSize: varchar("totalSize", { length: 50 }),
  files: json("files").$type<
    Array<{ name: string; size: number; type: string; url: string }>
  >(),
  status: mysqlEnum("status", ["ready", "processing", "error"])
    .default("processing")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type TrainingDataset = typeof trainingDatasets.$inferSelect;
export type InsertTrainingDataset = typeof trainingDatasets.$inferInsert;

// Generation jobs for tracking async generation
export const generationJobs = mysqlTable("generationJobs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  trackId: bigint("trackId", { mode: "number", unsigned: true }).references(
    () => tracks.id,
    { onDelete: "set null" }
  ),
  jobType: mysqlEnum("jobType", [
    "generate",
    "continue",
    "variation",
  ]).default("generate"),
  status: mysqlEnum("status", [
    "queued",
    "processing",
    "completed",
    "failed",
  ])
    .default("queued")
    .notNull(),
  progress: int("progress").default(0),
  error: text("error"),
  config: json("config").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type GenerationJob = typeof generationJobs.$inferSelect;
export type InsertGenerationJob = typeof generationJobs.$inferInsert;

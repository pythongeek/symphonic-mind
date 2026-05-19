import { relations } from "drizzle-orm";
import { users, projects, tracks, trainingDatasets, generationJobs } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  tracks: many(tracks),
  trainingDatasets: many(trainingDatasets),
  generationJobs: many(generationJobs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one }) => ({
  user: one(users, { fields: [tracks.userId], references: [users.id] }),
  project: one(projects, {
    fields: [tracks.projectId],
    references: [projects.id],
  }),
}));

export const trainingDatasetsRelations = relations(trainingDatasets, ({ one }) => ({
  user: one(users, {
    fields: [trainingDatasets.userId],
    references: [users.id],
  }),
}));

export const generationJobsRelations = relations(generationJobs, ({ one }) => ({
  user: one(users, {
    fields: [generationJobs.userId],
    references: [users.id],
  }),
  track: one(tracks, {
    fields: [generationJobs.trackId],
    references: [tracks.id],
  }),
}));

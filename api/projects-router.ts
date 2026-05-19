import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projects, tracks } from "@db/schema";

export const projectsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, ctx.user.id))
      .orderBy(desc(projects.createdAt));
    return userProjects;
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [project] = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, input.id),
            eq(projects.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!project) return null;
      const projectTracks = await db
        .select()
        .from(tracks)
        .where(eq(tracks.projectId, input.id))
        .orderBy(desc(tracks.createdAt));
      return { ...project, tracks: projectTracks };
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        genre: z.string().optional(),
        mood: z.string().optional(),
        sessionsCount: z.number().min(1).max(10).default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [project] = await db.insert(projects).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        genre: input.genre || null,
        mood: input.mood || null,
        sessionsCount: input.sessionsCount,
      });
      return project;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        genre: z.string().optional(),
        mood: z.string().optional(),
        status: z.enum(["draft", "processing", "completed", "failed"]).optional(),
        sessionsCount: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.genre !== undefined) updateData.genre = data.genre;
      if (data.mood !== undefined) updateData.mood = data.mood;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.sessionsCount !== undefined) updateData.sessionsCount = data.sessionsCount;

      const [project] = await db
        .update(projects)
        .set(updateData)
        .where(
          and(eq(projects.id, id), eq(projects.userId, ctx.user.id))
        );
      return project;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(projects)
        .where(
          and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id))
        );
      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, ctx.user.id));

    const total = userProjects.length;
    const completed = userProjects.filter((p) => p.status === "completed").length;
    const processing = userProjects.filter((p) => p.status === "processing").length;
    const draft = userProjects.filter((p) => p.status === "draft").length;

    return { total, completed, processing, draft };
  }),
});

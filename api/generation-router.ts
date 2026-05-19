import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { generationJobs, tracks } from "@db/schema";

export const generationRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const jobs = await db
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.userId, ctx.user.id))
      .orderBy(desc(generationJobs.createdAt));
    return jobs;
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [job] = await db
        .select()
        .from(generationJobs)
        .where(
          and(
            eq(generationJobs.id, input.id),
            eq(generationJobs.userId, ctx.user.id)
          )
        )
        .limit(1);
      return job || null;
    }),

  create: authedQuery
    .input(
      z.object({
        trackId: z.number().optional(),
        jobType: z.enum(["generate", "continue", "variation"]).default("generate"),
        config: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [job] = await db.insert(generationJobs).values({
        userId: ctx.user.id,
        trackId: input.trackId || null,
        jobType: input.jobType,
        status: "queued",
        progress: 0,
        config: input.config || {},
      });
      return job;
    }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["queued", "processing", "completed", "failed"]).optional(),
        progress: z.number().min(0).max(100).optional(),
        error: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.progress !== undefined) updateData.progress = data.progress;
      if (data.error !== undefined) updateData.error = data.error;

      const [job] = await db
        .update(generationJobs)
        .set(updateData)
        .where(
          and(
            eq(generationJobs.id, id),
            eq(generationJobs.userId, ctx.user.id)
          )
        );
      return job;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(generationJobs)
        .where(
          and(
            eq(generationJobs.id, input.id),
            eq(generationJobs.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  // Simulate generation process
  startGeneration: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        genre: z.string().optional(),
        mood: z.string().optional(),
        gender: z.string().optional(),
        timbre: z.string().optional(),
        lyrics: z.string().optional(),
        generationMode: z.enum(["cot", "icl"]).default("cot"),
        sessionsCount: z.number().min(1).max(10).default(2),
        maxNewTokens: z.number().default(3000),
        repetitionPenalty: z.number().default(1.1),
        stage2BatchSize: z.number().default(4),
        seed: z.number().optional(),
        tags: z.string().optional(),
        projectId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Create the track
      const [track] = await db.insert(tracks).values({
        userId: ctx.user.id,
        projectId: input.projectId || null,
        name: input.name,
        genre: input.genre || null,
        mood: input.mood || null,
        gender: input.gender || null,
        timbre: input.timbre || null,
        lyrics: input.lyrics || null,
        generationMode: input.generationMode,
        sessionsCount: input.sessionsCount,
        maxNewTokens: input.maxNewTokens,
        repetitionPenalty: input.repetitionPenalty,
        stage2BatchSize: input.stage2BatchSize,
        seed: input.seed || null,
        tags: input.tags || null,
        status: "processing",
      });

      // Create the generation job
      const [job] = await db.insert(generationJobs).values({
        userId: ctx.user.id,
        trackId: track.insertId ? Number(track.insertId) : null,
        jobType: "generate",
        status: "processing",
        progress: 0,
        config: {
          ...input,
          trackId: track.insertId ? Number(track.insertId) : null,
        },
      });

      return { track, job };
    }),

  // Poll for generation status
  pollStatus: authedQuery
    .input(z.object({ trackId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [track] = await db
        .select()
        .from(tracks)
        .where(
          and(
            eq(tracks.id, input.trackId),
            eq(tracks.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!track) return null;

      const [job] = await db
        .select()
        .from(generationJobs)
        .where(eq(generationJobs.trackId, input.trackId))
        .orderBy(desc(generationJobs.createdAt))
        .limit(1);

      return { track, job: job || null };
    }),
});

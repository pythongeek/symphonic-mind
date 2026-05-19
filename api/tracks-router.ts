import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tracks } from "@db/schema";

export const tracksRouter = createRouter({
  list: authedQuery
    .input(
      z
        .object({
          projectId: z.number().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(tracks.userId, ctx.user.id)];
      if (input?.projectId) {
        conditions.push(eq(tracks.projectId, input.projectId));
      }
      const userTracks = await db
        .select()
        .from(tracks)
        .where(and(...conditions))
        .orderBy(desc(tracks.createdAt))
        .limit(input?.limit || 20)
        .offset(input?.offset || 0);
      return userTracks;
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [track] = await db
        .select()
        .from(tracks)
        .where(
          and(eq(tracks.id, input.id), eq(tracks.userId, ctx.user.id))
        )
        .limit(1);
      return track || null;
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        projectId: z.number().optional(),
        description: z.string().optional(),
        genre: z.string().optional(),
        mood: z.string().optional(),
        gender: z.string().optional(),
        timbre: z.string().optional(),
        duration: z.number().optional(),
        lyrics: z.string().optional(),
        generationMode: z.enum(["cot", "icl"]).default("cot"),
        sessionsCount: z.number().min(1).max(10).default(2),
        maxNewTokens: z.number().default(3000),
        repetitionPenalty: z.number().default(1.1),
        stage2BatchSize: z.number().default(4),
        seed: z.number().optional(),
        tags: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [track] = await db.insert(tracks).values({
        userId: ctx.user.id,
        projectId: input.projectId || null,
        name: input.name,
        description: input.description || null,
        genre: input.genre || null,
        mood: input.mood || null,
        gender: input.gender || null,
        timbre: input.timbre || null,
        duration: input.duration || null,
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
      return track;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        genre: z.string().optional(),
        mood: z.string().optional(),
        tags: z.string().optional(),
        audioUrl: z.string().optional(),
        status: z.enum(["processing", "completed", "failed", "draft"]).optional(),
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
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.audioUrl !== undefined) updateData.audioUrl = data.audioUrl;
      if (data.status !== undefined) updateData.status = data.status;

      const [track] = await db
        .update(tracks)
        .set(updateData)
        .where(and(eq(tracks.id, id), eq(tracks.userId, ctx.user.id)));
      return track;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(tracks)
        .where(and(eq(tracks.id, input.id), eq(tracks.userId, ctx.user.id)));
      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.userId, ctx.user.id));

    const total = userTracks.length;
    const thisMonth = userTracks.filter((t) => {
      const now = new Date();
      const created = new Date(t.createdAt);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, thisMonth };
  }),
});

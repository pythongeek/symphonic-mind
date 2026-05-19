import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { trainingDatasets } from "@db/schema";

export const trainingRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const datasets = await db
      .select()
      .from(trainingDatasets)
      .where(eq(trainingDatasets.userId, ctx.user.id))
      .orderBy(desc(trainingDatasets.createdAt));
    return datasets;
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [dataset] = await db
        .select()
        .from(trainingDatasets)
        .where(
          and(
            eq(trainingDatasets.id, input.id),
            eq(trainingDatasets.userId, ctx.user.id)
          )
        )
        .limit(1);
      return dataset || null;
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        datasetType: z.enum(["audio", "lyrics", "midi", "mixed"]).default("audio"),
        files: z
          .array(
            z.object({
              name: z.string(),
              size: z.number(),
              type: z.string(),
              url: z.string(),
            })
          )
          .optional(),
        fileCount: z.number().default(0),
        totalSize: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [dataset] = await db.insert(trainingDatasets).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        datasetType: input.datasetType,
        files: input.files || [],
        fileCount: input.fileCount || (input.files?.length ?? 0),
        totalSize: input.totalSize || null,
        status: "ready",
      });
      return dataset;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        status: z.enum(["ready", "processing", "error"]).optional(),
        files: z
          .array(
            z.object({
              name: z.string(),
              size: z.number(),
              type: z.string(),
              url: z.string(),
            })
          )
          .optional(),
        fileCount: z.number().optional(),
        totalSize: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.files !== undefined) updateData.files = data.files;
      if (data.fileCount !== undefined) updateData.fileCount = data.fileCount;
      if (data.totalSize !== undefined) updateData.totalSize = data.totalSize;

      const [dataset] = await db
        .update(trainingDatasets)
        .set(updateData)
        .where(
          and(
            eq(trainingDatasets.id, id),
            eq(trainingDatasets.userId, ctx.user.id)
          )
        );
      return dataset;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(trainingDatasets)
        .where(
          and(
            eq(trainingDatasets.id, input.id),
            eq(trainingDatasets.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const datasets = await db
      .select()
      .from(trainingDatasets)
      .where(eq(trainingDatasets.userId, ctx.user.id));

    const total = datasets.length;
    const totalSize = datasets.reduce((acc, d) => {
      const size = parseFloat(d.totalSize || "0");
      return acc + size;
    }, 0);
    const ready = datasets.filter((d) => d.status === "ready").length;

    return { total, totalSize: totalSize.toFixed(1) + " GB", ready };
  }),
});

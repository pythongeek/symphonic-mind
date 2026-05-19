import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projects, tracks, trainingDatasets } from "@db/schema";

export const dashboardRouter = createRouter({
  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const allTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.userId, ctx.user.id));

    const allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, ctx.user.id));

    const allDatasets = await db
      .select()
      .from(trainingDatasets)
      .where(eq(trainingDatasets.userId, ctx.user.id));

    const totalTracks = allTracks.length;
    const totalDatasets = allDatasets.length;

    const now = new Date();
    const thisMonthTracks = allTracks.filter((t) => {
      const created = new Date(t.createdAt);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;

    const totalDatasetSize = allDatasets.reduce((acc, d) => {
      const size = parseFloat(d.totalSize || "0");
      return acc + (isNaN(size) ? 0 : size);
    }, 0);

    // Get recent tracks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTracks = allTracks.filter(
      (t) => new Date(t.createdAt) >= sevenDaysAgo
    );

    // Activity data for chart
    const activityData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayTracks = allTracks.filter((t) => {
        const created = new Date(t.createdAt);
        return (
          created.getDate() === date.getDate() &&
          created.getMonth() === date.getMonth() &&
          created.getFullYear() === date.getFullYear()
        );
      }).length;
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        tracks: dayTracks,
      };
    });

    return {
      totalTracks,
      totalProjects: allProjects.length,
      totalDatasets,
      thisMonthTracks,
      totalDatasetSize: totalDatasetSize.toFixed(1) + " GB",
      activeProjects: allProjects.filter((p) => p.status === "processing").length,
      recentTracks: recentTracks.length,
      activityData,
    };
  }),

  recentActivity: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const recentTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.userId, ctx.user.id))
      .orderBy(desc(tracks.createdAt))
      .limit(10);

    const recentProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, ctx.user.id))
      .orderBy(desc(projects.createdAt))
      .limit(5);

    return {
      tracks: recentTracks,
      projects: recentProjects,
    };
  }),
});

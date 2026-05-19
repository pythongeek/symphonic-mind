import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboard-router";
import { projectsRouter } from "./projects-router";
import { tracksRouter } from "./tracks-router";
import { trainingRouter } from "./training-router";
import { generationRouter } from "./generation-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  projects: projectsRouter,
  tracks: tracksRouter,
  training: trainingRouter,
  generation: generationRouter,
});

export type AppRouter = typeof appRouter;

import { Router } from "express";

export function createPlaceholderRouter(name, extraRoutes = []) {
  const router = Router();

  router.get("/", async (_req, res) => {
    res.json({
      module: name,
      status: "initialized",
      message: `${name} routes are mounted and ready for the next implementation step.`
    });
  });

  extraRoutes.forEach(({ method, path, handler }) => {
    router[method](path, handler);
  });

  return router;
}

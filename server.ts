import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { aiService } from "./server/ai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/analyze", async (req, res) => {
    const { rawInput, mode, compressToMvp } = req.body;

    if (!rawInput || rawInput.trim().length < 10) {
      return res.status(400).json({ error: "Input too short (min 10 chars)." });
    }

    try {
      const result = await aiService.generate(rawInput, mode, !!compressToMvp);
      res.json(result);
    } catch (error: any) {
      console.error('AI Error:', error);
      res.status(500).json({ error: "AI analysis failed. Please try again." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

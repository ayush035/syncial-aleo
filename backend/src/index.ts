import express from "express";
import cors from "cors";
import cron from "node-cron";
import { Database } from "./database";
import { AleoIndexer } from "./indexer";
import { createRouter } from "./routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

const db = new Database();
const indexer = new AleoIndexer(db);

app.use("/api", createRouter(db));

// Health check
app.get("/health", async (_, res) => {
  const stats = db.getStats();
  const deploymentCheck = await indexer.checkDeployments();

  res.json({
    status: "ok",
    service: "syncial-indexer",
    timestamp: new Date().toISOString(),
    stats,
    deployments: deploymentCheck,
    note: "Contracts deployed via Aleo Playground",
  });
});

// Sync on-chain state every 30 seconds
cron.schedule("*/30 * * * * *", async () => {
  try {
    const synced = await indexer.syncPolls();
    if (synced > 0) {
      console.log(
        `[${new Date().toISOString()}] Synced ${synced} polls from Aleo network`
      );
    }
  } catch (error) {
    console.error("Sync error:", error);
  }
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║    🚀 Syncial Indexer                      ║
  ║    Port: ${PORT}                              ║
  ║    API:  http://localhost:${PORT}/api          ║
  ║    Mode: Aleo Playground Deployment        ║
  ║    Sync: Every 30 seconds                  ║
  ╚═══════════════════════════════════════════╝
  `);

  // Initial checks
  indexer.checkDeployments().then((result) => {
    console.log("Deployment status:", result);
  });

  indexer.syncPolls().catch(console.error);
});
import app from "./index.js";
import db from "./db/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.connect();
    app.listen(PORT, () => {
      console.log(`Interntex server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[Server Startup] Failed to connect MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();

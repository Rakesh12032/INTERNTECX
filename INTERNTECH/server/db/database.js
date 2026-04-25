import mongoose from "mongoose";

let connectionPromise = null;

function buildSafeMongoUri(rawUri) {
  if (!rawUri || !rawUri.startsWith("mongodb")) {
    return rawUri;
  }

  const schemeMatch = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)(.+)$/);
  if (!schemeMatch) {
    return rawUri;
  }

  const [, scheme, rest] = schemeMatch;
  const slashIndex = rest.indexOf("/");
  const authority = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
  const pathAndQuery = slashIndex === -1 ? "" : rest.slice(slashIndex);

  const atIndex = authority.lastIndexOf("@");
  if (atIndex === -1) {
    return rawUri;
  }

  const credentials = authority.slice(0, atIndex);
  const host = authority.slice(atIndex + 1);
  const colonIndex = credentials.indexOf(":");
  if (colonIndex === -1) {
    return rawUri;
  }

  const username = credentials.slice(0, colonIndex);
  const password = credentials.slice(colonIndex + 1);
  const encodedPassword = encodeURIComponent(decodeURIComponent(password));

  return `${scheme}${username}:${encodedPassword}@${host}${pathAndQuery}`;
}

const db = {
  getMongoUri() {
    const rawUri = process.env.MONGO_URI?.trim() || process.env.MONGODB_URI?.trim();
    return buildSafeMongoUri(rawUri);
  },
  async connect() {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    if (connectionPromise) {
      await connectionPromise;
      return;
    }

    const mongoUri = this.getMongoUri();
    if (!mongoUri) {
      throw new Error("MONGO_URI or MONGODB_URI environment variable is required");
    }

    const connectionLabel = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

    connectionPromise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10
      })
      .then(() => {
        console.log(`[MongoDB] Connected (${mongoose.connection.name}) using ${connectionLabel}`);
      })
      .catch((error) => {
        console.error(`[MongoDB] Connection failed for ${connectionLabel}:`, error.message);
        throw error;
      })
      .finally(() => {
        connectionPromise = null;
      });

    await connectionPromise;
  }
};

export default db;

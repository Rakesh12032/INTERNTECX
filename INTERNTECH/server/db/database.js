import mongoose from "mongoose";
import { collectionNames, stateModels } from "../models/stateModels.js";

const defaultData = {
  users: [],
  courses: [],
  lessons: [],
  enrollments: [],
  internships: [],
  internshipApplications: [],
  certificates: [],
  quizzes: [],
  quizAttempts: [],
  jobs: [],
  jobApplications: [],
  savedJobs: [],
  companies: [],
  ambassadors: [],
  referralTransactions: [],
  walletHistory: [],
  withdrawalRequests: [],
  colleges: [],
  verificationLogs: [],
  placementDrives: [],
  chatLogs: [],
  analyticsEvents: [],
  otps: []
};

let connectionPromise = null;
let lastSnapshot = structuredClone(defaultData);

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

function sanitizeDoc(document) {
  if (!document || typeof document !== "object") {
    return document;
  }

  const { _id, __v, ...cleaned } = document;
  return cleaned;
}

const db = {
  data: structuredClone(defaultData),
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
  },
  async read() {
    try {
      await this.connect();

      const entries = await Promise.all(
        collectionNames.map(async (collectionName) => {
          const records = await stateModels[collectionName].find({}).lean();
          return [collectionName, records.map(sanitizeDoc)];
        })
      );

      this.data = {
        ...structuredClone(defaultData),
        ...Object.fromEntries(entries)
      };
      lastSnapshot = structuredClone(this.data);
    } catch (error) {
      console.error("[MongoDB] Read failed:", error.message);
      throw error;
    }
  },
  async write() {
    try {
      await this.connect();

      const changedCollections = collectionNames.filter((collectionName) => {
        const prev = JSON.stringify(lastSnapshot[collectionName] || []);
        const next = JSON.stringify(this.data[collectionName] || []);
        return prev !== next;
      });

      await Promise.all(
        changedCollections.map(async (collectionName) => {
          const model = stateModels[collectionName];
          const records = Array.isArray(this.data[collectionName]) ? this.data[collectionName] : [];
          const payload = records.map((record) => sanitizeDoc(record));

          await model.deleteMany({});
          if (payload.length > 0) {
            await model.insertMany(payload, { ordered: false });
          }
        })
      );

      lastSnapshot = structuredClone(this.data);
    } catch (error) {
      console.error("[MongoDB] Write failed:", error.message);
      throw error;
    }
  }
};

export { defaultData };
export default db;

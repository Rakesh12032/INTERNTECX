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

const mongoUri = process.env.MONGO_URI;

let isConnected = false;

function sanitizeDoc(document) {
  if (!document || typeof document !== "object") {
    return document;
  }

  const { _id, __v, ...cleaned } = document;
  return cleaned;
}

const db = {
  data: structuredClone(defaultData),
  async connect() {
    if (isConnected) {
      return;
    }

    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is required");
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    isConnected = true;
  },
  async read() {
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
  },
  async write() {
    await this.connect();

    await Promise.all(
      collectionNames.map(async (collectionName) => {
        const model = stateModels[collectionName];
        const records = Array.isArray(this.data[collectionName]) ? this.data[collectionName] : [];
        const payload = records.map((record) => sanitizeDoc(record));

        await model.deleteMany({});
        if (payload.length > 0) {
          await model.insertMany(payload, { ordered: false });
        }
      })
    );
  }
};

export { defaultData };
export default db;

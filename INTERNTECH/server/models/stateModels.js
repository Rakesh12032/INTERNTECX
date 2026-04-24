import mongoose from "mongoose";

const collectionNames = [
  "users",
  "courses",
  "lessons",
  "enrollments",
  "internships",
  "internshipApplications",
  "certificates",
  "quizzes",
  "quizAttempts",
  "jobs",
  "jobApplications",
  "savedJobs",
  "companies",
  "ambassadors",
  "referralTransactions",
  "walletHistory",
  "withdrawalRequests",
  "colleges",
  "verificationLogs",
  "placementDrives",
  "chatLogs",
  "analyticsEvents",
  "otps"
];

const dynamicRecordSchema = new mongoose.Schema({}, { strict: false, versionKey: false });

function modelForCollection(collectionName) {
  const modelName = `${collectionName[0].toUpperCase()}${collectionName.slice(1)}Record`;
  return mongoose.models[modelName] || mongoose.model(modelName, dynamicRecordSchema, collectionName);
}

const stateModels = Object.fromEntries(
  collectionNames.map((collectionName) => [collectionName, modelForCollection(collectionName)])
);

export { collectionNames, stateModels };

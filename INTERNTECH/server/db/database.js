import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const adapter = new JSONFileSync(join(__dirname, "db.json"));
const db = new LowSync(adapter, defaultData);

db.read();
db.data ||= structuredClone(defaultData);
db.write();

export { defaultData };
export default db;

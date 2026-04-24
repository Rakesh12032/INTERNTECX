import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db, { defaultData } from "./database.js";

const createModule = (title, lessons) => ({
  id: uuidv4(),
  title,
  lessons: lessons.map((lessonTitle, index) => ({
    id: uuidv4(),
    title: lessonTitle,
    order: index + 1,
    duration: `${15 + index * 5} min`,
    description: `${lessonTitle} with project-oriented explanation, examples, and guided practice.`,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }))
});

const courseDefinitions = [
  {
    title: "Full Stack Web Development",
    slug: "full-stack-web-development",
    duration: "12 weeks",
    level: "Beginner",
    price: 0,
    featured: true,
    category: "Web Development",
    mentor: {
      name: "Aman Raj",
      designation: "Senior Full Stack Engineer",
      linkedin: "https://www.linkedin.com/in/amanraj-tech/"
    },
    overview:
      "Build responsive user interfaces, REST APIs, authentication flows, databases, and deployable applications used in modern web engineering teams.",
    modules: [
      createModule("HTML/CSS Basics", ["Semantic HTML", "Flexbox and Grid", "Responsive Layouts"]),
      createModule("JavaScript Fundamentals", ["Variables and Scope", "DOM Manipulation", "ES6 Essentials"]),
      createModule("React.js", ["Components and Props", "Hooks in Practice", "Routing and State"]),
      createModule("Node.js & Express", ["Express Server Setup", "Middleware", "REST API Design"]),
      createModule("MongoDB", ["Schema Thinking", "CRUD Workflows", "Query Optimization"]),
      createModule("Deployment", ["Environment Variables", "Production Builds", "Deployment Checklist"])
    ]
  },
  {
    title: "Python Programming",
    slug: "python-programming",
    duration: "6 weeks",
    level: "Beginner",
    price: 0,
    featured: true,
    category: "Programming",
    mentor: {
      name: "Sneha Kumari",
      designation: "Python Mentor",
      linkedin: "https://www.linkedin.com/in/snehakumari-dev/"
    },
    overview: "Start with Python syntax and move into functions, OOP, libraries, and mini projects useful for internships.",
    modules: [
      createModule("Python Basics", ["Syntax and Variables", "Data Types", "Conditional Logic"]),
      createModule("Functions & OOP", ["Functions", "Classes and Objects", "Inheritance"]),
      createModule("File Handling", ["Reading Files", "Writing Files", "Exception Handling"]),
      createModule("Libraries", ["NumPy Intro", "Requests", "Automation Helpers"]),
      createModule("Mini Projects", ["CLI Calculator", "Student Record App", "Task Tracker"])
    ]
  },
  {
    title: "Machine Learning with Python",
    slug: "machine-learning-with-python",
    duration: "10 weeks",
    level: "Intermediate",
    price: 0,
    featured: true,
    category: "AI/ML",
    mentor: {
      name: "Ritika Sinha",
      designation: "ML Engineer",
      linkedin: "https://www.linkedin.com/in/ritika-sinha-ml/"
    },
    overview: "Learn data preparation, model training, evaluation, and real-world project execution using Python ML tooling.",
    modules: [
      createModule("NumPy/Pandas", ["Array Operations", "DataFrames", "Data Cleaning"]),
      createModule("Data Visualization", ["Matplotlib", "Seaborn", "Storytelling with Charts"]),
      createModule("ML Algorithms", ["Regression", "Classification", "Clustering"]),
      createModule("Model Training", ["Train-Test Split", "Feature Engineering", "Evaluation Metrics"]),
      createModule("Real Projects", ["Spam Detection", "Sales Forecasting", "Recommendation Basics"])
    ]
  },
  {
    title: "Data Science & Analytics",
    slug: "data-science-and-analytics",
    duration: "8 weeks",
    level: "Intermediate",
    price: 0,
    featured: true,
    category: "Data Science",
    mentor: {
      name: "Vivek Anand",
      designation: "Data Analyst",
      linkedin: "https://www.linkedin.com/in/vivekanand-analytics/"
    },
    overview: "Master data storytelling, exploratory analysis, dashboards, and decision-ready reporting.",
    modules: [
      createModule("Analytics Foundations", ["Data Types", "Business Questions", "Reporting"]),
      createModule("Data Wrangling", ["Cleaning Datasets", "Handling Missing Values", "Transformations"]),
      createModule("Visualization", ["Charts That Matter", "Dashboard Planning", "Storytelling"]),
      createModule("Insights", ["KPI Analysis", "Trend Analysis", "Decision Recommendations"])
    ]
  },
  {
    title: "UI/UX Design Fundamentals",
    slug: "ui-ux-design-fundamentals",
    duration: "6 weeks",
    level: "Beginner",
    price: 0,
    featured: true,
    category: "Design",
    mentor: {
      name: "Pragya Mishra",
      designation: "Product Designer",
      linkedin: "https://www.linkedin.com/in/pragyamishra-design/"
    },
    overview: "Create user-centered digital experiences through design thinking, wireframes, and polished interfaces.",
    modules: [
      createModule("Design Basics", ["Typography", "Color Systems", "Spacing"]),
      createModule("UX Research", ["Personas", "User Flows", "Pain Points"]),
      createModule("Wireframing", ["Low Fidelity", "Mid Fidelity", "Clickable Prototype"]),
      createModule("UI Systems", ["Components", "Design Tokens", "Design Handoff"]),
      createModule("Portfolio", ["Case Study Structure", "Presentation", "Interview Readiness"])
    ]
  },
  {
    title: "DSA in Java",
    slug: "dsa-in-java",
    duration: "10 weeks",
    level: "Intermediate",
    price: 0,
    featured: false,
    category: "Programming",
    mentor: { name: "Harsh Vardhan", designation: "SDE Mentor", linkedin: "https://www.linkedin.com/in/harshvardhan-sde/" },
    overview: "Prepare for coding rounds with strong data structures and algorithms in Java.",
    modules: [createModule("Arrays", ["Traversal", "Prefix Sum", "Two Pointer"]), createModule("Trees", ["Binary Trees", "BST", "Traversal Patterns"])]
  },
  {
    title: "Cybersecurity Fundamentals",
    slug: "cybersecurity-fundamentals",
    duration: "6 weeks",
    level: "Beginner",
    price: 0,
    featured: false,
    category: "Security",
    mentor: { name: "Aditi Roy", designation: "Security Analyst", linkedin: "https://www.linkedin.com/in/aditiroy-security/" },
    overview: "Understand core security principles, attack surfaces, and defensive practices.",
    modules: [createModule("Security Basics", ["CIA Triad", "Threats", "Authentication"]), createModule("Network Safety", ["HTTP/HTTPS", "Firewalls", "Common Attacks"])]
  },
  {
    title: "Cloud Computing with AWS",
    slug: "cloud-computing-with-aws",
    duration: "8 weeks",
    level: "Intermediate",
    price: 499,
    featured: true,
    category: "Cloud",
    mentor: { name: "Neeraj Singh", designation: "Cloud Architect", linkedin: "https://www.linkedin.com/in/neerajsingh-cloud/" },
    overview: "Deploy scalable workloads using foundational AWS services and real cloud architecture thinking.",
    modules: [createModule("AWS Core", ["IAM", "EC2", "S3"]), createModule("Deployments", ["Load Balancing", "Monitoring", "Cost Basics"])]
  },
  {
    title: "Android App Development",
    slug: "android-app-development",
    duration: "10 weeks",
    level: "Intermediate",
    price: 0,
    featured: false,
    category: "Mobile",
    mentor: { name: "Shivam Kumar", designation: "Android Engineer", linkedin: "https://www.linkedin.com/in/shivamkumar-android/" },
    overview: "Build Android applications from UI screens to API integration and release preparation.",
    modules: [createModule("Kotlin Basics", ["Syntax", "Classes", "Collections"]), createModule("Android UI", ["Layouts", "Navigation", "State Handling"])]
  },
  {
    title: "SQL & Database Design",
    slug: "sql-and-database-design",
    duration: "4 weeks",
    level: "Beginner",
    price: 0,
    featured: false,
    category: "Database",
    mentor: { name: "Anjali Verma", designation: "Database Consultant", linkedin: "https://www.linkedin.com/in/anjaliverma-data/" },
    overview: "Write production-friendly SQL and design reliable relational schemas.",
    modules: [createModule("SQL Basics", ["SELECT Queries", "WHERE and ORDER BY", "Aggregations"]), createModule("Design", ["Normalization", "Joins", "Schema Planning"])]
  },
  {
    title: "DevOps & Docker Basics",
    slug: "devops-and-docker-basics",
    duration: "6 weeks",
    level: "Intermediate",
    price: 0,
    featured: false,
    category: "DevOps",
    mentor: { name: "Karan Deep", designation: "DevOps Engineer", linkedin: "https://www.linkedin.com/in/karandeep-devops/" },
    overview: "Understand containers, CI/CD thinking, deployment workflows, and operational collaboration.",
    modules: [createModule("DevOps Foundations", ["Lifecycle", "Pipelines", "Environment Strategy"]), createModule("Docker", ["Images", "Containers", "Compose"])]
  },
  {
    title: "Digital Marketing for Tech",
    slug: "digital-marketing-for-tech",
    duration: "4 weeks",
    level: "Beginner",
    price: 0,
    featured: false,
    category: "Marketing",
    mentor: { name: "Ishita Paul", designation: "Growth Specialist", linkedin: "https://www.linkedin.com/in/ishitapaul-growth/" },
    overview: "Learn digital channels, tech product messaging, performance basics, and growth reporting.",
    modules: [createModule("Marketing Basics", ["Channels", "Funnels", "Positioning"]), createModule("Campaigns", ["SEO", "Social Media", "Analytics"])]
  }
];

const internshipTracks = [
  "Web Dev",
  "AI/ML",
  "Data Science",
  "Cybersecurity",
  "UI/UX",
  "Python",
  "Cloud & DevOps",
  "Android/iOS"
].map((trackName, index) => ({
  id: uuidv4(),
  title: `${trackName} Internship Track`,
  slug: trackName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  duration: index % 2 === 0 ? "4 weeks" : "8 weeks",
  price: 999,
  certificateIncluded: true,
  featuredSkills: trackName === "Web Dev" ? ["React", "Node.js", "REST APIs"] : ["Projects", "Mentorship", "Certification"],
  seats: 60
}));

const sampleJobs = [
  ["TCS", "Graduate Software Engineer", "Patna", "0-1 years", "₹3.6 LPA"],
  ["Infosys", "Systems Engineer", "Pune", "0-2 years", "₹4.1 LPA"],
  ["Wipro", "Project Engineer", "Bengaluru", "0-1 years", "₹3.8 LPA"],
  ["Razorpay", "Frontend Developer Intern", "Remote", "Internship", "₹35,000/month"],
  ["Zomato", "Data Analyst", "Gurugram", "1-2 years", "₹5.5 LPA"],
  ["Paytm", "QA Automation Engineer", "Noida", "0-2 years", "₹4.8 LPA"],
  ["BrowserStack", "Technical Support Engineer", "Remote", "0-1 years", "₹4.5 LPA"],
  ["Freshworks", "Junior Product Analyst", "Chennai", "0-2 years", "₹6.2 LPA"],
  ["RemoteLaunch Labs", "React Developer", "Remote", "1-3 years", "₹7.2 LPA"],
  ["StackMint AI", "ML Operations Associate", "Remote", "0-1 years", "₹6.8 LPA"]
].map(([company, role, location, experience, salary], index) => ({
  id: uuidv4(),
  company,
  role,
  location,
  experience,
  salary,
  type: salary.includes("/month") ? "Internship" : "Full Time",
  postedAt: new Date(Date.now() - index * 86400000).toISOString(),
  description: `${role} at ${company} focused on product-minded execution, collaboration, and strong fundamentals.`,
  skills: ["Communication", "Problem Solving", index % 2 === 0 ? "JavaScript" : "Python"],
  verified: index < 6
}));

const topicsByCourse = {
  "Full Stack Web Development": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
  "Python Programming": ["Syntax", "Functions", "OOP", "Files", "Libraries"],
  "Machine Learning with Python": ["NumPy", "Pandas", "Visualization", "Algorithms", "Evaluation"],
  "Data Science & Analytics": ["Analytics", "Cleaning", "Visualization", "KPIs", "Insights"],
  "UI/UX Design Fundamentals": ["Typography", "Research", "Wireframes", "Design Systems", "Portfolio"]
};

function buildQuizQuestions(course) {
  const topics = topicsByCourse[course.title];
  return Array.from({ length: 20 }, (_, index) => ({
    id: uuidv4(),
    courseId: course.id,
    question: `${course.title}: ${topics[index % topics.length]} question ${index + 1}. Which option best matches the core concept taught in this module?`,
    options: [
      `${topics[index % topics.length]} concept explained through practical application`,
      `${topics[index % topics.length]} means avoiding all structure and planning`,
      `${topics[index % topics.length]} is only relevant for hardware roles`,
      `${topics[index % topics.length]} should be skipped during beginner projects`
    ],
    correctAnswer: index % 4,
    explanation: `In InternTech's ${course.title} curriculum, ${topics[index % topics.length]} is taught through practical and career-relevant examples.`,
    topic: topics[index % topics.length]
  }));
}

async function seed() {
  db.read();
  db.data = structuredClone(defaultData);

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const studentPassword = await bcrypt.hash("Test@123", 12);

  const adminUser = {
    id: uuidv4(),
    name: "InternTech Admin",
    email: "admin@interntech.in",
    phone: "9876543210",
    password: adminPassword,
    role: "admin",
    referralCode: "INT-ADMIN0001",
    status: "active",
    college: "InternTech HQ",
    degree: "Other",
    branch: "Operations",
    year: "Pass-out",
    city: "Patna",
    state: "Bihar",
    referralCount: 0,
    walletBalance: 0,
    totalEarned: 0,
    createdAt: new Date().toISOString()
  };

  const studentUser = {
    id: uuidv4(),
    name: "Rakesh Kumar",
    email: "student@test.com",
    phone: "9123456789",
    password: studentPassword,
    role: "student",
    referralCode: "INT-RAKE2847",
    status: "active",
    college: "NIT Patna",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd",
    city: "Patna",
    state: "Bihar",
    referralCount: 2,
    walletBalance: 398,
    totalEarned: 398,
    createdAt: new Date().toISOString()
  };

  const courses = courseDefinitions.map((course) => ({
    id: uuidv4(),
    ...course,
    enrolledCount: 120 + Math.floor(Math.random() * 320),
    rating: 4.5,
    createdAt: new Date().toISOString()
  }));

  const lessons = courses.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        courseId: course.id,
        moduleId: module.id
      }))
    )
  );

  const sampleEnrollments = [
    {
      id: uuidv4(),
      courseId: courses[0].id,
      studentId: studentUser.id,
      completedLessons: courses[0].modules.flatMap((module) =>
        module.lessons.map((lesson) => lesson.id)
      ),
      progress: 100,
      quizUnlocked: true,
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: uuidv4(),
      courseId: courses[1].id,
      studentId: studentUser.id,
      completedLessons: courses[1].modules
        .slice(0, 3)
        .flatMap((module) => module.lessons.map((lesson) => lesson.id)),
      progress: 60,
      quizUnlocked: false,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];

  const sampleQuizAttempts = [
    {
      id: uuidv4(),
      studentId: studentUser.id,
      courseId: courses[0].id,
      score: 85,
      passed: true,
      answers: [],
      weakTopics: ["Node.js"],
      timestamp: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: uuidv4(),
      studentId: studentUser.id,
      courseId: courses[0].id,
      score: 91,
      passed: true,
      answers: [],
      weakTopics: ["Deployment"],
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ];

  const sampleCertificates = [
    {
      id: uuidv4(),
      certId: `INT-${new Date().getFullYear()}-8821`,
      studentId: studentUser.id,
      studentName: studentUser.name,
      college: studentUser.college,
      courseId: courses[0].id,
      courseName: courses[0].title,
      completionDate: new Date(Date.now() - 6 * 86400000).toISOString(),
      duration: courses[0].duration,
      type: "course",
      status: "active"
    }
  ];

  const sampleAnalyticsEvents = Array.from({ length: 24 }, (_, index) => ({
    id: uuidv4(),
    userId: studentUser.id,
    type: index % 5 === 0 ? "quiz_attempt" : "lesson_complete",
    createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString()
  }));

  db.data.users.push(adminUser, studentUser);
  db.data.courses = courses;
  db.data.lessons = lessons;
  db.data.enrollments = sampleEnrollments;
  db.data.internships = internshipTracks;
  db.data.certificates = sampleCertificates;
  db.data.quizAttempts = sampleQuizAttempts;
  db.data.jobs = sampleJobs;
  db.data.savedJobs = [
    {
      id: uuidv4(),
      studentId: studentUser.id,
      jobId: sampleJobs[1].id,
      savedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  db.data.quizzes = courses.slice(0, 5).flatMap((course) => buildQuizQuestions(course));
  db.data.analyticsEvents = sampleAnalyticsEvents;
  db.data.colleges = [
    {
      id: uuidv4(),
      name: "NIT Patna",
      email: "placements@nitp.ac.in",
      password: await bcrypt.hash("College@123", 12),
      role: "college",
      city: "Patna",
      state: "Bihar",
      status: "active",
      createdAt: new Date().toISOString()
    }
  ];
  db.data.companies = [
    {
      id: uuidv4(),
      companyName: "Razorpay Hiring Team",
      email: "company@interntech.in",
      password: await bcrypt.hash("Company@123", 12),
      role: "company",
      location: "Bengaluru",
      status: "approved",
      jobs: [],
      createdAt: new Date().toISOString()
    }
  ];
  db.data.walletHistory = [
    {
      id: uuidv4(),
      userId: studentUser.id,
      type: "credit",
      amount: 199,
      description: "Referral: Priya Singh",
      timestamp: new Date(Date.now() - 432000000).toISOString()
    },
    {
      id: uuidv4(),
      userId: studentUser.id,
      type: "credit",
      amount: 199,
      description: "Referral: Amit Raj",
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  db.data.referralTransactions = [
    {
      id: uuidv4(),
      referrerId: studentUser.id,
      referredStudentName: "Priya Singh",
      amount: 199,
      status: "completed",
      timestamp: new Date(Date.now() - 432000000).toISOString()
    },
    {
      id: uuidv4(),
      referrerId: studentUser.id,
      referredStudentName: "Amit Raj",
      amount: 199,
      status: "completed",
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  db.data.ambassadors = [
    {
      id: uuidv4(),
      studentId: studentUser.id,
      name: studentUser.name,
      college: studentUser.college,
      city: studentUser.city,
      referralCount: studentUser.referralCount,
      instagram: "https://instagram.com/rakesh.codes",
      linkedin: "https://linkedin.com/in/rakesh-kumar-dev",
      reason: "I love helping students discover practical career opportunities.",
      monthlyReferrals: "12",
      status: "approved",
      createdAt: new Date().toISOString()
    }
  ];

  db.write();
  console.log("InternTech database seeded successfully.");
  console.log("Admin Login: admin@interntech.in / Admin@123");
  console.log("Test Student: student@test.com / Test@123");
}

seed().catch((error) => {
  console.error("Failed to seed database:", error);
  process.exit(1);
});

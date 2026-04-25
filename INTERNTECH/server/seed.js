import dotenv from "dotenv";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/interntex";

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

const coursesData = [
  {
    id: uuidv4(),
    slug: "full-stack-web-dev",
    title: "Full Stack Web Development",
    overview: "Master frontend and backend development with the most popular technologies. Learn React, Node.js, Express, and MongoDB from scratch to build production-ready web applications.",
    category: "Web Development",
    duration: "12 Weeks",
    level: "Beginner to Advanced",
    price: 0,
    enrolledCount: 1540,
    featured: true,
    modules: [
      {
        id: uuidv4(),
        title: "HTML, CSS & JavaScript Fundamentals",
        lessons: [
          {
            id: uuidv4(),
            title: "HTML5 Crash Course",
            duration: "1h 12m",
            description: "Learn the fundamentals of HTML5 to structure your web pages.",
            videoUrl: "https://www.youtube.com/embed/UB1O30fR-EE"
          },
          {
            id: uuidv4(),
            title: "CSS3 Full Tutorial",
            duration: "1h 25m",
            description: "Style your websites with modern CSS techniques.",
            videoUrl: "https://www.youtube.com/embed/yfoY53QXEnI"
          },
          {
            id: uuidv4(),
            title: "JavaScript Basics",
            duration: "2h 30m",
            description: "An introduction to JavaScript programming.",
            videoUrl: "https://www.youtube.com/embed/hdI2bqOjy3c"
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Frontend Development with React",
        lessons: [
          {
            id: uuidv4(),
            title: "React JS Crash Course",
            duration: "2h 10m",
            description: "Learn modern React with Hooks, Components, and Props.",
            videoUrl: "https://www.youtube.com/embed/bMknfKXIFA8"
          },
          {
            id: uuidv4(),
            title: "Tailwind CSS Tutorial",
            duration: "1h 45m",
            description: "Build beautiful layouts quickly using Tailwind CSS.",
            videoUrl: "https://www.youtube.com/embed/UBOj6rqRUME"
          }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    slug: "data-science-python",
    title: "Data Science with Python",
    overview: "Dive into the world of Data Science. Learn Python programming, data analysis with Pandas, and build machine learning models to solve real-world problems.",
    category: "Data Science",
    duration: "10 Weeks",
    level: "Beginner",
    price: 0,
    enrolledCount: 890,
    featured: true,
    modules: [
      {
        id: uuidv4(),
        title: "Python Programming Basics",
        lessons: [
          {
            id: uuidv4(),
            title: "Python for Beginners",
            duration: "4h 20m",
            description: "A complete introduction to Python programming.",
            videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw"
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Data Analysis and Machine Learning",
        lessons: [
          {
            id: uuidv4(),
            title: "Data Analysis with Pandas",
            duration: "1h 50m",
            description: "Learn how to manipulate and analyze data using Pandas.",
            videoUrl: "https://www.youtube.com/embed/vmEHCJofslg"
          },
          {
            id: uuidv4(),
            title: "Machine Learning Full Course",
            duration: "3h 15m",
            description: "Introduction to Machine Learning algorithms and concepts.",
            videoUrl: "https://www.youtube.com/embed/7eh4d6sabA0"
          }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    slug: "ui-ux-design-masterclass",
    title: "UI/UX Design Masterclass",
    overview: "Design beautiful and highly functional digital products. Learn Figma, wireframing, user research, and modern UI/UX principles to create engaging web and mobile experiences.",
    category: "Design",
    duration: "8 Weeks",
    level: "All Levels",
    price: 0,
    enrolledCount: 1205,
    featured: true,
    modules: [
      {
        id: uuidv4(),
        title: "Figma and Design Principles",
        lessons: [
          {
            id: uuidv4(),
            title: "Figma Tutorial for Beginners",
            duration: "1h 30m",
            description: "Get started with the industry-standard design tool, Figma.",
            videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU"
          },
          {
            id: uuidv4(),
            title: "UI/UX Design Principles",
            duration: "2h 00m",
            description: "Learn the core concepts behind great user interface design.",
            videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU"
          }
        ]
      }
    ]
  }
];

const internshipsData = [
  {
    id: uuidv4(),
    title: "Frontend Developer Intern",
    duration: "3 Months",
    price: 0,
    featuredSkills: ["React.js", "Tailwind CSS", "JavaScript"]
  },
  {
    id: uuidv4(),
    title: "Backend API Intern",
    duration: "3 Months",
    price: 0,
    featuredSkills: ["Node.js", "Express", "MongoDB"]
  },
  {
    id: uuidv4(),
    title: "Data Analyst Intern",
    duration: "4 Months",
    price: 0,
    featuredSkills: ["Python", "SQL", "Pandas"]
  },
  {
    id: uuidv4(),
    title: "UI/UX Designer Intern",
    duration: "2 Months",
    price: 0,
    featuredSkills: ["Figma", "Wireframing", "Prototyping"]
  }
];

const jobsData = [
  {
    id: uuidv4(),
    role: "Software Development Engineer I",
    company: "TCS",
    verified: true,
    location: "Remote",
    experience: "0-2 Years",
    salary: "₹4.0L - ₹6.5L"
  },
  {
    id: uuidv4(),
    role: "Frontend Engineer",
    company: "Razorpay",
    verified: true,
    location: "Bangalore",
    experience: "1-3 Years",
    salary: "₹8.0L - ₹12.0L"
  },
  {
    id: uuidv4(),
    role: "Data Analyst",
    company: "Infosys",
    verified: true,
    location: "Pune",
    experience: "0-1 Years",
    salary: "₹5.0L - ₹7.0L"
  },
  {
    id: uuidv4(),
    role: "React Native Developer",
    company: "Zomato",
    verified: true,
    location: "Gurgaon",
    experience: "1-2 Years",
    salary: "₹10.0L - ₹15.0L"
  },
  {
    id: uuidv4(),
    role: "Backend Engineer (Node.js)",
    company: "Paytm",
    verified: false,
    location: "Noida",
    experience: "2-4 Years",
    salary: "₹12.0L - ₹18.0L"
  },
  {
    id: uuidv4(),
    role: "UI/UX Designer",
    company: "Freshworks",
    verified: true,
    location: "Chennai",
    experience: "1-3 Years",
    salary: "₹6.0L - ₹9.0L"
  }
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;

    console.log("Clearing existing data...");
    await db.collection("courses").deleteMany({});
    await db.collection("internships").deleteMany({});
    await db.collection("jobs").deleteMany({});

    console.log("Inserting new courses...");
    await db.collection("courses").insertMany(coursesData);
    
    console.log("Inserting new internships...");
    await db.collection("internships").insertMany(internshipsData);

    console.log("Inserting new jobs...");
    await db.collection("jobs").insertMany(jobsData);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedDatabase();

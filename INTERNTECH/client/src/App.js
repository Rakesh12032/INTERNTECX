import React from "react";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import NexAIChatbot from "./components/NexAIChatbot";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLearning from "./pages/CourseLearning";
import Internship from "./pages/Internship";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import NotFound from "./pages/NotFound";
import Verify from "./pages/Verify";
import Ambassador from "./pages/Ambassador";
import QuizAssessment from "./pages/QuizAssessment";
import Admin from "./pages/Admin";
import CollegeVerify from "./pages/CollegeVerify";
import CompanyPortal from "./pages/CompanyPortal";
import Overview from "./pages/Dashboard/Overview";
import Progress from "./pages/Dashboard/Progress";
import ShareAndEarn from "./pages/Dashboard/ShareAndEarn";
import MyCertificates from "./pages/Dashboard/MyCertificates";
import MyJobs from "./pages/Dashboard/MyJobs";

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="min-h-[calc(100vh-148px)]">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <NexAIChatbot />
      <ScrollToTop />
      <CookieBanner />
    </div>
  );
}

function DashboardLayout() {
  const links = [
    ["/dashboard", "Overview"],
    ["/dashboard/progress", "Progress"],
    ["/dashboard/referral", "Share & Earn"],
    ["/dashboard/certificates", "My Certificates"],
    ["/dashboard/jobs", "My Jobs"]
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Your personal InternTech workspace.</p>
        <div className="mt-6 space-y-2">
          {links.map(([href, label]) => (
            <Link key={href} to={href} className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium transition hover:border-blue hover:text-blue dark:border-slate-800">
              {label}
            </Link>
          ))}
        </div>
      </aside>
      <Outlet />
    </div>
  );
}

function SimpleShell({ title, description }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-[32px] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/internship" element={<Internship />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/ambassador" element={<Ambassador />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/college-verify" element={<CollegeVerify />} />
              <Route path="/company-login" element={<CompanyPortal />} />
              <Route path="/quiz" element={<SimpleShell title="Quiz Center" description="Course quiz instructions and launch flow will appear here." />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/learn/:courseId" element={<CourseLearning />} />
                <Route path="/quiz/:courseId" element={<QuizAssessment />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Overview />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="referral" element={<ShareAndEarn />} />
                  <Route path="certificates" element={<MyCertificates />} />
                  <Route path="jobs" element={<MyJobs />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

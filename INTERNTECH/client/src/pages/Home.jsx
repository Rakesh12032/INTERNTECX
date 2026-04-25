import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Crown,
  Gem,
  GraduationCap,
  Laptop2,
  ShieldCheck,
  Sparkles,
  Rocket,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import StatsCounter from "../components/StatsCounter";
import { SkeletonCard } from "../components/SkeletonLoader";

const testimonials = [
  {
    name: "Ananya Singh",
    college: "NIT Patna",
    city: "Patna",
    quote: "Interntex helped me go from confusion to clarity. The course flow and internship structure felt practical from day one."
  },
  {
    name: "Shivam Raj",
    college: "IET Lucknow",
    city: "Lucknow",
    quote: "I completed the full stack path, passed the quiz, and finally had something strong to show on my resume and LinkedIn."
  },
  {
    name: "Priya Kumari",
    college: "BCE Bhagalpur",
    city: "Bhagalpur",
    quote: "The platform felt student-friendly and motivating. I especially liked the certificate verification and dashboard progress."
  },
  {
    name: "Aman Verma",
    college: "AKTU",
    city: "Kanpur",
    quote: "What stood out was the structure. It was not random content. I knew exactly what to do next each week."
  },
  {
    name: "Ritika Sinha",
    college: "MMMUT Gorakhpur",
    city: "Gorakhpur",
    quote: "Interntex made learning feel career-focused. I got exposed to projects, quizzes, and actual opportunities in one place."
  }
];

const features = [
  ["Free Certificate", Award, "Earn verified proof of completion after clearing assessments."],
  ["Expert Mentors", Users, "Learn with structured guidance built around student outcomes."],
  ["Real Projects", Laptop2, "Practice using project-oriented lessons and practical workflows."],
  ["Job Assistance", BriefcaseBusiness, "Move from learning into internships and job discovery faster."],
  ["LinkedIn Badge", BadgeCheck, "Show achievements publicly with clean verification links."],
  ["Community Access", Rocket, "Stay connected with peers who are building toward the same goal."]
];

const companyNames = ["TCS", "Infosys", "Wipro", "Razorpay", "Zomato", "Paytm", "Freshworks", "BrowserStack"];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get("/courses?limit=6&featured=true");
        setCourses(response.data.courses || []);
      } catch (_error) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  const visibleTestimonials = useMemo(
    () => [0, 1, 2].map((offset) => testimonials[(testimonialIndex + offset) % testimonials.length]),
    [testimonialIndex]
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="mesh-gradient relative overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-orb-pulse absolute -left-20 top-20 h-96 w-96 rounded-full bg-blue/30 blur-3xl"></div>
          <div className="animate-orb-pulse absolute -right-20 top-40 h-96 w-96 rounded-full bg-cyan/20 blur-3xl" style={{ animationDelay: "2s" }}></div>
        </div>
        <div className="mx-auto grid min-h-[95vh] max-w-7xl gap-12 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="scroll-fade-up z-10">
            <div className="inline-flex rounded-full border border-cyan/40 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              #1 Internship Platform in Bihar
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-6xl md:text-[4rem]">
              Launch Your Tech Career with <span className="bg-gradient-to-r from-cyan to-blue bg-clip-text text-transparent drop-shadow-md">interntex</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl text-slate-200 drop-shadow-sm">
              Real Internships. Verified Certificates. Dream Jobs. Experience the most dynamic learning ecosystem.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/courses" className="glow-button inline-flex items-center gap-2 rounded-full bg-cyan px-8 py-4 text-base font-bold text-navy transition hover:-translate-y-1 hover:bg-cyan/90">
                Explore Courses <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/internship" className="rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-navy">
                Apply for Internship
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 text-sm">
              {[
                ["500+", "Students", GraduationCap],
                ["20+", "Courses", Sparkles],
                ["45+", "Hiring Companies", Building2]
              ].map(([value, label, Icon]) => (
                <div key={label} className="group rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <Icon className="h-5 w-5 text-cyan transition group-hover:scale-110" />
                  <p className="mt-2 text-2xl font-bold text-white drop-shadow-md">{value}</p>
                  <p className="mt-1 text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 scroll-fade-up lg:ml-auto">
            {/* Floating Pills */}
            <div className="animate-float-fast absolute -left-8 -top-8 z-20 hidden items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex">
              <ShieldCheck className="h-6 w-6 text-cyan" />
              <div>
                <p className="text-xs font-semibold text-slate-300">Verified By</p>
                <p className="text-sm font-bold text-white">Top Tech Firms</p>
              </div>
            </div>

            <div className="animate-float-slow absolute -bottom-6 -right-6 z-20 hidden items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-blue"></div>
                <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-cyan"></div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-gold text-[10px] font-bold text-navy">+5k</div>
              </div>
              <p className="ml-2 text-sm font-bold text-white">Active Learners</p>
            </div>

            <div className="animate-float certificate-shell mx-auto max-w-md rounded-[34px] p-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-105">
              <div className="relative overflow-hidden rounded-[32px] bg-white/95 p-8 text-slate-900 backdrop-blur-2xl">
                <div className="absolute inset-0 certificate-ornament opacity-30" />
                <div className="absolute right-5 top-5 rounded-full border border-gold/40 bg-gold/10 p-2">
                  <ShieldCheck className="h-6 w-6 text-gold" />
                </div>
                <div className="absolute -right-6 top-20 rotate-45 rounded-full bg-navy px-8 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold shadow-md">
                  Verified
                </div>
                <div className="absolute bottom-6 right-6 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-double border-gold/70 bg-gold/10 font-heading text-[10px] font-bold uppercase tracking-widest text-gold">
                  Seal
                </div>
                <div className="flex items-center justify-center gap-3">
                  <img src="/interntex-logo.png" alt="interntex" className="h-10 w-auto drop-shadow-sm" />
                  <p className="text-center font-heading text-2xl font-bold lowercase text-navy">interntex</p>
                </div>
                <div className="mx-auto mt-4 h-px w-52 bg-gradient-to-r from-transparent via-gold to-transparent" />
                <p className="mt-5 text-center font-certificate text-3xl font-extrabold text-navy">Certificate of Completion</p>
                <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Awarded To</p>
                <p className="mt-2 text-center font-certificate text-[2.5rem] font-bold leading-tight text-gold drop-shadow-md">Rakesh Kumar</p>
                <p className="mt-4 text-center text-sm font-medium text-slate-600">For successfully mastering Full Stack Web Development</p>
                <div className="mx-auto mt-6 h-px w-64 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <div className="mt-8 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>ID: INT-2026-2210</span>
                  <span className="text-gold">100% Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy py-8 text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <StatsCounter target={500} suffix="+" label="Students" icon={GraduationCap} />
          <StatsCounter target={20} suffix="+" label="Courses" icon={Gem} />
          <StatsCounter target={350} suffix="+" label="Certificates Issued" icon={Award} />
          <StatsCounter target={45} suffix="+" label="Companies" icon={Crown} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">Popular Courses</p>
            <h2 className="mt-2 text-3xl font-bold">Popular Courses</h2>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-blue">
            View All Courses
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
            : courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.slug || course.id}`} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue/10 dark:border-slate-800 dark:bg-slate-900">
                  <div className="rounded-2xl bg-gradient-to-br from-blue via-cyan to-navy p-6 text-white">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{course.category}</span>
                    <h3 className="mt-10 text-2xl font-bold">{course.title}</h3>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>{course.duration}</span>
                    <span>{course.level}</span>
                    <span>{course.enrolledCount}+ enrolled</span>
                  </div>
                  <button type="button" className="glow-button mt-5 w-full rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-navy">
                    Enroll Now
                  </button>
                </Link>
              ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">Why Choose Us</p>
          <h2 className="mt-2 text-3xl font-bold">Built for real student outcomes</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map(([title, Icon, description]) => (
            <div key={title} className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/10 text-blue">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">How It Works</p>
            <h2 className="mt-2 text-3xl font-bold">A simple path from learning to placement</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["1", "Register Free", "Create your account, verify with OTP, and choose your path."],
              ["2", "Learn and Complete", "Follow lessons, track progress, and finish the course flow."],
              ["3", "Get Certified and Placed", "Pass the quiz, unlock certificates, and explore jobs."]
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-950">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue text-lg font-bold text-white">
                  {number}
                </div>
                <h3 className="mt-5 text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold">Students who found momentum with Interntex</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {visibleTestimonials.map((item) => (
            <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue text-lg font-bold text-white">
                  {item.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.college} | {item.city}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">"{item.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-navy via-blue to-cyan py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">Ambassador Program</p>
            <h2 className="mt-2 text-4xl font-bold">Lead your campus and grow your reach</h2>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                ["50+", "Ambassadors"],
                ["20+", "Colleges"],
                ["2L+", "Earned"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center">
                  <p className="text-2xl font-bold text-gold">{value}</p>
                  <p className="mt-1 text-sm text-slate-100">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-start lg:justify-end">
            <Link to="/ambassador" className="glow-button rounded-full bg-white px-8 py-4 text-sm font-semibold text-navy transition hover:-translate-y-1">
              Become an Ambassador
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gold/10 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">Share and Earn</p>
          <h2 className="mt-2 text-4xl font-bold">Refer friends. Earn Rs. 199 per referral. No limit.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Share your code", CircleDollarSign],
              ["Friend enrolls", Users],
              ["You earn", Award]
            ].map(([label, Icon]) => (
              <div key={label} className="rounded-3xl border border-gold/20 bg-white p-8 dark:bg-slate-900">
                <Icon className="mx-auto h-10 w-10 text-gold" />
                <p className="mt-4 text-lg font-semibold">{label}</p>
              </div>
            ))}
          </div>
          <Link to="/dashboard/referral" className="glow-button mt-10 inline-flex rounded-full bg-gold px-8 py-4 text-sm font-semibold text-navy transition hover:-translate-y-1">
            Start Earning
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">Placement Stats</p>
          <h2 className="mt-2 text-4xl font-bold">127 Students Placed | 45+ Hiring Companies | Rs. 3.2 LPA Average Package</h2>
          <div className="marquee-shell mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="marquee-track">
              {[...companyNames, ...companyNames].map((company, index) => (
                <div key={`${company}-${index}`} className="mx-2 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-semibold dark:bg-slate-800">
                  <Building2 className="h-4 w-4 text-blue" />
                  <span>{company}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl rounded-[40px] bg-gradient-to-r from-navy to-blue px-8 py-14 text-center text-white shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">Ready to Start?</p>
          <h2 className="mt-3 text-4xl font-bold">Ready to start your tech journey?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="glow-button rounded-full bg-white px-6 py-4 text-sm font-semibold text-navy transition hover:-translate-y-1">
              Register for Free
            </Link>
            <Link to="/courses" className="rounded-full border border-white/20 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

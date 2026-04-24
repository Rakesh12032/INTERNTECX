import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Laptop2,
  Rocket,
  ShieldCheck,
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
    quote:
      "InternTech helped me go from confusion to clarity. The course flow and internship structure felt practical from day one."
  },
  {
    name: "Shivam Raj",
    college: "IET Lucknow",
    city: "Lucknow",
    quote:
      "I completed the full stack path, passed the quiz, and finally had something strong to show on my resume and LinkedIn."
  },
  {
    name: "Priya Kumari",
    college: "BCE Bhagalpur",
    city: "Bhagalpur",
    quote:
      "The platform felt student-friendly and motivating. I especially liked the certificate verification and dashboard progress."
  },
  {
    name: "Aman Verma",
    college: "AKTU",
    city: "Kanpur",
    quote:
      "What stood out was the structure. It was not random content. I knew exactly what to do next each week."
  },
  {
    name: "Ritika Sinha",
    college: "MMMUT Gorakhpur",
    city: "Gorakhpur",
    quote:
      "InternTech made learning feel career-focused. I got exposed to projects, quizzes, and actual opportunities in one place."
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

const companyNames = [
  "TCS",
  "Infosys",
  "Wipro",
  "Razorpay",
  "Zomato",
  "Paytm",
  "Freshworks",
  "BrowserStack"
];

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
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0A1628_0%,#1e3a5f_50%,#0A1628_100%)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,212,255,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.12),_transparent_32%)]" />
        <div className="mx-auto grid min-h-[92vh] max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="relative">
            <div className="inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan">
              #1 Internship Platform in Bihar
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-tight text-white sm:text-6xl">
              Launch Your Tech Career with InternTech
            </h1>
            <p className="mt-5 max-w-xl text-xl text-slate-300">
              Real Internships. Verified Certificates. Dream Jobs.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-blue px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-blue/90"
              >
                Explore Courses <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/internship"
                className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-navy"
              >
                Apply for Internship
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
              {[
                ["500+", "Students"],
                ["20+", "Courses"],
                ["45+", "Hiring Companies"]
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-2xl font-bold text-gold">{value}</p>
                  <p className="mt-1 text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-cyan/20 blur-2xl" />
            <div className="absolute -right-6 bottom-8 h-24 w-24 rounded-full bg-gold/20 blur-2xl" />
            <div className="mx-auto max-w-xl rounded-[34px] border border-gold/25 bg-white/8 p-5 shadow-2xl shadow-blue/20 backdrop-blur-xl">
              <div className="rounded-[30px] border-[5px] border-gold bg-[linear-gradient(180deg,#fffdf8_0%,#f8f4ea_100%)] p-9 text-slate-900 shadow-[inset_0_0_0_1px_rgba(201,164,92,0.35)]">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-500">
                  <span>InternTech</span>
                  <span>Verified Certificate</span>
                </div>
                <div className="mt-6 border-y border-gold/40 py-6 text-center">
                  <p className="font-certificate text-[42px] font-bold text-navy">
                    Certificate of Completion
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.32em] text-slate-500">
                    This certifies that
                  </p>
                  <p className="mt-4 font-certificate text-5xl font-bold text-gold">
                    Rakesh Kumar
                  </p>
                  <p className="mt-4 text-base text-slate-600">
                    has successfully completed the intensive training in
                  </p>
                  <p className="mt-3 text-2xl font-bold text-blue">
                    Full Stack Web Development
                  </p>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</p>
                    <p className="mt-2 font-semibold">12 Weeks</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Certificate ID</p>
                    <p className="mt-2 font-mono text-sm font-semibold">INT-2026-2210</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                      <ShieldCheck className="h-4 w-4" />
                      Verified
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <div className="w-40 border-b border-slate-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-600">Director, InternTech</p>
                  </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-gold bg-navy text-center text-xs font-bold uppercase tracking-[0.2em] text-white">
                    Official
                    <br />
                    Seal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy py-8 text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <StatsCounter target={500} suffix="+" label="Students" />
          <StatsCounter target={20} suffix="+" label="Courses" />
          <StatsCounter target={350} suffix="+" label="Certificates Issued" />
          <StatsCounter target={45} suffix="+" label="Companies" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">
              Popular Courses
            </p>
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
                <Link
                  key={course.id}
                  to={`/courses/${course.slug || course.id}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="rounded-2xl bg-gradient-to-br from-blue via-cyan to-navy p-6 text-white">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                      {course.category}
                    </span>
                    <h3 className="mt-10 text-2xl font-bold">{course.title}</h3>
                  </div>
                  <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {course.overview}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>{course.duration}</span>
                    <span>{course.level}</span>
                    <span>{course.enrolledCount}+ enrolled</span>
                  </div>
                  <button
                    type="button"
                    className="mt-5 w-full rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-navy"
                  >
                    Enroll Now
                  </button>
                </Link>
              ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">
            Why Choose Us
          </p>
          <h2 className="mt-2 text-3xl font-bold">Built for real student outcomes</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map(([title, Icon, description]) => (
            <div
              key={title}
              className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/10 text-blue">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold">A simple path from learning to placement</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["1", "Register Free", "Create your account, verify with OTP, and choose your path."],
              ["2", "Learn and Complete", "Follow lessons, track progress, and finish the course flow."],
              ["3", "Get Certified and Placed", "Pass the quiz, unlock certificates, and explore jobs."]
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue text-lg font-bold text-white">
                  {number}
                </div>
                <h3 className="mt-5 text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">
            Testimonials
          </p>
          <h2 className="mt-2 text-3xl font-bold">Students who found momentum with InternTech</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {visibleTestimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
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
              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
                "{item.quote}"
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-navy via-blue to-cyan py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">
              Ambassador Program
            </p>
            <h2 className="mt-2 text-4xl font-bold">Lead your campus and grow your reach</h2>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                ["50+", "Ambassadors"],
                ["20+", "Colleges"],
                ["2L+", "Earned"]
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center"
                >
                  <p className="text-2xl font-bold text-gold">{value}</p>
                  <p className="mt-1 text-sm text-slate-100">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-start lg:justify-end">
            <Link
              to="/ambassador"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-navy transition hover:-translate-y-1"
            >
              Become an Ambassador
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gold/10 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
            Share and Earn
          </p>
          <h2 className="mt-2 text-4xl font-bold">
            Refer friends. Earn Rs. 199 per referral. No limit.
          </h2>
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
          <Link
            to="/dashboard/referral"
            className="mt-10 inline-flex rounded-full bg-gold px-8 py-4 text-sm font-semibold text-navy transition hover:-translate-y-1"
          >
            Start Earning
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">
            Placement Stats
          </p>
          <h2 className="mt-2 text-4xl font-bold">
            127 Students Placed | 45+ Hiring Companies | Rs. 3.2 LPA Average Package
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {companyNames.map((company) => (
              <div
                key={company}
                className="rounded-3xl border border-slate-200 bg-white px-6 py-5 font-semibold dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="h-5 w-5 text-blue" />
                  <span>{company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl rounded-[40px] bg-gradient-to-r from-navy to-blue px-8 py-14 text-center text-white shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">
            Ready to Start?
          </p>
          <h2 className="mt-3 text-4xl font-bold">Ready to start your tech journey?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-white px-6 py-4 text-sm font-semibold text-navy transition hover:-translate-y-1"
            >
              Register for Free
            </Link>
            <Link
              to="/courses"
              className="rounded-full border border-white/20 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from "react";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src="/interntex-logo.png" alt="interntex" className="h-12 w-auto rounded-xl bg-white p-1" />
            <div>
              <h3 className="font-heading text-2xl font-bold lowercase text-white">interntex</h3>
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400">Learn. Intern. Succeed.</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">Learn. Intern. Succeed. Built for ambitious students who want skills, internships, certificates, and careers.</p>
          <div className="mt-4 flex gap-3">
            {[Linkedin, Instagram, Twitter, Github].map((Icon, index) => (
              <span key={index} className="rounded-full border border-white/10 p-2 text-slate-300">
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg font-semibold text-white">Quick Links</h4>
          <div className="mt-4 space-y-2 text-sm">
            {["/", "/courses", "/internship", "/jobs", "/ambassador"].map((href, index) => (
              <Link key={href} to={href} className="block text-slate-400 transition hover:text-white">
                {["Home", "Courses", "Internship", "Jobs", "Ambassador"][index]}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg font-semibold text-white">Platform</h4>
          <div className="mt-4 space-y-2 text-sm">
            {[
              ["Register", "/register"],
              ["Login", "/login"],
              ["Certificate Verify", "/verify"],
              ["College Portal", "/college-verify"]
            ].map(([label, href]) => (
              <Link key={href} to={href} className="block text-slate-400 transition hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg font-semibold text-white">Newsletter</h4>
          <p className="mt-4 text-sm text-slate-400">Get course launches, hiring updates, and internship openings.</p>
          <div className="mt-4 flex gap-2">
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Enter your email" />
            <button type="button" className="rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue/90">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2025 InternTech. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

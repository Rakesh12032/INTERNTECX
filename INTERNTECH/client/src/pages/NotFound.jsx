import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(245,158,11,0.14),_transparent_35%)]" />
      <div className="relative max-w-2xl text-center">
        <div className="mx-auto h-24 w-24 animate-bounce rounded-full border border-slate-300 bg-white/70 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/70" />
        <p className="mt-8 font-heading text-8xl font-bold text-blue md:text-9xl">404</p>
        <h1 className="mt-4 text-3xl font-bold md:text-4xl">Oops! This page does not exist.</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          The link may be outdated, or this module is still being prepared inside InternTech.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-blue px-6 py-4 text-sm font-semibold text-white transition hover:bg-navy"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

import React from "react";

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-5 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

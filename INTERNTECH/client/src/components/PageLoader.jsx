import React from "react";

export default function PageLoader() {
  return (
    <div className="flex min-h-[calc(100vh-148px)] w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border-4 border-blue opacity-20"></div>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue dark:border-slate-800 dark:border-t-blue"></div>
        </div>
        <p className="animate-pulse text-sm font-medium text-slate-500 dark:text-slate-400">Loading InternTech...</p>
      </div>
    </div>
  );
}

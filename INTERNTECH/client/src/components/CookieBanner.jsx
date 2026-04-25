import React, { useEffect, useState } from "react";

const STORAGE_KEY = "Interntex_cookie_pref";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const preference = localStorage.getItem(STORAGE_KEY);
    setVisible(!preference);
  }, []);

  const savePreference = (value) => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We use cookies to improve your experience.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => savePreference("accepted")} className="rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white">
            Accept
          </button>
          <button type="button" onClick={() => savePreference("declined")} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

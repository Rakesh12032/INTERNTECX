import React, { useEffect, useRef, useState } from "react";

export default function StatsCounter({ target = 0, suffix = "", label, icon: Icon }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return undefined;
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 60));
    const timer = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        window.clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 33);
    return () => window.clearInterval(timer);
  }, [started, target]);

  return (
    <div
      ref={ref}
      className="group rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 text-center shadow-lg backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-cyan/20"
    >
      {Icon ? (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/40 to-blue/40 text-white ring-1 ring-white/20 transition group-hover:scale-110">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <p className="mt-4 text-4xl font-bold text-white">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-200">{label}</p>
    </div>
  );
}

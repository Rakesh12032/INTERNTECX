import React, { useEffect, useRef, useState } from "react";

export default function StatsCounter({ target = 0, suffix = "", label }) {
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
    <div ref={ref} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
      <p className="text-4xl font-bold text-white">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-slate-300">{label}</p>
    </div>
  );
}

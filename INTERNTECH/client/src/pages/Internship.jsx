import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const schema = yup.object({
  name: yup.string().required("Full name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  phone: yup.string().matches(/^[0-9]{10}$/, "Phone must be 10 digits").required("Phone is required"),
  college: yup.string().required("College is required"),
  branch: yup.string().required("Branch is required"),
  year: yup.string().required("Year is required"),
  linkedin: yup.string().url("Enter a valid URL").required("LinkedIn URL is required"),
  github: yup.string().nullable(),
  whyYou: yup.string().min(20, "Tell us a bit more").required("Reason is required")
});

export default function Internship() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      college: user?.college || ""
    }
  });

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const response = await api.get("/internships");
        setTracks(response.data || []);
      } catch (_error) {
        setTracks([]);
      }
    };

    loadTracks();
  }, []);

  const onSubmit = async (values) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/internship" } });
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/internships/apply", { ...values, trackId: selectedTrack.id });
      toast.success("Internship application submitted");
      setSelectedTrack(null);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[36px] bg-gradient-to-br from-navy via-blue to-cyan p-8 text-white">
        <h1 className="text-4xl font-bold">Internships that build real experience</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-100">Choose a guided track, work on projects, and earn a verified certificate after completion.</p>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {tracks.map((track) => (
          <div key={track.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-2xl font-bold">{track.title}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{track.duration} · ₹{track.price}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(track.featuredSkills || []).map((skill) => (
                <span key={skill} className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue">{skill}</span>
              ))}
            </div>
            <button type="button" onClick={() => setSelectedTrack(track)} className="mt-6 w-full rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy">
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {selectedTrack ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-8 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue">Apply Now</p>
                <h2 className="mt-2 text-3xl font-bold">{selectedTrack.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedTrack(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                ["name", "Full Name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["college", "College"],
                ["branch", "Branch"],
                ["year", "Year"],
                ["linkedin", "LinkedIn URL"],
                ["github", "GitHub URL"]
              ].map(([field, label]) => (
                <div key={field} className={field === "github" ? "sm:col-span-2" : ""}>
                  <label className="mb-2 block text-sm font-semibold">{label}</label>
                  <input {...register(field)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
                  {errors[field] ? <p className="mt-2 text-sm text-danger">{errors[field].message}</p> : null}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">Why should we choose you?</label>
                <textarea {...register("whyYou")} rows="5" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
                {errors.whyYou ? <p className="mt-2 text-sm text-danger">{errors.whyYou.message}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-70">
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

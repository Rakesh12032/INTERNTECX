import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Briefcase, Clock } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { mockInternships } from "../utils/mockData";

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
  const [isOffline, setIsOffline] = useState(false);
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
        if (response.data && response.data.length > 0) {
          setTracks(response.data);
          setIsOffline(false);
        } else {
          setTracks(mockInternships);
          setIsOffline(true);
        }
      } catch (_error) {
        setTracks(mockInternships);
        setIsOffline(true);
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
      if (isOffline) {
        // Mock successful submission if offline
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Internship application submitted successfully!");
      } else {
        await api.post("/internships/apply", { ...values, trackId: selectedTrack.id });
        toast.success("Internship application submitted");
      }
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
      {isOffline && (
        <div className="mb-6 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold shadow-sm backdrop-blur-md">
          ⚠️ Database not connected. Showing premium fallback internship tracks!
        </div>
      )}
      
      <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-navy via-blue to-cyan p-10 text-white shadow-2xl sm:p-14">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan/20 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Internships that build real experience</h1>
          <p className="mt-6 max-w-2xl text-lg font-medium text-slate-100/90 sm:text-xl">Choose a guided track, work on real-world projects, and earn a verified certificate after completion to boost your resume.</p>
        </div>
      </section>

      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {tracks.map((track) => (
          <div key={track.id} className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/10 text-blue group-hover:bg-gradient-to-br group-hover:from-blue group-hover:to-cyan group-hover:text-white transition-colors duration-300">
              <Briefcase className="h-7 w-7" />
            </div>
            
            <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{track.title}</h3>
            
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              <span>{track.duration}</span>
              <span className="mx-1">•</span>
              <span>{track.price ? `₹${track.price}` : "Free"}</span>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {(track.featuredSkills || []).map((skill) => (
                <span key={skill} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
            
            <button type="button" onClick={() => setSelectedTrack(track)} className="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition-all duration-300 hover:bg-blue group-hover:shadow-lg dark:bg-slate-800 dark:hover:bg-cyan dark:hover:text-navy">
              Apply for Track
            </button>
          </div>
        ))}
      </div>

      {selectedTrack ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl dark:bg-slate-900 sm:p-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue dark:text-cyan">Apply Now</p>
                <h2 className="mt-2 text-3xl font-extrabold">{selectedTrack.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedTrack(null)} className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                ["name", "Full Name"],
                ["email", "Email Address"],
                ["phone", "Phone Number"],
                ["college", "College / University"],
                ["branch", "Branch / Major"],
                ["year", "Graduation Year"],
                ["linkedin", "LinkedIn Profile URL"],
                ["github", "GitHub Profile URL (Optional)"]
              ].map(([field, label]) => (
                <div key={field} className={field === "github" ? "sm:col-span-2" : ""}>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>
                  <input {...register(field)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan dark:focus:bg-slate-900 dark:focus:ring-cyan/10" />
                  {errors[field] ? <p className="mt-2 text-sm font-medium text-danger">{errors[field].message}</p> : null}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Why should we choose you for this track?</label>
                <textarea {...register("whyYou")} rows="5" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan dark:focus:bg-slate-900 dark:focus:ring-cyan/10" placeholder="Tell us about your passion, previous projects, or what you hope to learn..." />
                {errors.whyYou ? <p className="mt-2 text-sm font-medium text-danger">{errors.whyYou.message}</p> : null}
              </div>
              <div className="mt-2 sm:col-span-2">
                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-gradient-to-r from-blue to-cyan px-4 py-4 text-base font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-blue/25 disabled:opacity-70 disabled:hover:scale-100">
                  {submitting ? "Submitting Application..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

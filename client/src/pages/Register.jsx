import React, { useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const schema = yup.object({
  name: yup.string().required("Full Name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  phone: yup.string().matches(/^[0-9]{10}$/, "Phone must be 10 digits").required("Phone is required"),
  password: yup
    .string()
    .matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, "Min 8 chars, 1 uppercase, 1 number")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
  college: yup.string().required("College Name is required"),
  degree: yup.string().required("Degree is required"),
  branch: yup.string().required("Branch is required"),
  year: yup.string().required("Year is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  referralCode: yup.string().nullable()
});

function FieldError({ error }) {
  return error ? <p className="mt-1.5 text-xs text-danger">{error.message}</p> : null;
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(600);
  const referralFromUrl = searchParams.get("ref") || "";

  const defaultValues = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      college: "",
      degree: "B.Tech",
      branch: "",
      year: "1st",
      city: "",
      state: "",
      referralCode: referralFromUrl
    }),
    [referralFromUrl]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  });

  useEffect(() => {
    setValue("referralCode", referralFromUrl);
  }, [referralFromUrl, setValue]);

  useEffect(() => {
    if (!otpModalOpen) return undefined;
    const timer = window.setInterval(() => {
      setOtpTimer((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpModalOpen]);

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      await api.post("/auth/register", values);
      toast.success("OTP sent to your email");
      setOtpModalOpen(true);
      setOtpTimer(600);
      setOtp("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setOtpLoading(true);
      const response = await api.post("/auth/verify-otp", {
        email: watch("email"),
        otp
      });
      login(response.data.token, response.data.user);
      toast.success("Account verified successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post("/auth/resend-otp", { email: watch("email") });
      setOtpTimer(60);
      toast.success("OTP resent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="hidden bg-gradient-to-br from-navy via-blue to-cyan p-8 text-white lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan">
            InternTech Registration
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white">
            Join a platform built for learners who want outcomes.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-100">
            Enroll in career-focused courses, apply for internships, earn verified certificates,
            and track everything from one dashboard.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Start free. Verify with OTP. Begin learning right away.
          </p>

          {referralFromUrl ? (
            <div className="mt-4 rounded-2xl border border-gold bg-gold/10 px-4 py-3 text-sm font-medium text-gold">
              You were referred. Complete enrollment to begin.
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["name", "Full Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["college", "College Name"],
              ["branch", "Branch"],
              ["city", "City"],
              ["state", "State"]
            ].map(([field, label]) => (
              <div key={field} className={field === "college" ? "sm:col-span-2 xl:col-span-3" : ""}>
                <label className="mb-1.5 block text-sm font-semibold">{label}</label>
                <input
                  {...register(field)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
                />
                <FieldError error={errors[field]} />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Degree</label>
              <select
                {...register("degree")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
              >
                {["B.Tech", "BCA", "MCA", "BSc", "Other"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <FieldError error={errors.degree} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Year</label>
              <select
                {...register("year")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
              >
                {["1st", "2nd", "3rd", "4th", "Pass-out"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <FieldError error={errors.year} />
            </div>

            {[
              ["password", "Password", showPassword, setShowPassword, errors.password],
              [
                "confirmPassword",
                "Confirm Password",
                showConfirmPassword,
                setShowConfirmPassword,
                errors.confirmPassword
              ]
            ].map(([field, label, visible, setter, error]) => (
              <div key={field} className="relative sm:col-span-2 xl:col-span-1">
                <label className="mb-1.5 block text-sm font-semibold">{label}</label>
                <input
                  type={visible ? "text" : "password"}
                  {...register(field)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => setter((prev) => !prev)}
                  className="absolute right-4 top-[40px] text-slate-400"
                >
                  {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <FieldError error={error} />
              </div>
            ))}

            <div className="sm:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-sm font-semibold">Referral Code</label>
              <input
                {...register("referralCode")}
                readOnly={Boolean(referralFromUrl)}
                className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue dark:bg-slate-950 ${
                  referralFromUrl
                    ? "border-gold bg-gold/10 text-gold dark:border-gold"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              />
            </div>

            <div className="sm:col-span-2 xl:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-blue px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-70"
              >
                {submitting ? "Creating Account..." : "Register Free"}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue">
              Login
            </Link>
          </p>
        </div>
      </div>

      {otpModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl dark:bg-slate-900">
            <h3 className="text-2xl font-bold">Verify your email</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Enter the 6-digit OTP sent to {watch("email")}.
            </p>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
              maxLength={6}
              className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-4 text-center font-mono text-2xl tracking-[0.45em] outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Time left: {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}
              </span>
              <button
                type="button"
                disabled={otpTimer > 540}
                onClick={resendOtp}
                className="font-semibold text-blue disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Resend OTP
              </button>
            </div>
            <button
              type="button"
              onClick={verifyOtp}
              disabled={otp.length !== 6 || otpLoading}
              className="mt-6 w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-70"
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

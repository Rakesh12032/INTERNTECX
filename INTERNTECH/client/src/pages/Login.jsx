import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const schema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required")
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const response = await api.post("/auth/login", values);
      login(response.data.token, response.data.user);
      toast.success("Login successful");
      const target = location.state?.from?.pathname || (response.data.user.role === "admin" ? "/admin" : "/dashboard");
      navigate(target);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await api.post("/auth/forgot-password", { email: forgotEmail });
      toast.success(response.data.message || "Reset link generated");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to process request");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-[36px] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold">Intern<span className="text-blue">Tech</span></h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Welcome back. Continue learning and building your career.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">Email</label>
            <input {...register("email")} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
            {errors.email ? <p className="mt-2 text-sm text-danger">{errors.email.message}</p> : null}
          </div>

          <div className="relative">
            <label className="mb-2 block text-sm font-semibold">Password</label>
            <input type={showPassword ? "text" : "password"} {...register("password")} className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 top-[46px] text-slate-400">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.password ? <p className="mt-2 text-sm text-danger">{errors.password.message}</p> : null}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <input type="checkbox" className="rounded border-slate-300" />
              Remember me
            </label>
            <button type="button" onClick={() => setForgotOpen(true)} className="font-semibold text-blue">
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-70">
            {submitting ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          New here? <Link to="/register" className="font-semibold text-blue">Register free</Link>
        </p>
      </div>

      {forgotOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 dark:bg-slate-900">
            <h3 className="text-2xl font-bold">Forgot Password</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Enter your registered email to generate a reset token.</p>
            <input value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" placeholder="your@email.com" />
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setForgotOpen(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-700">Cancel</button>
              <button type="button" onClick={handleForgotPassword} className="flex-1 rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white">Send Reset Link</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

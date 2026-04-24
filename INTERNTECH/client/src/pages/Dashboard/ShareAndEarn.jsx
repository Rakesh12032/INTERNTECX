import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

function progressWidth(balance) {
  if (balance >= 500) return "w-full";
  if (balance >= 400) return "w-4/5";
  if (balance >= 300) return "w-3/5";
  if (balance >= 200) return "w-2/5";
  if (balance >= 100) return "w-1/5";
  return "w-[8%]";
}

export default function ShareAndEarn() {
  const [referralData, setReferralData] = useState(null);
  const [walletHistory, setWalletHistory] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [form, setForm] = useState({
    accountName: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
    amount: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [referralResponse, historyResponse, withdrawalsResponse] = await Promise.all([
        api.get("/referral/my"),
        api.get("/wallet/history"),
        api.get("/wallet/withdrawals")
      ]);
      setReferralData(referralResponse.data);
      setWalletHistory(historyResponse.data || []);
      setWithdrawals(withdrawalsResponse.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load referral dashboard");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const remaining = useMemo(() => Math.max(0, 500 - (referralData?.walletBalance || 0)), [referralData]);

  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch (_error) {
      toast.error("Copy failed");
    }
  };

  const submitWithdrawal = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/wallet/withdraw", form);
      toast.success("Withdrawal request submitted");
      setForm({
        accountName: "",
        bankName: "",
        accountNumber: "",
        ifsc: "",
        upiId: "",
        amount: ""
      });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!referralData) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">Loading referral dashboard...</div>;
  }

  const referralLink = `${window.location.origin}/register?ref=${referralData.referralCode}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-gradient-to-r from-gold via-amber-400 to-orange-400 p-8 text-navy">
        <p className="text-sm font-semibold uppercase tracking-[0.24em]">Share and Earn</p>
        <h1 className="mt-3 text-4xl font-bold">{referralData.referralCode}</h1>
        <p className="mt-4 max-w-2xl text-base">Invite your friends to InternTech and earn 199 rupees for each successful referral payment.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => handleCopy(referralData.referralCode, "Referral code")} className="rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white">
            Copy Code
          </button>
          <button type="button" onClick={() => handleCopy(referralLink, "Referral link")} className="rounded-2xl border border-navy px-5 py-3 text-sm font-semibold text-navy">
            Copy Link
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Wallet Balance", `Rs. ${referralData.walletBalance || 0}`],
          ["Total Earned", `Rs. ${referralData.totalEarned || 0}`],
          ["Referrals", referralData.referralCount || 0],
          ["Pending Unlock", `Rs. ${remaining}`]
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-lg font-semibold">Withdrawal unlock progress</p>
        <div className="mt-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className={`h-4 rounded-full bg-blue ${progressWidth(referralData.walletBalance || 0)}`} />
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Rs. {referralData.walletBalance || 0} / Rs. 500 - {remaining} more to go.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Referral History</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(referralData.referralList || []).map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-4">{item.referredStudentName}</td>
                    <td className="py-4">{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4">Rs. {item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!referralData.referralList?.length ? <p className="pt-4 text-slate-500 dark:text-slate-400">No referrals yet.</p> : null}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Withdrawal</h2>
            {(referralData.walletBalance || 0) >= 500 ? (
              <form onSubmit={submitWithdrawal} className="mt-6 space-y-4">
                {[
                  ["accountName", "Account Name"],
                  ["bankName", "Bank Name"],
                  ["accountNumber", "Account Number"],
                  ["ifsc", "IFSC Code"],
                  ["upiId", "UPI ID"],
                  ["amount", "Amount"]
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-2 block text-sm font-semibold">{label}</label>
                    <input
                      value={form[key]}
                      onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                ))}
                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white">
                  {submitting ? "Submitting..." : "Request Withdrawal"}
                </button>
              </form>
            ) : (
              <p className="mt-4 text-slate-500 dark:text-slate-400">Refer {Math.ceil(remaining / 199)} more successful students to unlock withdrawals.</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Wallet Activity</h2>
            <div className="mt-6 space-y-4">
              {walletHistory.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.description}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <p className={`font-bold ${item.type === "credit" ? "text-success" : "text-danger"}`}>
                      {item.type === "credit" ? "+" : "-"}Rs. {item.amount}
                    </p>
                  </div>
                </div>
              ))}
              {!walletHistory.length ? <p className="text-slate-500 dark:text-slate-400">No wallet activity yet.</p> : null}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold">Withdrawal History</h2>
        <div className="mt-6 space-y-4">
          {withdrawals.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <div>
                <p className="font-semibold">Rs. {item.amount}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {item.status}
              </span>
            </div>
          ))}
          {!withdrawals.length ? <p className="text-slate-500 dark:text-slate-400">No withdrawals yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

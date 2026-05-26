import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatUSD } from "@/lib/mockData";
import { Field, ResultRow, ResultPanel } from "./shared";

export default function DebtPayoffCalculator() {
  const [debt, setDebt] = useState(10000);
  const [apr, setApr] = useState(19.99);
  const [payment, setPayment] = useState(300);

  const result = useMemo(() => {
    let balance = debt;
    const r = apr / 100 / 12;
    const data: { month: number; balance: number }[] = [{ month: 0, balance: debt }];
    let totalInterest = 0;
    let months = 0;
    const min = balance * r + 1;
    if (payment <= min) return { months: Infinity, totalInterest: 0, data };
    while (balance > 0 && months < 600) {
      const interest = balance * r;
      const principal = Math.min(balance, payment - interest);
      balance -= principal;
      totalInterest += interest;
      months++;
      data.push({ month: months, balance: Math.max(0, balance) });
    }
    return { months, totalInterest, data };
  }, [debt, apr, payment]);

  const possible = result.months !== Infinity;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Debt details</h2>
        <Field label="Total balance" value={debt} onChange={setDebt} prefix="$" />
        <Field label="Annual interest rate (APR)" value={apr} onChange={setApr} suffix="%" step={0.1} />
        <Field label="Monthly payment" value={payment} onChange={setPayment} prefix="$" />
      </div>

      <ResultPanel title="Your payoff plan">
        {possible ? (
          <>
            <ResultRow label="Months to payoff" value={`${result.months}`} highlight="good" />
            <ResultRow label="≈ years" value={`${(result.months / 12).toFixed(1)} yrs`} />
            <ResultRow label="Total interest paid" value={formatUSD(result.totalInterest)} highlight="bad" />
            <ResultRow label="Total cost" value={formatUSD(debt + result.totalInterest)} />
            <div className="h-48 mt-2">
              <ResponsiveContainer>
                <LineChart data={result.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.7)" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ background: "#0F172A", border: "none", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="balance" stroke="#FB7185" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="text-rose-200 text-sm">Your monthly payment is too low to cover the interest. Increase it to start making progress.</p>
        )}
      </ResultPanel>
    </div>
  );
}

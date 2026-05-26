import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatUSD } from "@/lib/mockData";
import { Field, ResultRow, ResultPanel } from "./shared";

export default function SavingsGoalCalculator() {
  const [goal, setGoal] = useState(10000);
  const [current, setCurrent] = useState(1000);
  const [monthly, setMonthly] = useState(300);
  const [apy, setApy] = useState(4.5);

  const result = useMemo(() => {
    const r = apy / 100 / 12;
    let bal = current;
    let totalContrib = current;
    let months = 0;
    const data: { month: number; balance: number }[] = [{ month: 0, balance: current }];
    while (bal < goal && months < 1200) {
      bal = bal * (1 + r) + monthly;
      totalContrib += monthly;
      months++;
      if (months % Math.max(1, Math.floor(months / 60 + 1)) === 0 || bal >= goal) {
        data.push({ month: months, balance: Math.min(bal, goal) });
      }
    }
    const interest = bal - totalContrib;
    return { months, interest: Math.max(0, interest), data, possible: bal >= goal };
  }, [goal, current, monthly, apy]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Your savings goal</h2>
        <Field label="Goal amount" value={goal} onChange={setGoal} prefix="$" />
        <Field label="Current savings" value={current} onChange={setCurrent} prefix="$" />
        <Field label="Monthly contribution" value={monthly} onChange={setMonthly} prefix="$" />
        <Field label="Annual yield (APY)" value={apy} onChange={setApy} suffix="%" step={0.1} />
      </div>

      <ResultPanel title="Your savings plan">
        {result.possible ? (
          <>
            <ResultRow label="Months to goal" value={`${result.months}`} highlight="good" />
            <ResultRow label="≈ years" value={`${(result.months / 12).toFixed(1)} yrs`} />
            <ResultRow label="Interest earned" value={formatUSD(result.interest)} />
            <div className="h-48 mt-2">
              <ResponsiveContainer>
                <LineChart data={result.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.7)" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ background: "#0F172A", border: "none", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="text-rose-200 text-sm">At this rate you won't reach your goal in 100 years. Try increasing the monthly contribution.</p>
        )}
      </ResultPanel>
    </div>
  );
}

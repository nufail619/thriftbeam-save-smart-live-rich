import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatUSD } from "@/lib/mockData";
import { Field, ResultRow, ResultPanel, CHART_TOOLTIP_STYLE, ClientOnly } from "./shared";

const COLORS = ["#2563EB", "#FB7185", "#10B981"];

export default function BudgetCalculator() {
  const [income, setIncome] = useState(5000);
  const [needs, setNeeds] = useState(2200);
  const [wants, setWants] = useState(1100);
  const [savings, setSavings] = useState(700);

  const total = needs + wants + savings;
  const remaining = income - total;
  const recommended = { needs: income * 0.5, wants: income * 0.3, savings: income * 0.2 };

  const data = [
    { name: "Needs", value: needs },
    { name: "Wants", value: wants },
    { name: "Savings", value: Math.max(0, savings) },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Your monthly numbers</h2>
        <Field label="Monthly income" value={income} onChange={setIncome} prefix="$" />
        <Field label="Needs (rent, utilities, food)" value={needs} onChange={setNeeds} prefix="$" />
        <Field label="Wants (dining, subscriptions)" value={wants} onChange={setWants} prefix="$" />
        <Field label="Savings & debt payments" value={savings} onChange={setSavings} prefix="$" />
      </div>

      <ResultPanel title="Your allocation">
        <ResultRow label="Total spent" value={formatUSD(total)} />
        <ResultRow label="Remaining" value={formatUSD(remaining)} highlight={remaining >= 0 ? "good" : "bad"} />
        <div className="mt-2 w-full h-56 min-h-[224px]">
          <ClientOnly>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#0F172A", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
        <div className="pt-3 border-t border-border space-y-1.5 text-sm">
          <div className="font-semibold mb-1 text-foreground">50/30/20 target</div>
          <ResultRow small label="Needs (50%)" value={formatUSD(recommended.needs)} />
          <ResultRow small label="Wants (30%)" value={formatUSD(recommended.wants)} />
          <ResultRow small label="Savings (20%)" value={formatUSD(recommended.savings)} />
        </div>
      </ResultPanel>
    </div>
  );
}

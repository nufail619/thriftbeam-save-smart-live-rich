import { useMemo, useState } from "react";
import { formatUSD } from "@/lib/mockData";
import { Field, ResultRow, ResultPanel } from "./shared";

export default function EmergencyFundCalculator() {
  const [expenses, setExpenses] = useState(3500);
  const [months, setMonths] = useState(6);
  const [saved, setSaved] = useState(500);
  const [monthlySave, setMonthlySave] = useState(400);

  const target = useMemo(() => expenses * months, [expenses, months]);
  const remaining = Math.max(0, target - saved);
  const monthsToReach = monthlySave > 0 ? Math.ceil(remaining / monthlySave) : Infinity;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Your safety net</h2>
        <Field label="Average monthly expenses" value={expenses} onChange={setExpenses} prefix="$" />
        <label className="block">
          <span className="text-sm font-medium">Months of cushion</span>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {[3, 6, 9, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`h-12 rounded-xl border font-semibold transition-colors ${
                  months === m ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                }`}
              >{m} mo</button>
            ))}
          </div>
        </label>
        <Field label="Already saved" value={saved} onChange={setSaved} prefix="$" />
        <Field label="Monthly savings rate" value={monthlySave} onChange={setMonthlySave} prefix="$" />
      </div>

      <ResultPanel title="Your emergency fund">
        <ResultRow label="Target amount" value={formatUSD(target)} highlight="good" />
        <ResultRow label="Still needed" value={formatUSD(remaining)} />
        <ResultRow label="Months to reach" value={monthsToReach === Infinity ? "—" : `${monthsToReach}`} />
        <ResultRow label="Progress" value={`${Math.min(100, Math.round((saved / target) * 100))}%`} />
        <div className="pt-3">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (saved / target) * 100)}%` }} />
          </div>
        </div>
      </ResultPanel>
    </div>
  );
}

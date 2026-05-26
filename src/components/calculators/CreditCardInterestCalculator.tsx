import { useMemo, useState } from "react";
import { formatUSD } from "@/lib/mockData";
import { Field, ResultRow, ResultPanel } from "./shared";

function payoff(balance: number, apr: number, payment: number) {
  let bal = balance;
  const r = apr / 100 / 12;
  let interest = 0;
  let months = 0;
  if (payment <= bal * r) return { months: Infinity, interest: 0 };
  while (bal > 0 && months < 1000) {
    const i = bal * r;
    const principal = Math.min(bal, payment - i);
    bal -= principal;
    interest += i;
    months++;
  }
  return { months, interest };
}

export default function CreditCardInterestCalculator() {
  const [balance, setBalance] = useState(4500);
  const [apr, setApr] = useState(22.99);
  const [payment, setPayment] = useState(150);

  const current = useMemo(() => payoff(balance, apr, payment), [balance, apr, payment]);
  const doubled = useMemo(() => payoff(balance, apr, payment * 2), [balance, apr, payment]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Card details</h2>
        <Field label="Current balance" value={balance} onChange={setBalance} prefix="$" />
        <Field label="APR" value={apr} onChange={setApr} suffix="%" step={0.1} />
        <Field label="Monthly payment" value={payment} onChange={setPayment} prefix="$" />
      </div>

      <ResultPanel title="The real cost of minimums">
        <div className="rounded-xl bg-surface border border-border p-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Paying {formatUSD(payment)}/mo</div>
          {current.months === Infinity ? (
            <p className="text-rose-600 text-sm">Payment doesn't cover the interest. Increase it.</p>
          ) : (
            <>
              <ResultRow label="Months to payoff" value={`${current.months}`} />
              <ResultRow label="Total interest" value={formatUSD(current.interest)} highlight="bad" />
            </>
          )}
        </div>
        <div className="rounded-xl bg-surface border border-border p-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Paying {formatUSD(payment * 2)}/mo</div>
          {doubled.months === Infinity ? (
            <p className="text-rose-600 text-sm">Still not enough.</p>
          ) : (
            <>
              <ResultRow label="Months to payoff" value={`${doubled.months}`} highlight="good" />
              <ResultRow label="Total interest" value={formatUSD(doubled.interest)} />
              {current.months !== Infinity && (
                <ResultRow label="You save" value={formatUSD(current.interest - doubled.interest)} highlight="good" />
              )}
            </>
          )}
        </div>
      </ResultPanel>
    </div>
  );
}

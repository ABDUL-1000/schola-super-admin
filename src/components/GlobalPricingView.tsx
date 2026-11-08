import React, { useEffect, useState } from 'react';
import type { PlatformPricingConfig } from '@/types';
import { Button, Card, Field, Input, MoneyInput, naira, shortDate } from '@/components/ui';

interface GlobalPricingViewProps {
  pricing: PlatformPricingConfig;
  onSavePricing: (data: {
    standardRatePerStudent: number;
    cbtProRatePerStudent: number;
    aiEliteRatePerStudent: number;
    minimumStudentFloor: number;
    defaultGracePeriodDays: number;
  }) => Promise<void>;
  isLoading: boolean;
}

export const GlobalPricingView: React.FC<GlobalPricingViewProps> = ({ pricing, onSavePricing }) => {
  const [rate, setRate] = useState(pricing.standardRatePerStudent);
  const [floor, setFloor] = useState(pricing.minimumStudentFloor);
  const [grace, setGrace] = useState(pricing.defaultGracePeriodDays);
  const [saving, setSaving] = useState(false);

  // Pick up the saved values once they load from the server.
  useEffect(() => {
    setRate(pricing.standardRatePerStudent);
    setFloor(pricing.minimumStudentFloor);
    setGrace(pricing.defaultGracePeriodDays);
  }, [pricing.version, pricing.standardRatePerStudent, pricing.minimumStudentFloor, pricing.defaultGracePeriodDays]);

  const dirty = rate !== pricing.standardRatePerStudent || floor !== pricing.minimumStudentFloor || grace !== pricing.defaultGracePeriodDays;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // One price for every plan for now; plans differ by features.
      await onSavePricing({
        standardRatePerStudent: Number(rate),
        cbtProRatePerStudent: Number(rate),
        aiEliteRatePerStudent: Number(rate),
        minimumStudentFloor: Number(floor),
        defaultGracePeriodDays: Number(grace),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <Card>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Standard price</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          What a school pays per student each term, unless you've agreed a different price with that school.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Price per student, per term">
            <MoneyInput required step="50" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </Field>
          <Field label="Minimum students billed" hint={`A school with fewer students still pays for ${floor || 0} (${naira(rate * floor)} a term).`}>
            <Input type="number" min="1" required value={floor} onChange={(e) => setFloor(Number(e.target.value))} className="tabular" />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Late payment</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">How long a school keeps access after its subscription ends, before it's locked.</p>
        <div className="mt-5 max-w-xs">
          <Field label="Grace period (days)">
            <Input type="number" min="1" max="60" required value={grace} onChange={(e) => setGrace(Number(e.target.value))} className="tabular" />
          </Field>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Version {pricing.version}
          {pricing.updatedAt ? ` · last changed ${shortDate(pricing.updatedAt)}` : ''}. Saving keeps the old prices in history.
        </p>
        <Button type="submit" variant="primary" loading={saving} disabled={!dirty}>
          Save prices
        </Button>
      </div>
    </form>
  );
};

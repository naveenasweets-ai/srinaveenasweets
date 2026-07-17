/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import type { ChargesConfig } from '../../types/appContentTypes';

const defaultCharges: ChargesConfig = {
  deliveryFee: 40,
  freeDeliveryThreshold: 499,
  platformFee: 29,
  packagingFee: 15,
  gstRate: 5,
};

const fieldMeta: {
  key: keyof ChargesConfig;
  label: string;
  hint: string;
}[] = [
  {
    key: 'deliveryFee',
    label: 'Delivery Fee (₹)',
    hint: 'Set 0 to hide delivery fee in checkout',
  },
  {
    key: 'freeDeliveryThreshold',
    label: 'Free Delivery Above (₹)',
    hint: 'Cart total above this qualifies for free delivery',
  },
  {
    key: 'platformFee',
    label: 'Platform Fee (₹)',
    hint: 'Set 0 to hide platform fee in checkout',
  },
  {
    key: 'packagingFee',
    label: 'Packaging Fee (₹)',
    hint: 'Set 0 to hide packaging fee in checkout',
  },
  {
    key: 'gstRate',
    label: 'GST Rate (%)',
    hint: 'Per-product GST, ignored for products with GST included',
  },
];

export default function Charges() {
  const { siteContent, setSiteContent } = useStore();
  const { saveCharges, fetchSiteContent } = AppCustomApi();

  const [form, setForm] = useState<ChargesConfig>(defaultCharges);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = siteContent?.charges;
    if (saved) {
      setForm({
        deliveryFee: saved.deliveryFee ?? defaultCharges.deliveryFee,
        freeDeliveryThreshold:
          saved.freeDeliveryThreshold ?? defaultCharges.freeDeliveryThreshold,
        platformFee: saved.platformFee ?? defaultCharges.platformFee,
        packagingFee: saved.packagingFee ?? defaultCharges.packagingFee,
        gstRate: saved.gstRate ?? defaultCharges.gstRate,
      });
    }
  }, [siteContent?.charges]);

  const handleChange = (key: keyof ChargesConfig, raw: string) => {
    const value = raw === '' ? 0 : Number(raw);
    setForm((prev) => ({
      ...prev,
      [key]: Number.isNaN(value) ? 0 : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await saveCharges(form);
      if (saved) {
        const refreshed = await fetchSiteContent();
        if (refreshed?.success) {
          setSiteContent((prev) => ({
            ...prev,
            charges: refreshed.charges || prev.charges,
            categories: refreshed.categories || prev.categories,
            heroContent: refreshed.heroContent || prev.heroContent,
            features: refreshed.features || prev.features,
          }));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="rounded-2xl border border-[#e8c86c]/70 bg-[#fff8ef] p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fieldMeta.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#5f1021]">
                {field.label}
              </label>
              <input
                type="number"
                min="0"
                step={field.key === 'gstRate' ? '0.1' : '1'}
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full rounded-xl border border-[#e8c86c] bg-[#fffdf7] px-3 py-2 text-[#4d2b1f] outline-none transition focus:border-[#5f1021] focus:ring-2 focus:ring-[#f3d48a]"
              />
              <p className="mt-1 text-[11px] text-[#8a6a4a]">{field.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#5f1021] px-4 py-2.5 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a1a2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Charges'}
          </button>
        </div>
      </div>
    </form>
  );
}

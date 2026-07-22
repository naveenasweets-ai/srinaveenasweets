/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import type { DeliverablePincodesConfig } from '../../types/appContentTypes';

export default function DeliverablePincodes() {
  const { siteContent, setSiteContent } = useStore();
  const { saveDeliverablePincodes, fetchSiteContent } = AppCustomApi();

  const [pincodes, setPincodes] = useState<DeliverablePincodesConfig>([]);
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = siteContent?.deliverablePincodes;
    if (saved && Array.isArray(saved)) {
      setPincodes(saved);
    }
  }, [siteContent?.deliverablePincodes]);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (pincodes.includes(trimmed)) {
      setInputValue('');
      return;
    }
    setPincodes((prev) => [...prev, trimmed]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (pincode: string) => {
    setPincodes((prev) => prev.filter((p) => p !== pincode));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await saveDeliverablePincodes(pincodes);
      if (saved) {
        const refreshed = await fetchSiteContent();
        if (refreshed?.success) {
          setSiteContent((prev) => ({
            ...prev,
            deliverablePincodes: refreshed.deliverablePincodes || prev.deliverablePincodes,
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
    <form onSubmit={handleSave} className="space-y-4">
      <div className="rounded-2xl border border-[#e8c86c]/70 bg-[#fff8ef] p-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#5f1021]">
          Add deliverable pincode
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter pincode"
            className="w-full rounded-xl border border-[#e8c86c] bg-[#fffdf7] px-3 py-2 text-[#4d2b1f] outline-none transition focus:border-[#5f1021] focus:ring-2 focus:ring-[#f3d48a]"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-[#5f1021] px-4 py-2 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a1a2d]"
          >
            Add
          </button>
        </div>

        {pincodes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {pincodes.map((pincode) => (
              <div
                key={pincode}
                className="flex items-center gap-2 rounded-lg border border-[#e8c86c] bg-[#fffdf7] px-3 py-1.5"
              >
                <span className="text-sm text-[#4d2b1f]">{pincode}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(pincode)}
                  className="text-[#5f1021] transition hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#5f1021] px-4 py-2.5 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a1a2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Pincodes'}
          </button>
        </div>
      </div>
    </form>
  );
}

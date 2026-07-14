import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import { getDefaultFeatures } from '../../utils/utils';
import type { FeatureItem } from '../../types/appContentTypes';

export default function Features() {
  const { siteContent, setSiteContent, showToast } = useStore();
  const { fetchSiteContent, saveFeatures } = AppCustomApi();

  const [featuresForm, setFeaturesForm] =
    useState<FeatureItem[]>(getDefaultFeatures());

  useEffect(() => {
    const formSetting = async () => {
      const savedFeatures = Array.isArray(siteContent?.features)
        ? siteContent.features
        : [];

      const normalizedFeatures = getDefaultFeatures().map((preset, index) => {
        const saved = savedFeatures[index];
        return {
          _id: saved?._id,
          title: saved?.title?.trim() || preset.title,
          description: saved?.description || '',
          icon: preset.icon,
        };
      });

      setFeaturesForm(normalizedFeatures);
    };

    formSetting();
  }, [siteContent?.features]);

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...featuresForm];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      description: value,
    };
    setFeaturesForm(updatedFeatures);
  };

  const handleFeaturesSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedFeatures = featuresForm.map((feature) => ({
      _id: feature._id,
      title: feature.title?.trim() || '',
      description: feature.description?.trim() || '',
      icon: feature.icon,
    }));

    const saved = await saveFeatures(sanitizedFeatures);
    if (saved?.success) {
      const refreshed = await fetchSiteContent();
      if (refreshed?.success) {
        setSiteContent((prev) => ({
          ...prev,
          features: refreshed.features || [],
          categories: refreshed.categories || prev.categories,
          heroContent: refreshed.heroContent || prev.heroContent,
        }));
        showToast('Features updated successfully', 'success');
      }
    }
  };

  return (
    <form onSubmit={handleFeaturesSave} className="space-y-5">
      <div className="rounded-2xl border border-[#e8c86c]/70 bg-[#fff8ef] p-4">
        <div className="space-y-6">
          {featuresForm.map((feature, index) => (
            <div
              key={feature._id || `${feature.title}-${index}`}
              className="rounded-2xl border border-[#e8c86c]/70 bg-[#fffdf7] p-4"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-[28px] bg-linear-to-br from-[#8b1e2d] to-[#5f1021] text-[#f3d48a] sm:h-12 sm:w-12">
                  {feature.icon.svg}
                </div>
                <div>
                  <div className="font-semibold text-[#5f1021]">
                    {feature.title}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#5f1021]">
                    Title
                  </label>
                  <div className="pointer-events-none opacity-60">
                    <input
                      value={feature.title}
                      readOnly
                      className="w-full rounded-xl border border-[#e8c86c] bg-[#f5f0e5] px-3 py-2 text-[#4d2b1f] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#5f1021]">
                    Description
                  </label>
                  <input
                    value={feature.description}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="w-full rounded-xl border border-[#e8c86c] bg-[#fffdf7] px-3 py-2 text-[#4d2b1f] outline-none transition focus:border-[#5f1021] focus:ring-2 focus:ring-[#f3d48a]"
                    placeholder="Describe the feature"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-[#5f1021] px-4 py-2.5 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a1a2d]"
          >
            Save Features
          </button>
        </div>
      </div>
    </form>
  );
}

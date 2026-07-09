import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import type { HeroContent } from '../../types/appContentTypes';
import { fileToBase64 } from '../../utils/utils';
import type { Product } from '../../types/contextTypes';

export default function Hero() {
  const { siteContent, products } = useStore();
  const { fetchSiteContent, saveHeroContent } = AppCustomApi();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [heroForm, setHeroForm] = useState<HeroContent>({});

  const handleHeroSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await saveHeroContent(heroForm).then((res) => res);

    if (saved.success) {
      const updated = await fetchSiteContent().then((res) => res);
      console.log('updated: ', updated);
      if (updated.success) setHeroForm(updated.heroContent || {});
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setHeroForm((prev) => ({ ...prev, image: base64 }));
    if (e.target) e.target.value = '';
  };

  useEffect(() => {
    const settingHero = async () => {
      if (siteContent?.heroContent) {
        setHeroForm(siteContent.heroContent);
      }
    };

    settingHero();
  }, [siteContent]);

  return (
    <div className="rounded-2xl p-5 shadow-xs">
      <form onSubmit={handleHeroSave} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Eyebrow
            </label>
            <input
              value={heroForm.eyebrow || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, eyebrow: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Title Line 1
            </label>
            <input
              value={heroForm.titleLine1 || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, titleLine1: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Title Line 2
            </label>
            <input
              value={heroForm.titleLine2 || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, titleLine2: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Subtitle
            </label>
            <input
              value={heroForm.subtitle || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, subtitle: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Description
            </label>
            <textarea
              value={heroForm.description || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, description: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              rows={5}
            />
          </div>
          <div className="flex flex-col gap-4 my-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Featured Product
              </label>
              <select
                value={heroForm.featuredProductId || ''}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    featuredProductId: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              >
                <option value="">-- select product --</option>
                {products.map((p: Product) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p._id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex  flex-col lg:flex-row gap-4">
          <div className="flex lg:w-1/2 flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Primary Button Label
              </label>
              <input
                value={heroForm.primaryButtonLabel || ''}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    primaryButtonLabel: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Primary Button Target
              </label>
              <input
                value={heroForm.primaryButtonTarget || ''}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    primaryButtonTarget: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              />
            </div>
          </div>
          <div className="flex lg:w-1/2 flex-col gap-0">
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Image URL
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-gold-200 px-3 py-2 bg-white"
              onChange={handleImageChange}
            />
            {heroForm.image && (
              <div className="mt-3 rounded-xl border border-gold-100 p-2">
                <img
                  src={heroForm.image}
                  alt="Category preview"
                  className="h-[28vh] w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="flex-1 rounded-2xl bg-[#5f1021] px-4 py-2.5 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a1a2d]"
        >
          Save Hero Section
        </button>
      </form>
    </div>
  );
}

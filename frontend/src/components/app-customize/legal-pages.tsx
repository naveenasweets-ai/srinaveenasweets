/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import {
  normalizeLegalPages,
  sanitizeRichHtml,
  isRichHtmlEmpty,
} from '../../utils/utils';
import type { LegalPage } from '../../types/appContentTypes';
import RichTextEditor from './rich-text-editor';

type Mode = 'edit' | 'view';

export default function LegalPages() {
  const { siteContent, setSiteContent } = useStore();
  const { fetchSiteContent, saveLegalPages } = AppCustomApi();

  const [pages, setPages] = useState<LegalPage[]>(() =>
    normalizeLegalPages(siteContent?.legalPages),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('edit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPages(normalizeLegalPages(siteContent?.legalPages));
  }, [siteContent?.legalPages]);

  const activePage = pages[activeIndex];

  const handleFieldChange = (
    field: 'title' | 'description' | 'content',
    value: string,
  ) => {
    setPages((prev) =>
      prev.map((page, index) =>
        index === activeIndex ? { ...page, [field]: value } : page,
      ),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sanitized = pages.map((page) => ({
        slug: page.slug,
        title: page.title?.trim() || '',
        description: page.description?.trim() || '',
        content: isRichHtmlEmpty(page.content)
          ? ''
          : sanitizeRichHtml(page.content),
      }));

      const saved = await saveLegalPages(sanitized);
      if (saved?.success) {
        const refreshed = await fetchSiteContent();
        if (refreshed?.success) {
          setSiteContent((prev) => ({
            ...prev,
            legalPages: normalizeLegalPages(refreshed.legalPages),
          }));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (!activePage) return null;

  const previewHtml = sanitizeRichHtml(activePage.content);

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Tab switcher: pick which of the 4 fixed pages to edit */}
      <div className="flex flex-wrap gap-2">
        {pages.map((page, index) => (
          <button
            key={page.slug}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              index === activeIndex
                ? 'bg-[#5f1021] text-[#fff8ef] shadow-sm'
                : 'bg-[#fff8ef] text-[#5f1021] border border-[#e8c86c] hover:bg-[#f3d48a]/40'
            }`}
          >
            {page.title}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#e8c86c]/70 bg-[#fff8ef] p-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#5f1021]">
            Title
          </label>
          <input
            value={activePage.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Page title"
            className="w-full rounded-xl border border-[#e8c86c] bg-[#fffdf7] px-3 py-2 text-[#4d2b1f] outline-none transition focus:border-[#5f1021] focus:ring-2 focus:ring-[#f3d48a]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#5f1021]">
            Description
          </label>
          <textarea
            value={activePage.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            rows={2}
            placeholder="Short description shown under the title"
            className="w-full rounded-xl border border-[#e8c86c] bg-[#fffdf7] px-3 py-2 text-[#4d2b1f] outline-none transition focus:border-[#5f1021] focus:ring-2 focus:ring-[#f3d48a]"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-[#5f1021]">
              Content
            </label>

            {/* Edit / View toggle */}
            <div className="inline-flex rounded-lg border border-[#e8c86c] bg-[#fffdf7] p-0.5">
              {(['edit', 'view'] as Mode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                    mode === option
                      ? 'bg-[#5f1021] text-[#fff8ef]'
                      : 'text-[#5f1021] hover:bg-[#f3d48a]/40'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {mode === 'edit' ? (
            <RichTextEditor
              value={activePage.content}
              onChange={(html) => handleFieldChange('content', html)}
              placeholder="Write the page content. Use the toolbar for bold, italic, links, lists and more."
            />
          ) : (
            <div className="rounded-xl border border-[#e8c86c] bg-[#fffdf7] p-4 max-h-105 overflow-auto">
              {isRichHtmlEmpty(previewHtml) ? (
                <p className="text-sm text-[#b7997a]">
                  Nothing to preview yet.
                </p>
              ) : (
                <div
                  className="legal-rich-text text-[#4d2b1f]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          )}

          <p className="mt-1 text-[11px] text-[#8a6a4a]">
            Use the toolbar to format text (bold, italic, underline, links,
            headings, lists). Switch to <strong>View</strong> to preview how it
            will look on the public page.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#5f1021] px-4 py-2.5 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a1a2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Policy Pages'}
          </button>
        </div>
      </div>
    </form>
  );
}

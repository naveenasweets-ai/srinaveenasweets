import { useState } from 'react';
import Categories from '../../components/app-customize/categories';
import Hero from '../../components/app-customize/hero';
import Handpicked from '../../components/app-customize/handpicked';

function SectionAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-(--color-surface) rounded-2xl border border-(--color-accent-light) shadow-xs overflow-hidden transition-all ${
        expanded ? 'shadow-md' : ''
      }`}
    >
      <div
        className="flex flex-nowrap items-center justify-between gap-4 p-4 cursor-pointer hover:bg-(--color-accent-light) transition-colors"
        onClick={() => setExpanded((current) => !current)}
      >
        <h2 className="text-sm font-semibold text-(--color-primary-dark)">
          {title}
        </h2>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-4 h-4 text-(--color-primary) transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-(--color-accent-light) p-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AppCustomize() {
  return (
    <div className="flex flex-col gap-6 p-6 mx-auto max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-(--color-primary-dark)">
          App Customize
        </h1>
        <p className="text-sm text-(--color-primary-light)">
          Customize the app's appearance and menu structure.
        </p>
      </div>

      <SectionAccordion title="Category menu section">
        <Categories />
      </SectionAccordion>

      <SectionAccordion title="Banner section">
        <Hero />
      </SectionAccordion>

      <SectionAccordion title="Handpicked Categories and Products section">
        <Handpicked />
      </SectionAccordion>
    </div>
  );
}

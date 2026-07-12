import { useStore } from '../../context/StoreContext';

export default function Features() {
  const { siteContent } = useStore();
  const features = siteContent?.features ?? [];

  return (
    <section className="py-14 sm:py-20 bg-[color:var(--color-background)] border-y border-[color:var(--color-border)]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2.5 text-center mb-10">
          <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold font-serif text-[color:var(--color-primary-dark)]">
            Our Services
          </h1>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[color:var(--color-muted)]">
            Experience fresh sweets, fast delivery, and trusted service.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
          {features.map(({ icon: { name, svg }, title, description }) => (
            <div
              key={name}
              className="group flex h-full gap-4 lg:flex-col justify-start items-center rounded-2xl lg:p-6 px-2 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(26,15,15,0.22)]"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center text-5xl text-(--color-logo)">
                {svg || name?.charAt(0)?.toUpperCase() || '✦'}
              </div>
              <div className="flex flex-col lg:text-center">
                <h3 className="font-display text-lg font-semibold text-[color:var(--color-primary-dark)] lg:mb-3">
                  {title}
                </h3>
                <p className="text-sm leading-7 text-[color:var(--color-muted)]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

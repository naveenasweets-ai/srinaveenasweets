type Props = {
  title: string;
  subtitle?: string;
  light?: boolean;
};

export default function SectionHeader({
  title,
  subtitle,
  light,
}: Props) {
  return (
    <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto px-4 py-4">
      <h2
        className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 leading-tight"
        style={{ color: light ? '#fff8ef' : '#8b1e2d' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto"
          style={{ color: light ? 'rgba(255, 248, 239, 0.85)' : '#8a6a4a' }}
        >
          {subtitle}
        </p>
      )}
      <div className="flex justify-center mt-6 sm:mt-8">
        <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
          <line
            x1="0"
            y1="10"
            x2="25"
            y2="10"
            stroke={light ? '#f3d48a' : '#d4a017'}
            strokeWidth="1.5"
          />
          <path
            d="M32 4 L40 10 L32 16"
            stroke={light ? '#f3d48a' : '#d4a017'}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="48"
            y1="10"
            x2="80"
            y2="10"
            stroke={light ? '#f3d48a' : '#d4a017'}
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}

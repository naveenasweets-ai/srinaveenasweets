import { useEffect, useRef, useState } from 'react';

type DropdownOption = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
};

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select',
  className = '',
  buttonClassName = '',
  menuClassName = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 rounded-lg border border-[#f3d48a]/70 bg-[#fff8ef] px-3 py-1.5 text-xs font-semibold text-[#5f1021] shadow-sm transition hover:bg-[#fef4da] focus:border-[#d4a017] focus:outline-none focus:ring-2 focus:ring-[#f3d48a]/50 ${buttonClassName}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-20 mt-2 min-w-48 rounded-xl border border-[#f3d48a]/70 bg-[#fffdf7] p-1 shadow-[0_12px_30px_rgba(95,16,33,0.12)] ${menuClassName}`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                value === option.value
                  ? 'bg-[#fef4da] font-semibold text-[#5f1021]'
                  : 'text-[#4d2b1f] hover:bg-[#fff8ef]'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-4 w-4"
                >
                  <path
                    d="m5 12 4 4 10-10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

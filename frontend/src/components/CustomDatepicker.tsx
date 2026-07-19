import { useEffect, useRef, useState } from 'react';

type CustomDatepickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
};

const formatDisplayDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const CustomDatepicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  buttonClassName = '',
  menuClassName = '',
}: CustomDatepickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return { year: date.getFullYear(), month: date.getMonth() };
      }
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
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

  const selectedDate = value ? new Date(value) : null;
  const selectedYear = selectedDate ? selectedDate.getFullYear() : null;
  const selectedMonth = selectedDate ? selectedDate.getMonth() : null;
  const selectedDay = selectedDate ? selectedDate.getDate() : null;

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (viewDate.month === 0) {
      setViewDate({ year: viewDate.year - 1, month: 11 });
    } else {
      setViewDate({ ...viewDate, month: viewDate.month - 1 });
    }
  };

  const handleNextMonth = () => {
    if (viewDate.month === 11) {
      setViewDate({ year: viewDate.year + 1, month: 0 });
    } else {
      setViewDate({ ...viewDate, month: viewDate.month + 1 });
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedValue = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const displayLabel = value ? formatDisplayDate(value) : placeholder;

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected =
      viewDate.year === selectedYear &&
      viewDate.month === selectedMonth &&
      day === selectedDay;
    calendarDays.push(
      <button
        key={day}
        type="button"
        onClick={() => handleDateSelect(day)}
        className={`h-8 w-8 rounded-lg text-xs font-semibold transition cursor-pointer ${
          isSelected
            ? 'bg-[#5f1021] text-white shadow-md'
            : 'text-[#5f1021] hover:bg-[#fef4da]'
        }`}
      >
        {day}
      </button>,
    );
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 rounded-lg border border-[#f3d48a]/70 bg-[#fff8ef] px-3 py-1.5 text-xs font-semibold text-[#5f1021] shadow-sm transition hover:bg-[#fef4da] focus:border-[#d4a017] focus:outline-none focus:ring-2 focus:ring-[#f3d48a]/50 ${buttonClassName}`}
      >
        <span className="truncate">{displayLabel}</span>
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
          className={`absolute right-0 z-20 mt-2 w-72 rounded-xl border border-[#f3d48a]/70 bg-[#fffdf7] p-3 shadow-[0_12px_30px_rgba(95,16,33,0.12)] ${menuClassName}`}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#f3d48a]/70 bg-[#fff8ef] text-[#5f1021] shadow-sm transition hover:bg-[#fef4da] cursor-pointer"
            >
              ‹
            </button>
            <span className="text-sm font-bold text-[#5f1021]">
              {monthNames[viewDate.month]} {viewDate.year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#f3d48a]/70 bg-[#fff8ef] text-[#5f1021] shadow-sm transition hover:bg-[#fef4da] cursor-pointer"
            >
              ›
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div
                key={day}
                className="flex h-8 w-8 items-center justify-center text-[10px] font-bold text-[#8a6a4a]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays}
          </div>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-3 w-full rounded-lg border border-[#f3d48a]/70 bg-[#fff8ef] px-3 py-2 text-xs font-semibold text-[#5f1021] shadow-sm transition hover:bg-[#fef4da] focus:border-[#d4a017] focus:outline-none focus:ring-2 focus:ring-[#f3d48a]/50 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDatepicker;

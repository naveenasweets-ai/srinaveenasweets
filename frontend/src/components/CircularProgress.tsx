import React from 'react';
import { TbRosetteDiscount } from 'react-icons/tb';
import { FiShoppingCart } from 'react-icons/fi';
import { GiPartyPopper } from 'react-icons/gi';
interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  message?: string;
  cartText?: string;
  onCartClick?: () => void;
  visible?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 40,
  strokeWidth = 6,
  message = '',
  cartText = 'View Cart',
  onCartClick,
  visible = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="lg:hidden fixed bottom-2 left-0 right-0 z-50 flex gap-2 m-2 overflow-hidden items-stretch"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(calc(100% + 0.5rem))',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.25s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className="flex-1 flex items-center gap-3 p-2 pl-4 border-r rounded-xl bg-[#fff8ef] border-2 border-[#5f1021] shadow-2xl min-w-0">
        <div className="relative shrink-0">
          <svg width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--color-accent-light)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--color-success)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg">
            <TbRosetteDiscount />
          </span>
        </div>
        <span className="text-sm flex gap-2 items-center text-[#4d2b1f] font-medium truncate">
          <span>{message}</span> {offset === 0 && <GiPartyPopper className="text-m" />}
        </span>
      </div>

      <button
        onClick={onCartClick}
        className="flex items-center justify-center rounded-xl overflow-hidden gap-2 p-3 bg-[#5f1021] text-[#fff8ef] font-semibold text-sm transition-colors hover:bg-[#7a1a2d] flex-shrink-0 min-w-[100px]"
      >
        <FiShoppingCart className="text-base" />
        <span>{cartText}</span>
      </button>
    </div>
  );
};

export default CircularProgress;

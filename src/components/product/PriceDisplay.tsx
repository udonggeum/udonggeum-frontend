import { formatCurrency } from '@/utils/formatting';

interface PriceDisplayProps {
  price: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCurrency?: boolean;
}

/**
 * PriceDisplay Component
 *
 * Consistent price formatting with responsive sizing.
 * Used across product cards, detail pages, and cart.
 */
export default function PriceDisplay({
  price,
  size = 'md',
  className = '',
  showCurrency = true,
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const formattedPrice = showCurrency ? formatCurrency(price) : price.toLocaleString('ko-KR');

  return (
    <span
      className={`font-bold text-[var(--color-gold)] ${sizeClasses[size]} ${className}`}
    >
      {formattedPrice}
    </span>
  );
}

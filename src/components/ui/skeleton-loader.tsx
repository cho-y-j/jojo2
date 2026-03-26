import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = {
  sm: 'rounded-[8px]',
  md: 'rounded-[12px]',
  lg: 'rounded-[16px]',
  full: 'rounded-full',
};

function SkeletonLoader({
  width,
  height = '20px',
  className,
  rounded = 'md',
}: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#F2F4F6]',
        roundedMap[rounded],
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export { SkeletonLoader, type SkeletonLoaderProps };

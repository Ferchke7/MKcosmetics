import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#F0E6DE] via-[#FAF5EE] to-[#F0E6DE] bg-[length:200%_100%] rounded-xl ${className}`}
    />
  );
};

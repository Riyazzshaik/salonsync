
import { motion } from 'framer-motion';

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" }}
      className={`bg-gray-200 rounded-md ${className}`}
    />
  );
};

export const SalonCardSkeleton = () => (
  <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
    <Skeleton className="w-full h-48 rounded-2xl" />
    <Skeleton className="w-2/3 h-6 mt-2" />
    <Skeleton className="w-1/2 h-4" />
    <div className="flex gap-2 mt-2">
      <Skeleton className="w-16 h-6 rounded-full" />
      <Skeleton className="w-24 h-6 rounded-full" />
    </div>
  </div>
);

export const ProfileCardSkeleton = () => (
  <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm mb-3">
    <Skeleton className="w-1/2 h-6 mb-2" />
    <Skeleton className="w-1/3 h-4" />
  </div>
);

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const DealsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-border/50 overflow-hidden bg-card"
        >
          {/* Image Skeleton */}
          <Skeleton className="h-52 w-full" />
          
          <div className="p-5 space-y-4">
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Route */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            {/* Date */}
            <Skeleton className="h-4 w-40" />
            
            {/* Price */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-28" />
            </div>
            
            {/* Button */}
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DealsSkeleton;

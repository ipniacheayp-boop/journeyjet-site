import { motion } from "framer-motion";

interface SkeletonCardProps {
  index: number;
}

const SkeletonCard = ({ index }: SkeletonCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className="rounded-2xl border border-border/50 overflow-hidden bg-card"
  >
    {/* Image Skeleton with shimmer */}
    <div className="relative h-52 w-full bg-muted overflow-hidden">
      <div className="absolute inset-0 shimmer-effect" />
    </div>
    
    <div className="p-5 space-y-4">
      {/* Title */}
      <div className="h-6 w-3/4 bg-muted rounded-lg shimmer-effect" />
      
      {/* Route */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-muted rounded shimmer-effect" />
        <div className="h-4 w-4 bg-muted rounded-full shimmer-effect" />
        <div className="h-4 w-20 bg-muted rounded shimmer-effect" />
      </div>
      
      {/* Date */}
      <div className="h-4 w-40 bg-muted rounded shimmer-effect" />
      
      {/* Price */}
      <div className="space-y-2 pt-2">
        <div className="h-3 w-16 bg-muted rounded shimmer-effect" />
        <div className="h-10 w-28 bg-muted rounded-lg shimmer-effect" />
      </div>
      
      {/* Button */}
      <div className="flex gap-2 pt-2">
        <div className="h-10 flex-1 bg-primary/20 rounded-lg shimmer-effect" />
        <div className="h-10 w-10 bg-muted rounded-lg shimmer-effect" />
      </div>
    </div>
  </motion.div>
);

interface DealsSkeletonProps {
  count?: number;
}

const DealsSkeleton = ({ count = 12 }: DealsSkeletonProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
      
      {/* Shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            hsl(var(--foreground) / 0.05) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default DealsSkeleton;

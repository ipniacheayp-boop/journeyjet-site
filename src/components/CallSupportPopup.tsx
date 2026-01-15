import { X } from "lucide-react";
import agentImage from "@/assets/agent.png";
import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
}

const CallSupportPopup = ({ onClose }: Props) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-white bg-black/50 rounded-full p-1 hover:bg-black"
        >
          <X size={18} />
        </button>

        {/* IMAGE ONLY */}
        <img
          src={agentImage}
          alt="Travel support"
          className="max-w-[1000px] w-full h-auto object-contain"
        />
      </motion.div>
    </motion.div>
  );
};

export default CallSupportPopup;

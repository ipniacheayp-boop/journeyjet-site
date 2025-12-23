import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";

const AppDownload = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10" aria-labelledby="app-download-title">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-xl shadow-primary/30"
          >
            <Smartphone className="w-10 h-10 text-white" aria-hidden="true" />
          </motion.div>

          {/* Title */}
          <h2 id="app-download-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get the ChyeapFlights app
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground mb-8">
            Download our app for exclusive deals, instant notifications, and seamless booking on the go.
          </p>

          {/* App Store Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Google Play Store Badge */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Download on Google Play Store"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wide opacity-80">Get it on</div>
                <div className="text-lg font-semibold leading-tight">Google Play</div>
              </div>
            </motion.button>

            {/* Apple App Store Badge */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Download on Apple App Store"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wide opacity-80">Download on the</div>
                <div className="text-lg font-semibold leading-tight">App Store</div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppDownload;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Map, Compass, Globe, Navigation, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { checklistsData, Checklist, ChecklistCategory, ChecklistItem } from "@/data/checklists";
import { cn } from "@/lib/utils";

// Custom styled checkbox to avoid missing shadcn dependencies
const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onChange}
    className={cn(
      "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5",
      checked 
        ? "bg-primary border-primary text-primary-foreground" 
        : "bg-background border-input hover:border-primary/50 text-transparent"
    )}
  >
    <Check className="w-3.5 h-3.5" />
  </button>
);

const ChecklistSection = ({ 
  checklist, 
  completedItems, 
  toggleItem 
}: { 
  checklist: Checklist; 
  completedItems: Set<string>; 
  toggleItem: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const totalItems = checklist.categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedCount = checklist.categories.reduce(
    (acc, cat) => acc + cat.items.filter(item => completedItems.has(item.id)).length, 
    0
  );
  const progress = Math.round((completedCount / totalItems) * 100) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col mb-8"
    >
      {/* Banner / Header Area */}
      <div 
        className="relative h-48 md:h-64 cursor-pointer group overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10" />
        <img 
          src={checklist.image} 
          alt={checklist.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-end">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{checklist.title}</h2>
              <p className="text-white/80 text-sm md:text-base max-w-2xl">{checklist.description}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-white">
              <span className="text-2xl font-bold">{progress}%</span>
              <div className="flex flex-col text-[10px] font-semibold uppercase tracking-wider opacity-80 leading-tight">
                <span>Completed</span>
                <span>{completedCount} / {totalItems}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Toggle Icon */}
        <div className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
          <ChevronDown className={cn("w-6 h-6 transition-transform duration-300", isOpen && "rotate-180")} />
        </div>
      </div>

      {/* Progress Bar (Visible when closed) */}
      <div className="h-1.5 w-full bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Expandable Content */}
      <div 
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-x-12 gap-y-10">
            {checklist.categories.map((cat, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-semibold text-lg text-foreground">{cat.title}</h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {cat.items.filter(i => completedItems.has(i.id)).length}/{cat.items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {cat.items.map(item => {
                    const isChecked = completedItems.has(item.id);
                    return (
                      <label 
                        key={item.id} 
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        <CustomCheckbox 
                          checked={isChecked} 
                          onChange={() => toggleItem(item.id)} 
                        />
                        <span className={cn(
                          "text-sm pt-0.5 transition-colors",
                          isChecked ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground group-hover:text-primary"
                        )}>
                          {item.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TravelChecklists = () => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localeStorage
  useEffect(() => {
    const saved = localStorage.getItem("journeyjet_checklists");
    if (saved) {
      try {
        setCompletedItems(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to parse checklists scale:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("journeyjet_checklists", JSON.stringify(Array.from(completedItems)));
    }
  }, [completedItems, isLoaded]);

  const toggleItem = (id: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalPossible = checklistsData.reduce(
    (acc, chl) => acc + chl.categories.reduce((cAcc, cat) => cAcc + cat.items.length, 0),
    0
  );
  
  return (
    <>
      <SEOHead
        title="Top Travel Destinations Checklist | Tripile.com"
        description="Track your adventures with our ultimate travel checklists. Top 100 places in the world, USA highlights, and bucket-list trips."
      />
      <Header />
      
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950/60 pb-20">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6 shadow-xl border border-white/20">
                <Map className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-6">
                Ultimate Travel Checklists
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-light">
                Whether you're exploring all 197 countries or seeking the top bucket-list destinations, track your global adventures right here. Your progress is saved automatically.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-4 border border-white/20">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Total Progress</p>
                    <p className="text-white font-bold text-xl">{completedItems.size} <span className="text-white/50 text-base font-normal">/ {totalPossible} places</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Checklists Content */}
        <section className="container mx-auto px-4 -mt-8 relative z-20 max-w-5xl">
          {checklistsData.map((checklist, index) => (
            <motion.div
              key={checklist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ChecklistSection 
                checklist={checklist} 
                completedItems={completedItems} 
                toggleItem={toggleItem} 
              />
            </motion.div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default TravelChecklists;

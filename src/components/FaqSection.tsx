import { Helmet } from "react-helmet";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  /** When true, omits the FAQPage JSON-LD (use if the page already emits it elsewhere). */
  noSchema?: boolean;
}

/**
 * Renders a visible FAQ accordion AND matching FAQPage structured data so the
 * schema always stays in sync with what users actually see on the page.
 */
const FaqSection = ({
  faqs,
  title = "Frequently Asked Questions",
  subtitle,
  className = "",
  noSchema = false,
}: FaqSectionProps) => {
  if (!faqs.length) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className={className}>
      {!noSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        </Helmet>
      )}

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <HelpCircle className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto mt-3">{subtitle}</p>
        )}
      </div>

      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold hover:text-primary transition-colors">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed text-base">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FaqSection;

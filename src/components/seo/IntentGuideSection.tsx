import { Link } from "react-router-dom";
import FaqSection from "@/components/FaqSection";
import type { IntentGuide } from "@/data/flightIntentGuides";

interface Props {
  guide: IntentGuide;
  /** Render the H2 heading (off when the page H1 already states it). */
  showHeading?: boolean;
  /** Omit FAQs (e.g. when the page already emits FAQPage data). */
  hideFaqs?: boolean;
}

const IntentGuideSection = ({ guide, showHeading = true, hideFaqs = false }: Props) => (
  <section className="container mx-auto px-4 py-10 max-w-4xl" aria-label={guide.heading}>
    {showHeading && <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{guide.heading}</h2>}
    <p className="text-muted-foreground leading-relaxed mb-6">{guide.answer}</p>
    {guide.sections.map((s) => (
      <div key={s.heading} className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">{s.heading}</h3>
        {s.paragraphs.map((p, i) => (
          <p key={i} className="text-muted-foreground leading-relaxed mb-2">{p}</p>
        ))}
        {s.bullets && (
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            {s.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}
      </div>
    ))}
    {!hideFaqs && guide.faqs && guide.faqs.length > 0 && (
      <FaqSection faqs={guide.faqs} title="Common questions" className="mt-4" />
    )}
    <nav aria-label="Related Tripile pages" className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm">
      {guide.links.map((l) => (
        <Link key={l.href} to={l.href} className="text-primary font-medium hover:underline">
          {l.label}
        </Link>
      ))}
    </nav>
  </section>
);

export default IntentGuideSection;

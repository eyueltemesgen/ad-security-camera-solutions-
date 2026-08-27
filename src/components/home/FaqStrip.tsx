import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';
import { cn } from '../../lib/utils';

export function FaqStrip() {
  const { faqs } = useSiteContent();
  const [open, setOpen] = useState<number | null>(0);

  if (faqs.length === 0) return null;
  const items = faqs.slice(0, 5);

  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-panel)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="section-eyebrow">
            <HelpCircle className="w-3 h-3" /> FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Common <span className="text-gradient">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.id} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between text-left px-5 py-4 gap-3">
                  <span className="font-semibold text-sm">{faq.question}</span>
                  <ChevronDown className={cn('w-5 h-5 flex-shrink-0 transition-transform', isOpen && 'rotate-180')} style={{ color: 'var(--text-muted)' }} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <Link to="/faq" className="text-sm font-medium text-brand-400 hover:underline">View all FAQs →</Link>
        </div>
      </div>
    </section>
  );
}
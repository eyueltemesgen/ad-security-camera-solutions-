import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { cn } from '../lib/utils';

export function FaqPage() {
  const { faqs } = useSiteContent();
  const [open, setOpen] = useState<number | null>(0);

  if (faqs.length === 0) {
    return (
      <div className="py-16 px-4 text-center" style={{ color: 'var(--text-muted)' }}>
        <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p>No FAQs yet.</p>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="section-eyebrow">
            <HelpCircle className="w-3 h-3" /> FAQ
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h1>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.id} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 gap-3"
                >
                  <span className="font-semibold">{faq.question}</span>
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
      </div>
    </div>
  );
}
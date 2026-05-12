
import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const FAQItem = ({ value, question, answer }) => {
  return (
    <AccordionItem value={value} className="bg-white border border-border rounded-2xl mb-4 px-6 shadow-sm overflow-hidden">
      <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline py-5 text-[15px]">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-sm">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
};

export default FAQItem;

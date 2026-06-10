'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );

    const observeEl = (el: Element) => {
      if (!el.classList.contains('is-in')) io.observe(el);
    };

    const observeAll = () => {
      document.querySelectorAll('.reveal, .reveal-scale').forEach(observeEl);
    };

    // Initial pass — DOM ready after hydration
    const t = setTimeout(observeAll, 60);

    // Re-observe whenever React adds new .reveal elements to the DOM
    // (e.g. product cards that load from the API after the initial pass)
    const mo = new MutationObserver(() => {
      document.querySelectorAll('.reveal:not(.is-in), .reveal-scale:not(.is-in)').forEach(observeEl);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}

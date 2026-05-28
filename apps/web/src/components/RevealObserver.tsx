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

    const observeAll = () => {
      document.querySelectorAll('.reveal, .reveal-scale').forEach(el => {
        if (!el.classList.contains('is-in')) io.observe(el);
      });
    };

    // Small delay so the DOM is ready after hydration
    const t = setTimeout(observeAll, 60);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [pathname]);

  return null;
}

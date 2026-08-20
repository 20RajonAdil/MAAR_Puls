import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 first:pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h2>
        {href && (
          <Link href={href} className="flex items-center gap-0.5 text-sm font-medium text-signal hover:underline">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

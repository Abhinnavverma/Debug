import { Bug } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <Bug className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            DebugPro
          </h1>
        </Link>
        <div className="flex items-center gap-2">
            <Button variant="ghost">Learner</Button>
            <Button variant="ghost" disabled>Company (soon)</Button>
        </div>
      </div>
    </header>
  );
}

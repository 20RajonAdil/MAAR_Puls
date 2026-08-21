import { Suspense } from 'react';
import { Logo } from './logo';
import { SearchBar } from './search-bar';
import { ThemeToggle } from './theme-toggle';
import { AccountMenu } from './account-menu';

export function Header() {
  return (
    <header className="glass sticky top-0 z-30 border-b border-border">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <Logo />
        <Suspense fallback={<div className="hidden flex-1 md:block" />}>
          <SearchBar />
        </Suspense>
        <div className="ml-auto flex items-center gap-2">
          <Suspense>
            <SearchBar variant="mobile" />
          </Suspense>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

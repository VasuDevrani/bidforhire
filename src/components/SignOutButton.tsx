'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      Sign out
    </button>
  );
}
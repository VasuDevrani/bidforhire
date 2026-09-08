export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/recruiter/dashboard', '/recruiter/dashboard/:path*'],
};
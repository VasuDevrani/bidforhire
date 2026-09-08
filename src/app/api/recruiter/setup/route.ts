import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isWorkEmail } from '@/lib/recruiters';

/**
 * POST /api/recruiter/setup
 *
 * Called before the magic link is sent to persist the company name.
 * Creates or updates a User + Recruiter stub by email.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, companyName } = await req.json();

    if (!email || !isWorkEmail(email)) {
      return NextResponse.json({ error: 'Work email required' }, { status: 400 });
    }

    // Upsert the User record (NextAuth will reuse it on sign-in)
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: { name: companyName || undefined },
      create: { email: email.toLowerCase(), name: companyName || null },
    });

    // Upsert Recruiter record
    await prisma.recruiter.upsert({
      where: { userId: user.id },
      update: { companyName: companyName || undefined },
      create: { userId: user.id, email: email.toLowerCase(), companyName: companyName || null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[recruiter/setup]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
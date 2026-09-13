import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMPANY_PRESETS: Record<string, { name: string; domain: string }[]> = {
  'Mohan singh': [
    { name: 'Stripe', domain: 'stripe.com' },
    { name: 'Google', domain: 'google.com' },
  ],
  'Sofia Martinez': [
    { name: 'Figma', domain: 'figma.com' },
    { name: 'Airbnb', domain: 'airbnb.com' },
  ],
  'monu singhal': [
    { name: 'Uber', domain: 'uber.com' },
    { name: 'Meta', domain: 'meta.com' },
  ],
  'Rachel Kim': [
    { name: 'Spotify', domain: 'spotify.com' },
    { name: 'DoorDash', domain: 'doordash.com' },
  ],
  'Mohini': [
    { name: 'Razorpay', domain: 'razorpay.com' },
    { name: 'CRED', domain: 'cred.club' },
  ],
  'esfaef': [
    { name: 'Netflix', domain: 'netflix.com' },
  ],
};

const DEFAULT_POOL = [
  [{ name: 'Google', domain: 'google.com' }, { name: 'Stripe', domain: 'stripe.com' }],
  [{ name: 'Meta', domain: 'meta.com' }, { name: 'Uber', domain: 'uber.com' }],
  [{ name: 'Figma', domain: 'figma.com' }, { name: 'Airbnb', domain: 'airbnb.com' }],
  [{ name: 'Apple', domain: 'apple.com' }],
  [{ name: 'Spotify', domain: 'spotify.com' }, { name: 'Razorpay', domain: 'razorpay.com' }],
  [{ name: 'Netflix', domain: 'netflix.com' }],
];

async function main() {
  console.log('Assigning previous companies to current candidates in DB...');

  const candidates = await prisma.candidate.findMany({
    orderBy: { currentBid: 'desc' },
  });

  if (candidates.length === 0) {
    console.log('No candidates found in database.');
    return;
  }

  console.log(`Found ${candidates.length} candidates in database.`);

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const companies = COMPANY_PRESETS[c.name] ?? DEFAULT_POOL[i % DEFAULT_POOL.length];

    await prisma.candidate.update({
      where: { id: c.id },
      data: {
        previousCompanies: companies,
      },
    });

    console.log(`✓ Updated ${c.name} (#${c.rank ?? i + 1}) ->`, companies.map((comp) => comp.name).join(', '));
  }

  console.log('✅ Done! All current candidates now have company logos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

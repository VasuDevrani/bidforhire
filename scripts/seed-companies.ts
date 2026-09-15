import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMPANY_PRESETS: Record<string, { name: string; domain?: string }[]> = {
  'Saurav Saini': [
    { name: 'Freelance / Consulting' },
    { name: 'Open Source' },
  ],
  'Arbaaz Mansuri': [
    { name: 'Upside Down Pvt. Ltd.' },
    { name: 'Codiotic Technologies' },
  ],
  'Zack Adlington': [
    { name: 'Made Tech', domain: 'madetech.com' },
    { name: 'Royal Navy' },
  ],
  'Sudeep Shivashettar': [
    { name: 'Acharya Institute of Technology' },
    { name: 'Freelance' },
  ],
  'David Timms': [
    { name: 'Kaluza', domain: 'kaluza.com' },
  ],
  'Shanmugam R': [
    { name: 'Freelance / Chennai Agencies' },
  ],
  'Tom Critchlow': [
    { name: 'Independent Consulting' },
    { name: 'Distilled', domain: 'distilled.net' },
  ],
};

const DEFAULT_POOL = [
  [{ name: 'Freelance / Consulting' }],
  [{ name: 'Small Startup' }],
  [{ name: 'Agency Work' }],
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

    console.log(
      `✓ Updated ${c.name} (#${c.rank ?? i + 1}) ->`,
      companies.map((comp) => comp.name).join(', ')
    );
  }

  console.log('✅ Done! All current candidates now have company data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

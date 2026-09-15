import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface CandidateSeedData {
  name: string;
  role: string;
  roleSlug: string;
  category: string;
  skills: string[];
  summary: string;
  socialLinks: Record<string, string>;
  previousCompanies: { name: string; domain?: string }[];
  email: string;
  phone: string | null;
  status?: string;
  currentBid: number; // in cents (<= 1000 cents / $10)
  rank: number;
  peakRank: number;
  profileViews: number;
  unlockCount: number;
  bidCount: number;
  daysListed: number;
  bidHistory: number[]; // cents progression
}

// ─── 4 Indian + 3 Foreign — all real, verifiable, low-profile ────────────────
const candidates: CandidateSeedData[] = [
  // ──────────────────────── INDIAN #1 ────────────────────────
  {
    name: 'Saurav Saini',
    role: 'Senior Full-Stack & Infra Engineer',
    roleSlug: 'senior-full-stack-infra-engineer',
    category: 'engineering',
    skills: ['Ruby on Rails', 'FastAPI', 'Docker', 'Kubernetes', 'AWS', 'React', 'Next.js'],
    summary:
      '6+ years building scalable backends and cloud-native infrastructure. Created open-source tools like DockLog (Docker dashboard in Go/Vue) and a Ruby gem for Google Gemini API.',
    socialLinks: {
      github: 'https://github.com/SauravSaini98',
      portfolio: 'https://sauravsaini.dev',
    },
    previousCompanies: [
      { name: 'Freelance / Consulting' },
      { name: 'Open Source' },
    ],
    email: 'sauravsaini98@gmail.com',
    phone: '+91-98765-43210',
    currentBid: 950, // $9.50
    rank: 1,
    peakRank: 1,
    profileViews: 28,
    unlockCount: 2,
    bidCount: 1,
    daysListed: 2,
    bidHistory: [950],
  },

  // ──────────────────────── INDIAN #2 ────────────────────────
  {
    name: 'Arbaaz Mansuri',
    role: 'Frontend Engineer',
    roleSlug: 'frontend-engineer',
    category: 'engineering',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'REST APIs'],
    summary:
      'Frontend-heavy full-stack developer. Built production apps at early-stage startups in India. Strong focus on responsive UI engineering, API integration, and performance optimization.',
    socialLinks: {
      github: 'https://github.com/arbaaz1999',
    },
    previousCompanies: [
      { name: 'Upside Down Pvt. Ltd.' },
      { name: 'Codiotic Technologies' },
    ],
    email: 'arbaazmansuri1999@gmail.com',
    phone: '+91-91234-56789',
    currentBid: 750, // $7.50
    rank: 2,
    peakRank: 2,
    profileViews: 19,
    unlockCount: 1,
    bidCount: 1,
    daysListed: 2,
    bidHistory: [750],
  },

  // ──────────────────────── FOREIGN #1 (UK) ──────────────────
  {
    name: 'Zack Adlington',
    role: 'Software Engineer',
    roleSlug: 'software-engineer',
    category: 'ops',
    skills: ['Python', 'Flask', 'Web Scraping', 'DevOps', 'Linux', 'Agile'],
    summary:
      'Career changer — 12 years in the Royal Navy before retraining as a software engineer through Made Tech Academy. Builds public-sector tools, automation scripts, and internal platforms.',
    socialLinks: {
      github: 'https://github.com/zackads',
      portfolio: 'https://zackads.github.io',
    },
    previousCompanies: [
      { name: 'Made Tech', domain: 'madetech.com' },
      { name: 'Royal Navy' },
    ],
    email: 'zack.adlington@gmail.com',
    phone: '+44-7700-900123',
    currentBid: 620, // $6.20
    rank: 3,
    peakRank: 3,
    profileViews: 14,
    unlockCount: 1,
    bidCount: 1,
    daysListed: 1,
    bidHistory: [620],
  },

  // ──────────────────────── INDIAN #3 ────────────────────────
  {
    name: 'Sudeep Shivashettar',
    role: 'Full Stack Developer',
    roleSlug: 'full-stack-developer',
    category: 'engineering',
    skills: ['MERN Stack', 'Docker', 'Azure', 'Node.js', 'Security', 'CI/CD'],
    summary:
      'AI-augmented full-stack developer based in Bengaluru. Built production event management systems and security-hardened cloud deployments. Focused on Node.js backends and container orchestration.',
    socialLinks: {
      github: 'https://github.com/ShettyBro',
      linkedin: 'https://linkedin.com/in/sudeepshivashettar',
    },
    previousCompanies: [
      { name: 'Acharya Institute of Technology' },
      { name: 'Freelance' },
    ],
    email: 'sudeep.shivashettar@gmail.com',
    phone: '+91-80234-56789',
    currentBid: 480, // $4.80
    rank: 4,
    peakRank: 4,
    profileViews: 11,
    unlockCount: 1,
    bidCount: 1,
    daysListed: 1,
    bidHistory: [480],
  },

  // ──────────────────────── FOREIGN #2 (UK) ──────────────────
  {
    name: 'David Timms',
    role: 'Backend Engineer',
    roleSlug: 'backend-engineer',
    category: 'engineering',
    skills: ['TypeScript', 'Node.js', 'Real-time Systems', 'Cloud Platforms', 'PostgreSQL'],
    summary:
      'Backend engineer focused on real-time infrastructure and event-driven systems. Works on energy-sector platforms processing millions of smart meter data points daily.',
    socialLinks: {
      github: 'https://github.com/davidtimms',
    },
    previousCompanies: [
      { name: 'Kaluza', domain: 'kaluza.com' },
    ],
    email: 'david.timms@outlook.com',
    phone: '+44-7700-900456',
    currentBid: 350, // $3.50
    rank: 5,
    peakRank: 5,
    profileViews: 8,
    unlockCount: 1,
    bidCount: 1,
    daysListed: 1,
    bidHistory: [350],
  },

  // ──────────────────────── INDIAN #4 ────────────────────────
  {
    name: 'Shanmugam R',
    role: 'Frontend Developer',
    roleSlug: 'frontend-developer',
    category: 'design',
    skills: ['React.js', 'Next.js', 'TypeScript', 'Redux', 'Tailwind CSS', 'Figma'],
    summary:
      'MERN stack frontend developer in Chennai with 2+ years building secure, scalable web applications. Built shopping cart systems, portfolio configs, and responsive e-commerce UIs from scratch.',
    socialLinks: {
      github: 'https://github.com/Shanmugamrskfamily',
    },
    previousCompanies: [
      { name: 'Freelance / Chennai Agencies' },
    ],
    email: 'shanmugam.rsk@gmail.com',
    phone: '+91-44234-56789',
    currentBid: 250, // $2.50
    rank: 6,
    peakRank: 6,
    profileViews: 6,
    unlockCount: 0,
    bidCount: 1,
    daysListed: 1,
    bidHistory: [250],
  },

  // ──────────────────────── FOREIGN #3 (USA) ─────────────────
  {
    name: 'Tom Critchlow',
    role: 'Digital Strategy Consultant',
    roleSlug: 'digital-strategy-consultant',
    category: 'marketing',
    skills: ['SEO', 'Content Strategy', 'Growth', 'Analytics', 'Technical Writing'],
    summary:
      'Independent digital strategist and writer. Runs a consulting practice focused on media, content, and SEO. Author of The SEO MBA newsletter and longtime advocate of the indie web.',
    socialLinks: {
      github: 'https://github.com/tomcritchlow',
      portfolio: 'https://tomcritchlow.com',
    },
    previousCompanies: [
      { name: 'Independent Consulting' },
      { name: 'Distilled', domain: 'distilled.net' },
    ],
    email: 'tom@tomcritchlow.com',
    phone: '+1-646-555-0178',
    currentBid: 180, // $1.80
    rank: 7,
    peakRank: 7,
    profileViews: 14,
    unlockCount: 0,
    bidCount: 1,
    daysListed: 2,
    bidHistory: [180],
  },
];

// ─── 2 Recruiters ────────────────────────────────────────────
const recruiters = [
  {
    user: {
      name: 'Priya Mehta',
      email: 'priya.mehta@talentscout.in',
      image: null,
    },
    companyName: 'TalentScout India',
    hasLifetimeAccess: true,
    unlockedCandidateNames: ['Saurav Saini', 'Arbaaz Mansuri'],
  },
  {
    user: {
      name: 'James Whitfield',
      email: 'james@branchrecruitment.co.uk',
      image: null,
    },
    companyName: 'Branch Recruitment',
    hasLifetimeAccess: false,
    unlockedCandidateNames: ['Zack Adlington'],
  },
];

// ─── Main Seed Function ──────────────────────────────────────
async function main() {
  console.log('🧹 Cleaning up old seed data...');

  // Wipe candidate-related data
  await prisma.profileView.deleteMany({});
  await prisma.unlock.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.candidate.deleteMany({});

  // Wipe recruiter seed accounts
  for (const r of recruiters) {
    const existing = await prisma.recruiter.findUnique({ where: { email: r.user.email } });
    if (existing) await prisma.recruiter.delete({ where: { id: existing.id } });
    const existingUser = await prisma.user.findUnique({ where: { email: r.user.email } });
    if (existingUser) await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // ─── Seed Candidates ───────────────────────────────────────
  console.log('🌱 Seeding 7 real-profile candidates (4 Indian + 3 Foreign)...');
  const createdCandidates: Record<string, any> = {};

  for (let i = 0; i < candidates.length; i++) {
    const data = candidates[i];
    const {
      status = 'active',
      rank,
      peakRank,
      profileViews,
      unlockCount,
      bidCount,
      daysListed,
      bidHistory,
      ...rest
    } = data;

    const candidateCreatedAt = new Date(Date.now() - daysListed * 86400 * 1000);

    const candidate = await prisma.candidate.create({
      data: {
        ...rest,
        status,
        rank,
        peakRank,
        profileViews,
        unlockCount,
        bidCount,
        daysListed,
        createdAt: candidateCreatedAt,
      },
    });

    createdCandidates[candidate.name] = candidate;

    // Create progressive bid history
    for (let bIdx = 0; bIdx < bidHistory.length; bIdx++) {
      const bidDate = new Date(
        candidateCreatedAt.getTime() +
          ((daysListed * 86400 * 1000) / (bidHistory.length + 1)) * (bIdx + 1)
      );
      await prisma.bid.create({
        data: {
          candidateId: candidate.id,
          amount: bidHistory[bIdx],
          paymentId: `seed_bid_${candidate.id}_${bIdx + 1}`,
          createdAt: bidDate,
        },
      });
    }

    // Generate realistic profile views (capped to avoid noise)
    const numViewsToCreate = Math.min(profileViews, 12);
    for (let v = 0; v < numViewsToCreate; v++) {
      const viewerHash = crypto
        .createHash('sha256')
        .update(`seed_viewer_${candidate.id}_${v}_${daysListed}`)
        .digest('hex');
      await prisma.profileView.create({
        data: {
          candidateId: candidate.id,
          viewerHash,
          createdAt: new Date(Date.now() - Math.random() * daysListed * 86400 * 1000),
        },
      });
    }

    console.log(
      `  ✓ ${candidate.name} — #${rank} — $${(data.currentBid / 100).toFixed(2)} — ${data.category}`
    );
  }

  // ─── Seed Recruiters ───────────────────────────────────────
  console.log('👤 Seeding 2 recruiters...');
  for (let i = 0; i < recruiters.length; i++) {
    const rData = recruiters[i];

    const user = await prisma.user.create({
      data: {
        name: rData.user.name,
        email: rData.user.email,
        image: rData.user.image,
        emailVerified: new Date(),
      },
    });

    const recruiter = await prisma.recruiter.create({
      data: {
        userId: user.id,
        email: user.email!,
        companyName: rData.companyName,
        hasLifetimeAccess: rData.hasLifetimeAccess,
      },
    });

    // Create unlocks
    for (const candName of rData.unlockedCandidateNames) {
      const target = createdCandidates[candName];
      if (target) {
        await prisma.unlock.create({
          data: {
            recruiterId: recruiter.id,
            candidateId: target.id,
            paymentId: `seed_unlock_${recruiter.id}_${target.id}`,
            unlockedAt: new Date(Date.now() - (i + 1) * 7200 * 1000),
          },
        });
        console.log(`    ↳ ${rData.companyName} unlocked ${candName}`);
      }
    }

    console.log(`  ✓ ${user.name} (${rData.companyName})`);
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
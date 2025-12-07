import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const demoEmail = 'demo@example.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (existingUser) {
    console.log('⚠️  Demo user already exists, skipping seed');
    return;
  }

  const hashedPassword = await bcrypt.hash('Demo1234', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: demoEmail,
      hashedPassword,
      displayName: 'Demo User',
    },
  });

  console.log('✅ Demo user created:');
  console.log(`   Email: ${demoUser.email}`);
  console.log(`   Password: Demo1234`);
  console.log(`   Display Name: ${demoUser.displayName}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

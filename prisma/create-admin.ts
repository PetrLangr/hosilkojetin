import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('Creating admin user...');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hsl.cz',
      name: 'HŠL Administrátor',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('Admin user created:', admin.email);
  console.log('Login with:');
  console.log('Email: admin@hsl.cz');
  console.log('Password: admin123');
}

createAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating user accounts for players...');

  // Get all players
  const players = await prisma.player.findMany({
    include: {
      team: true
    }
  });

  let usersCreated = 0;

  for (const player of players) {
    // Create email from player name (simple approach)
    const email = `${player.name.toLowerCase().replace(/\s+/g, '.')}@hsl.cz`;
    
    // Default password (players should change this)
    const defaultPassword = 'hsl2024';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Determine role - set first player of each team as captain for demo
    const isFirstPlayer = await prisma.player.findFirst({
      where: { teamId: player.teamId },
      orderBy: { createdAt: 'asc' }
    });
    
    const role = isFirstPlayer?.id === player.id ? 'kapitán' : 'hráč';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          email,
          name: player.name,
          password: hashedPassword,
          playerId: player.id,
          role
        }
      });

      // Update player role if captain
      if (role === 'kapitán') {
        await prisma.player.update({
          where: { id: player.id },
          data: { role: 'kapitán' }
        });

        // Set as team captain
        await prisma.team.update({
          where: { id: player.teamId },
          data: { captainId: player.id }
        });
      }

      console.log(`Created user: ${email} (${role}) for ${player.name} - ${player.team.name}`);
      usersCreated++;
    } else {
      console.log(`User already exists: ${email}`);
    }
  }

  console.log(`\nUsers created: ${usersCreated}`);
  console.log('\nDefault login credentials:');
  console.log('Email: [player.name]@hsl.cz (e.g., jan.novak@hsl.cz)');
  console.log('Password: hsl2024');
  console.log('\nFirst player of each team is set as captain.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
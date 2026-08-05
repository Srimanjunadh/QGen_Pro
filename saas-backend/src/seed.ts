import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'Manju';
  const password = '1122';

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: 'Manju',
        email,
        password: hashedPassword,
      },
    });
    console.log('Created user Manju with password 1122 on NeonDB');
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log('Updated user Manju with password 1122 on NeonDB');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

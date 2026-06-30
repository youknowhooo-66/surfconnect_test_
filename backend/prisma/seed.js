import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semeação do banco de dados (seed)...');

  // Clear existing data (optional but useful for reset)
  await prisma.booking.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Hashed Passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const instructorPassword = await bcrypt.hash('inst123', 10);
  const studentPassword = await bcrypt.hash('stud123', 10);

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'SurfConnect Admin',
      email: 'admin@surfconnect.com',
      password: adminPassword,
      role: 'ADMIN',
      telefone: '(48) 99999-1111'
    }
  });

  const instructor1 = await prisma.user.create({
    data: {
      name: 'João das Ondas',
      email: 'joao@surfconnect.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      telefone: '(48) 98888-2222'
    }
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Maria do Surf',
      email: 'maria@surfconnect.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      telefone: '(48) 98888-3333'
    }
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Lucas Estagiário',
      email: 'lucas@surfconnect.com',
      password: studentPassword,
      role: 'STUDENT',
      telefone: '(48) 97777-4444'
    }
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Ana Pranchista',
      email: 'ana@surfconnect.com',
      password: studentPassword,
      role: 'STUDENT',
      telefone: '(48) 97777-5555'
    }
  });

  console.log('Usuários criados com sucesso!');

  // 3. Create Classes
  const classDate1 = new Date();
  classDate1.setDate(classDate1.getDate() + 1); // Tomorrow
  classDate1.setHours(8, 0, 0, 0);

  const classDate2 = new Date();
  classDate2.setDate(classDate2.getDate() + 2); // In two days
  classDate2.setHours(10, 30, 0, 0);

  const classDate3 = new Date();
  classDate3.setDate(classDate3.getDate() + 3); // In three days
  classDate3.setHours(15, 0, 0, 0);

  const c1 = await prisma.class.create({
    data: {
      datetime: classDate1,
      location: 'Praia da Joaquina (SC)',
      maxStudents: 5,
      instructorId: instructor1.id
    }
  });

  const c2 = await prisma.class.create({
    data: {
      datetime: classDate2,
      location: 'Praia Mole (SC)',
      maxStudents: 4,
      instructorId: instructor2.id
    }
  });

  const c3 = await prisma.class.create({
    data: {
      datetime: classDate3,
      location: 'Barra da Lagoa (SC) - Iniciantes',
      maxStudents: 8,
      instructorId: instructor1.id
    }
  });

  console.log('Aulas criadas com sucesso!');

  // 4. Create a booking to start with
  await prisma.booking.create({
    data: {
      studentId: student1.id,
      classId: c1.id,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING'
    }
  });

  console.log('Agendamentos de demonstração criados!');
  console.log('Semeação concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro na semeação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

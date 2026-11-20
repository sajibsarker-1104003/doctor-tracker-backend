import 'dotenv/config';
import { Gender, PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();
const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology', 'Psychiatry', 'ENT'];
const hospitals = ['Square Hospital', 'United Hospital', 'Evercare Hospital', 'Labaid Hospital', 'Popular Medical'];
const conditions = ['Hypertension', 'Diabetes', 'Asthma', 'Migraine', 'Fracture', 'Allergy', 'Anxiety', 'Arthritis', 'Fever'];
const doctorNames = ['Rahim Uddin', 'Nusrat Jahan', 'Tanvir Ahmed', 'Farhana Akter', 'Kamal Hossain', 'Sadia Islam', 'Imran Khan', 'Mehzabin Rahman', 'Arif Chowdhury', 'Tasnia Haque', 'Shahid Alam', 'Rima Sultana'];
const patientNames = ['Abir', 'Mitu', 'Sakib', 'Lamia', 'Rafi', 'Jui', 'Hasan', 'Tuba', 'Nabil', 'Priya', 'Fahim', 'Sumaiya', 'Zihad', 'Nila', 'Rony'];

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
  const userEmail = (process.env.SEED_USER_EMAIL ?? 'user@example.com').toLowerCase();

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      passwordHash: await hash(process.env.ADMIN_PASSWORD ?? 'Admin@12345', rounds),
      role: Role.ADMIN,
    },
  });
  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      name: 'Demo User',
      email: userEmail,
      passwordHash: await hash(process.env.SEED_USER_PASSWORD ?? 'User@12345', rounds),
      role: Role.USER,
    },
  });

  if ((await prisma.doctor.count()) > 0) {
    console.log('Users seeded. Doctors already exist, skipping sample data.');
    return;
  }

  for (const [i, name] of doctorNames.entries()) {
    const doctor = await prisma.doctor.create({
      data: {
        name: `Dr. ${name}`,
        specialization: specializations[i % specializations.length],
        hospital: pick(hospitals),
        phone: `+88017${rand(10000000, 99999999)}`,
        email: `doctor${i + 1}@example.com`,
        createdAt: daysAgo(rand(30, 120)),
      },
    });

    const count = rand(5, 15);
    await prisma.patient.createMany({
      data: Array.from({ length: count }, (_, j) => ({
        name: `${pick(patientNames)} ${pick(patientNames)}`,
        age: rand(5, 85),
        gender: pick([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
        phone: `+88018${rand(10000000, 99999999)}`,
        email: `patient${i + 1}_${j + 1}@example.com`,
        condition: pick(conditions),
        doctorId: doctor.id,
        createdAt: daysAgo(rand(0, 90)),
      })),
    });
  }
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
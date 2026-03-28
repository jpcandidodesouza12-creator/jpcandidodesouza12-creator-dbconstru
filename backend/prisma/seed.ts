// backend/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin master
  const adminPassword = await bcrypt.hash('Admin@2026!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dumbconstrutor.com' },
    update: {},
    create: {
      name: 'Admin Master',
      email: 'admin@dumbconstrutor.com',
      password: adminPassword,
      role: Role.ADMIN,
      active: true,
    },
  })
  console.log(`✅ Admin created: ${admin.email}`)

  // Demo user
  const userPassword = await bcrypt.hash('Demo@2026!', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@dumbconstrutor.com' },
    update: {},
    create: {
      name: 'Usuário Demo',
      email: 'demo@dumbconstrutor.com',
      password: userPassword,
      role: Role.USER,
      active: true,
    },
  })

  // Demo project
  await prisma.project.upsert({
    where: { id: 'demo-project-001' },
    update: {},
    create: {
      id: 'demo-project-001',
      userId: demo.id,
      name: 'Casa Térrea 150m² — Campo Grande',
      description: 'Projeto demo — padrão médio, empreiteira',
      area: 150,
      standard: 'MED',
      status: 'PLANNING',
      config: {
        area: 150, std: 'med', mo: 'empreiteira', cont: 10, curMonth: 1,
        bdi: { ac: 4, cf: 1.5, s: 0.8, mi: 1, l: 7.2, iss: 3, pis: 3.65 },
      },
    },
  })

  console.log(`✅ Demo user created: ${demo.email}`)
  console.log('🎉 Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

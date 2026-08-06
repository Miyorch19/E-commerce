import { PrismaClient, TipoNegocio } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_DOMINIO = 'localhost';
const SEED_EMAIL = 'admin@test.com';
const SEED_PASSWORD = 'Test1234';
const SALT_ROUNDS = 12;

async function main(): Promise<void> {
  console.log('🌱 Starting seed...\n');

  // ── 1. Negocio ──────────────────────────────────────────────────────────────
  const negocio = await prisma.negocio.upsert({
    where: { dominio: SEED_DOMINIO },
    update: {
      nombre: 'Negocio Demo',
      tipo: TipoNegocio.TIENDA,
      activo: true,
    },
    create: {
      nombre: 'Negocio Demo',
      dominio: SEED_DOMINIO,
      tipo: TipoNegocio.TIENDA,
      activo: true,
      email: 'demo@negocio.com',
      telefono: '+521234567890',
      pais: 'MX',
    },
  });

  console.log(`✅ Negocio  → id: ${negocio.id}  dominio: "${negocio.dominio}"`);

  // ── 2. Rol ──────────────────────────────────────────────────────────────────
  const rol = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      descripcion: 'Administrador con acceso total al panel.',
    },
  });

  console.log(`✅ Rol      → id: ${rol.id}  nombre: "${rol.nombre}"`);

  // ── 3. Usuario admin ────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  const usuario = await prisma.usuario.upsert({
    where: {
      negocioId_email: {
        negocioId: negocio.id,
        email: SEED_EMAIL,
      },
    },
    update: {
      rolId: rol.id,
      passwordHash,
      activo: true,
    },
    create: {
      negocioId: negocio.id,
      rolId: rol.id,
      nombre: 'Admin Demo',
      email: SEED_EMAIL,
      passwordHash,
      emailVerificado: true,
      activo: true,
    },
  });

  console.log(`✅ Usuario  → id: ${usuario.id}  email: "${usuario.email}"`);

  console.log('\n🎉 Seed completed successfully.');
  console.log('\n─── Credenciales de prueba ───────────────────────────────');
  console.log(`   URL:      http://localhost:3001/api/auth/login`);
  console.log(`   Header:   X-Tenant-Domain: ${SEED_DOMINIO}`);
  console.log(`   Email:    ${SEED_EMAIL}`);
  console.log(`   Password: ${SEED_PASSWORD}`);
  console.log('──────────────────────────────────────────────────────────\n');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, TipoNegocio } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_DOMINIO = 'localhost';
const SEED_EMAIL = 'aldairhernandez763@gmail.com';
const SEED_PASSWORD = 'Test1234';
const SALT_ROUNDS = 12;

async function main(): Promise<void> {
  console.log('🌱 Starting seed...\n');

  // NOTA: Ya no usamos `upsert` directo para Negocio ni Usuario,
  // porque el constraint de unicidad fue movido a SQL puro (índice parcial)
  // para soportar soft deletes. Prisma requiere `@unique` para `upsert`.
  let negocio = await prisma.negocio.findFirst({
    where: { dominio: SEED_DOMINIO, activo: true },
  });

  if (negocio) {
    negocio = await prisma.negocio.update({
      where: { id: negocio.id },
      data: {
        nombre: 'Negocio Demo',
        tipo: TipoNegocio.TIENDA,
      },
    });
  } else {
    negocio = await prisma.negocio.create({
      data: {
        nombre: 'Negocio Demo',
        dominio: SEED_DOMINIO,
        tipo: TipoNegocio.TIENDA,
        activo: true,
        email: 'demo@negocio.com',
        telefono: '+521234567890',
        pais: 'MX',
      },
    });
  }

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

  let usuario = await prisma.usuario.findFirst({
    where: {
      negocioId: negocio.id,
      email: SEED_EMAIL,
      activo: true,
    },
  });

  if (usuario) {
    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        rolId: rol.id,
        passwordHash,
      },
    });
  } else {
    usuario = await prisma.usuario.create({
      data: {
        negocioId: negocio.id,
        rolId: rol.id,
        nombre: 'Admin Demo',
        email: SEED_EMAIL,
        passwordHash,
        emailVerificado: true,
        activo: true,
      },
    });
  }

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

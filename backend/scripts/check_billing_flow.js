const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const negocio = await db.negocio.findFirst({
    select: {
      id: true, nombre: true, dominio: true,
      stripeCustomerId: true, stripeMetodoPagoId: true,
      stripeAccountId: true, stripeOnboardingCompleto: true,
      email: true,
    }
  });
  console.log('\n=== NEGOCIO ===');
  console.log(JSON.stringify(negocio, null, 2));

  if (!negocio) { await db.$disconnect(); return; }

  // Permisos disponibles (Rol is global, not per-negocio)
  const permisos = await db.permiso.findMany({ select: { id: true, clave: true } });
  console.log('\n=== PERMISOS DISPONIBLES ===');
  console.log(JSON.stringify(permisos, null, 2));

  // Roles (global, no negocioId)
  const roles = await db.rol.findMany({
    include: {
      permisos: { include: { permiso: { select: { clave: true } } } }
    }
  });
  console.log('\n=== ROLES ===');
  console.log(JSON.stringify(roles.map(r => ({
    id: r.id, nombre: r.nombre,
    permisos: r.permisos.map(rp => rp.permiso.clave)
  })), null, 2));

  // Usuarios del negocio
  const usuarios = await db.usuario.findMany({
    where: { negocioId: negocio.id },
    select: {
      id: true, email: true, nombre: true, activo: true,
      rol: { select: { id: true, nombre: true } }
    }
  });
  console.log('\n=== USUARIOS ===');
  console.log(JSON.stringify(usuarios, null, 2));

  // Membresía
  const membresia = await db.membresia.findFirst({
    where: { negocioId: negocio.id },
    include: { plan: { select: { nombre: true, precio: true } } }
  });
  console.log('\n=== MEMBRESÍA ===');
  console.log(JSON.stringify(membresia, null, 2));

  // PagoMembresias existentes
  if (membresia) {
    const pagos = await db.pagoMembresia.findMany({
      where: { membresiaId: membresia.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    console.log('\n=== PAGOS MEMBRESÍA (últimos 5) ===');
    console.log(JSON.stringify(pagos, null, 2));
  }

  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

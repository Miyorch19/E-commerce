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

  // ── 2a. Permisos ────────────────────────────────────────────────────────────
  const permisosRequeridos = [
    'facturacion:gestionar',
    'pedidos:leer',
    'pedidos:editar',
    'productos:leer',
    'productos:crear',
    'productos:editar',
    'productos:eliminar',
    'usuarios:gestionar'
  ];

  const permisosIds: string[] = [];
  for (const p of permisosRequeridos) {
    const permiso = await prisma.permiso.upsert({
      where: { clave: p },
      update: {},
      create: { clave: p, descripcion: `Permiso de ${p}` },
    });
    permisosIds.push(permiso.id);
  }
  console.log(`✅ Permisos → Creados/Verificados ${permisosIds.length} permisos del sistema`);

  // ── 2b. Rol y RolPermiso ────────────────────────────────────────────────────
  const rol = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      descripcion: 'Administrador con acceso total al panel.',
    },
  });

  for (const pId of permisosIds) {
    const rpExists = await prisma.rolPermiso.findFirst({
      where: { rolId: rol.id, permisoId: pId }
    });
    if (!rpExists) {
      await prisma.rolPermiso.create({
        data: { rolId: rol.id, permisoId: pId }
      });
    }
  }
  console.log(`✅ Rol      → id: ${rol.id}  nombre: "${rol.nombre}" (Permisos vinculados)`);

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

  // ── 4. Plan y Membresia ───────────────────────────────────────────────────
  let plan = await prisma.plan.findFirst({ where: { nombre: 'Plan Pro' } });
  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        nombre: 'Plan Pro',
        precio: 499.00,
        intervalo: 'mensual',
        activo: true,
      }
    });
  } else {
    plan = await prisma.plan.update({
      where: { id: plan.id },
      data: { precio: 499.00, intervalo: 'mensual' }
    });
  }
  console.log(`✅ Plan     → id: ${plan.id}  nombre: "${plan.nombre}"`);

  let membresia = await prisma.membresia.findFirst({ where: { negocioId: negocio.id } });
  if (!membresia) {
    membresia = await prisma.membresia.create({
      data: {
        negocioId: negocio.id,
        planId: plan.id,
        estado: 'ACTIVA',
        fechaInicio: new Date(),
        fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      }
    });
  } else {
    membresia = await prisma.membresia.update({
      where: { id: membresia.id },
      data: {
        planId: plan.id,
        estado: 'ACTIVA'
      }
    });
  }
  console.log(`✅ Membresía→ id: ${membresia.id}  estado: "${membresia.estado}"`);

  // ── 5. Categoría de prueba ───────────────────────────────────────────────
  let categoria = await prisma.categoria.findFirst({
    where: { negocioId: negocio.id, nombre: 'Categoría Demo' },
  });
  if (!categoria) {
    categoria = await prisma.categoria.create({
      data: {
        negocioId: negocio.id,
        nombre: 'Categoría Demo',
        descripcion: 'Categoría de productos de prueba',
        activo: true,
        orden: 0,
      },
    });
  } else {
    categoria = await prisma.categoria.update({
      where: { id: categoria.id },
      data: { descripcion: 'Categoría de productos de prueba', activo: true },
    });
  }
  console.log(`✅ Categoria→ id: ${categoria.id}  nombre: "${categoria.nombre}"`);

  // ── 6. Producto de prueba ────────────────────────────────────────────────
  // Nota: Producto tiene @@unique([negocioId, slug]) — usamos findFirst + create/update
  // igual que el resto del seed (slug no es @unique solo, es compuesto con negocioId).
  let producto = await prisma.producto.findFirst({
    where: { negocioId: negocio.id, slug: 'producto-demo' },
  });
  if (!producto) {
    producto = await prisma.producto.create({
      data: {
        negocioId: negocio.id,
        categoriaId: categoria.id,
        nombre: 'Producto Demo',
        descripcion: 'Producto de prueba generado por el seed',
        precio: 250.00,
        stock: 100,
        gestionStock: true,
        activo: true,
        destacado: false,
        slug: 'producto-demo',
      },
    });
  } else {
    producto = await prisma.producto.update({
      where: { id: producto.id },
      data: {
        categoriaId: categoria.id,
        nombre: 'Producto Demo',
        precio: 250.00,
        stock: 100,
        activo: true,
      },
    });
  }
  console.log(`✅ Producto → id: ${producto.id}  nombre: "${producto.nombre}"  precio: $${producto.precio}`);

  console.log('\n🎉 Seed completed successfully.');
  console.log('\n─── Credenciales de prueba ───────────────────────────────');
  console.log(`   URL:      http://localhost:3001/api/auth/login`);
  console.log(`   Header:   X-Tenant-Domain: ${SEED_DOMINIO}`);
  console.log(`   Email:    ${SEED_EMAIL}`);
  console.log(`   Password: ${SEED_PASSWORD}`);
  console.log(`   negocioId:  ${negocio.id}`);
  console.log(`   productoId: ${producto.id}`);
  console.log(`   categoriaId:${categoria.id}`);
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

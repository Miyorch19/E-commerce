import { prisma } from '../../config/prisma';

export async function getActiveProducts(negocioId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.producto.findMany({
      where: { negocioId, activo: true },
      include: {
        imagenes: {
          orderBy: { orden: 'asc' },
          take: 1
        },
        categoria: {
          select: { id: true, nombre: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.producto.count({
      where: { negocioId, activo: true }
    })
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getActiveProductById(negocioId: string, id: string) {
  return await prisma.producto.findFirst({
    where: { id, negocioId, activo: true },
    include: {
      imagenes: {
        orderBy: { orden: 'asc' }
      },
      categoria: {
        select: { id: true, nombre: true }
      },
      variantes: true,
      atributos: true
    }
  });
}

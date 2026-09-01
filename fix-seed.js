const fs = require('fs');
let seed = fs.readFileSync('backend/prisma/seed.ts', 'utf8');

const imageCode = \
  // 7. Imagen del producto
  let imagen = await prisma.imagenProducto.findFirst({
    where: { productoId: producto.id }
  });
  if (!imagen) {
    await prisma.imagenProducto.create({
      data: {
        productoId: producto.id,
        url: 'https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124354/PIZZA1_nsjuhx.jpg',
        publicId: 'PIZZA1_nsjuhx',
        alt: 'Pizza Margarita',
        orden: 1,
        esPrincipal: true
      }
    });
  }
\;

seed = seed.replace(
  'console.log(\✅ Producto → id:   nombre: ""  precio: {producto.precio}\);',
  'console.log(\✅ Producto → id:   nombre: ""  precio: {producto.precio}\);\n' + imageCode
);

fs.writeFileSync('backend/prisma/seed.ts', seed);
console.log('Added product image to seed');

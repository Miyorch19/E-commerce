const fs = require('fs');
let seed = fs.readFileSync('backend/prisma/seed.ts', 'utf8');

seed = seed.replace(/tipo: TipoNegocio\.TIENDA,/g, 'tipo: TipoNegocio.RESTAURANTE,');

const temaCode = \
  // 1.5 Tema
  let tema = await prisma.tema.findUnique({
    where: { negocioId: negocio.id },
  });
  if (tema) {
    tema = await prisma.tema.update({
      where: { negocioId: negocio.id },
      data: {
        plantilla: 'restaurante-clasico',
        colorPrimario: '#FEFCEA',
        colorSecundario: '#0D0D0D',
        colorAcento: '#E62235',
        fontPrimaria: 'Instrument Serif',
        fontSecundaria: 'Lilex',
      },
    });
  } else {
    tema = await prisma.tema.create({
      data: {
        negocioId: negocio.id,
        plantilla: 'restaurante-clasico',
        colorPrimario: '#FEFCEA',
        colorSecundario: '#0D0D0D',
        colorAcento: '#E62235',
        fontPrimaria: 'Instrument Serif',
        fontSecundaria: 'Lilex',
      },
    });
  }
  console.log('o. Tema      ' Actualizado/creado plantilla:', tema.plantilla);
\;

seed = seed.replace(
  'console.log(\o. Negocio  \' id:   dominio: ""\);',
  'console.log(\o. Negocio  \' id:   dominio: ""\);\n' + temaCode
);

fs.writeFileSync('backend/prisma/seed.ts', seed);

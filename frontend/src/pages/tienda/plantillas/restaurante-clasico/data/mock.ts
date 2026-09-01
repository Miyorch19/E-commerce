import type { MenuItem, GalleryImage, RestaurantInfo } from '../types';

export const restaurantInfo: RestaurantInfo = {
  nombrePrincipal: "La Boca",
  nombreSecundario: "Asadero",
  horarios: "Mar-Dom: 1:00 PM - 11:00 PM",
  direccion: "Av. Fuego 123, Distrito Culinario",
  telefono: "+1 234 567 8900",
  whatsapp: "1234567890",
  email: "contacto@labocaasadero.com",
  redesSociales: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
  }
};

export const menuItems: MenuItem[] = [
  // Parrilla
  { id: "m1", nombre: "Bife de Chorizo", descripcion: "Corte premium a la parrilla.", precio: 45.00, categoria: "Parrilla", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123845/bife1_qn79ey.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124086/bife111_wz5qsx.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123845/bife2_vsd5ch.jpg",
  ]},
  { id: "m2", nombre: "Ojo de Bife", descripcion: "Jugoso corte con chimichurri.", precio: 48.00, categoria: "Parrilla", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123844/ojobif1_fengcb.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123852/ojobif2_kzcloq.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123845/ojobif3_qj8d8d.jpg",
  ], imagenMenu: "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123845/ojobif3_qj8d8d.jpg" },
  { id: "m3", nombre: "Tira de Asado", descripcion: "Clásico marinado en hierbas.", precio: 40.00, categoria: "Parrilla", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123852/tira1_vanrzs.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123853/tira2_rhiw31.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123852/tira4_vrvwld.jpg",
  ]},
  { id: "m4", nombre: "Entraña Fina", descripcion: "Corte asado vuelta y vuelta.", precio: 42.00, categoria: "Parrilla", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123851/entra%C3%B1a1_gq1px7.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123846/entra%C3%B1a2_zszwzl.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785123845/entra%C3%B1a3_tocemj.jpg",
  ]},
  
  // Pastas
  { id: "pa1", nombre: "Fettuccine Trufado", descripcion: "Pasta con crema de trufa.", precio: 28.00, categoria: "Pastas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125464/pasta_fetuccini_yly6xj.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191276/fetuccini2_s7jxs3.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191276/fetuccini3_a310iz.jpg",
  ]},
  { id: "pa2", nombre: "Ravioles de Calabaza", descripcion: "Con salsa de mantequilla y salvia.", precio: 24.00, categoria: "Pastas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125462/pasta_ravioli_vgzprv.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191276/pasta_ravioli2_wwc5zq.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191276/pasta_ravioli3_eoftqg.jpg",
  ]},
  { id: "pa3", nombre: "Lasaña de Carne", descripcion: "Boloñesa de la casa y queso.", precio: 26.00, categoria: "Pastas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125462/pasta_lasagna_xjy6ae.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191276/pasta_ravioli3_eoftqg.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191276/pasta_lasagna3_i4ddhu.jpg",
  ]},
  { id: "pa4", nombre: "Espagueti al Pesto", descripcion: "Pasta con pesto genovés fresco.", precio: 22.00, categoria: "Pastas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125461/pasta_pesto_tcj7ph.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191276/pasta_pesto2_m9g90n.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191276/pasta_pesto3_n5x4wq.jpg",
  ]},

  // Ensaladas
  { id: "e1", nombre: "Ensalada César", descripcion: "Lechuga, croutones y parmesano.", precio: 15.00, categoria: "Ensaladas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125086/ensalada_cesar_gyiej8.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191736/ensalada_cesar2_siyhtb.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191735/ensalada_cesar3_wmjevf.jpg",
  ]},
  { id: "e2", nombre: "Caprese", descripcion: "Tomate, mozzarella fresca y albahaca.", precio: 18.00, categoria: "Ensaladas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125085/ensalada_caprese_pdcoeu.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191735/ensalada_caprese2_homk57.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191735/ensalada_caprese3_udfdav.jpg",
  ]},
  { id: "e3", nombre: "Rúcula y Prosciutto", descripcion: "Con higos y nueces caramelizadas.", precio: 19.00, categoria: "Ensaladas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125084/ensalada_rucula_pbemlc.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191732/ensalada_rucula2_huduxl.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191732/ensalada_rucula3_uxeqh4.jpg",
  ]},
  { id: "e4", nombre: "Mixta de la Casa", descripcion: "Hojas verdes, tomates y vinagreta.", precio: 14.00, categoria: "Ensaladas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125084/ensalada_mixta_lllom8.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191732/ensalada_mixta2_gf6nov.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785191732/ensalada_mixta3_kuzhfg.jpg",
  ]},

  // Postres
  { id: "po1", nombre: "Tiramisú", descripcion: "Con café, mascarpone y cacao.", precio: 12.00, categoria: "Postres", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125752/postre_tiramisu_sa8zdw.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785192187/postre_tiramisu2_t8wmkn.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785192186/postre_tiramisu3_wn8lky.jpg",
  ]},
  { id: "po2", nombre: "Panna Cotta", descripcion: "De crema con frutos rojos.", precio: 10.00, categoria: "Postres", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125751/postre_panacota_bjqawi.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785192185/postre_panacota2_kfmjk9.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785192185/postre_panacota3_anwwlm.jpg",
  ]},
  { id: "po3", nombre: "Volcán de Chocolate", descripcion: "Con centro líquido y helado.", precio: 14.00, categoria: "Postres", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125750/postre_volcan_hvtg5u.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785192185/postre_volcan2_hrjnpx.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785192185/postre_volcan3_wihayb.jpg",
  ]},
  { id: "po4", nombre: "Flan Casero", descripcion: "Tradicional con dulce de leche.", precio: 9.00, categoria: "Postres", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125748/postre_flan_m5b3an.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785192184/postre_flan2_jmgnwx.jpg",
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785192184/postre_flan3_jisrxb.jpg",
  ]},

  // Aperitivos
  { id: "ap1", nombre: "Bruschetta al Pomodoro", descripcion: "Pan artesanal tostado con tomate.", precio: 8.00, categoria: "Aperitivos", imagenes: ["https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124735/aperitivios_Pomodoro1_n56c1u.jpg"] },
  { id: "ap2", nombre: "Tabla de Embutidos", descripcion: "Selección de jamones y quesos.", precio: 14.00, categoria: "Aperitivos", imagenes: ["https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124734/aperitivos_embutidos1_yzey3r.jpg"] },
  { id: "ap3", nombre: "Croquetas de Jamón", descripcion: "Croquetas crujientes rellenas.", precio: 9.00, categoria: "Aperitivos", imagenes: ["https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124733/aperitivios_croquetas_z35qd7.jpg"] },
  { id: "ap4", nombre: "Provoleta a la Parrilla", descripcion: "Queso provolone con orégano.", precio: 11.00, categoria: "Aperitivos", imagenes: ["https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124733/aperitivos_provoleta_wwemrw.jpg"] },

  // Bebidas
  { id: "b1", nombre: "Limonada de la Casa", descripcion: "Limonada fresca con menta.", precio: 5.00, categoria: "Bebidas", imagenes: ["https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125970/bebida_limonada_a02pwi.jpg"] },
  { id: "b2", nombre: "Agua de Jamaica", descripcion: "Hibisco frío con piloncillo.", precio: 4.00, categoria: "Bebidas", imagenes: ["https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125968/bebida_jamaica_yb6jyl.jpg"] },
  { id: "b3", nombre: "Vino Tinto de la Casa", descripcion: "Copa de vino tinto selección.", precio: 9.00, categoria: "Bebidas", imagenes: ["https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125967/bebida_vino_qqo7rl.jpg"] },
  { id: "b4", nombre: "Cerveza Artesanal", descripcion: "Lager local fría en botella.", precio: 7.00, categoria: "Bebidas", imagenes: ["https://res.cloudinary.com/dwvegpaaf/image/upload/v1785125965/bebida_cerveza_nkymke.jpg"] },

  // Pizzas
  { id: "p1", nombre: "Margarita", descripcion: "La clásica pizza italiana: masa artesanal con salsa de tomate fresca, queso mozzarella de búfala, albahaca y aceite de oliva.", precio: 18.00, categoria: "Pizzas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124354/PIZZA1_nsjuhx.jpg",
  ]},
  { id: "p2", nombre: "Pepperoni", descripcion: "Nuestra masa artesanal horneada en leña, cubierta con salsa de tomate, queso mozzarella y rodajas de pepperoni premium.", precio: 22.00, categoria: "Pizzas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124355/PEPPERONI_fgd8bs.jpg",
  ]},
  { id: "p3", nombre: "Prosciutto", descripcion: "Pizza crujiente con base de queso, acompañada de prosciutto italiano, rúcula fresca y queso parmesano.", precio: 26.00, categoria: "Pizzas", imagenes: [
    "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785124355/PROSCHHH_xnsjnn.jpg",
  ]},
];

// Mantenemos la galería vacía o mínima para que no dé errores en otros lugares,
// aunque la página de galería se eliminó.
export const galleryImages: GalleryImage[] = [];

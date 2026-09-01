export interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagenes: string[]; // Array of full image URLs
  imagenMenu?: string; // Optional override image for the Menu page
}

export interface GalleryImage {
  id: string;
  url: string; // Cloudinary public_id
  alt: string;
  categoria: string;
}

export interface RestaurantInfo {
  nombrePrincipal: string;
  nombreSecundario: string;
  horarios: string;
  direccion: string;
  telefono: string;
  email?: string;
  whatsapp?: string;
  redesSociales: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

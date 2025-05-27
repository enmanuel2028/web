import { ApiService } from '../services/ApiService';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock?: number;
  category?: string;
  onSale?: boolean;
}

// Interface para respuesta paginada del API
export interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export class ProductModel {
  /**
   * Obtiene todos los productos desde el backend.
   * @returns Promise<Product[]> Lista de productos o arreglo vacío si hay error.
   */
  public async getProducts(): Promise<Product[]> {
    try {
      const data = await ApiService.get('/productos');
      return this.mapProductsFromApi(data);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return [];
    }
  }

  /**
   * Obtiene productos paginados según página y límite.
   * @param page Número de página (por defecto 1)
   * @param limit Cantidad de productos por página (por defecto 12)
   * @returns Promise<PaginatedResponse> Productos paginados con total y datos de paginación
   */
  public async getPaginatedProducts(page: number = 1, limit: number = 12): Promise<PaginatedResponse> {
    try {
      const data = await ApiService.get(`/productos/paginados?page=${page}&limit=${limit}`);
      return {
        products: this.mapProductsFromApi(data.products),
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error obteniendo productos paginados:', error);
      return {
        products: [],
        total: 0,
        page: page,
        limit: limit
      };
    }
  }

  /**
   * Busca productos que coincidan con la consulta proporcionada.
   * @param query Texto de búsqueda
   * @returns Promise<Product[]> Lista de productos que coinciden o vacía si error.
   */
  public async searchProducts(query: string): Promise<Product[]> {
    try {
      const data = await ApiService.get(`/productos/buscar/${encodeURIComponent(query)}`);
      return this.mapProductsFromApi(data);
    } catch (error) {
      console.error('Error buscando productos:', error);
      return [];
    }
  }

  /**
   * Obtiene un producto por su ID.
   * @param id Identificador del producto
   * @returns Promise<Product | null> Producto encontrado o null si error
   */
  public async getProductById(id: number): Promise<Product | null> {
    try {
      const data = await ApiService.get(`/productos/${id}`);
      return this.mapProductFromApi(data);
    } catch (error) {
      console.error(`Error obteniendo producto con ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Crea un nuevo producto (solo admins).
   * @param product Objeto con datos del producto
   * @returns Promise<Product | null> Producto creado o null si error
   */
  public async createProduct(product: {
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    categoria: string;
    imagen: string;
  }): Promise<Product | null> {
    try {
      const data = await ApiService.post('/productos', product);
      return this.mapProductFromApi(data);
    } catch (error) {
      console.error('Error creando producto:', error);
      return null;
    }
  }

  /**
   * Actualiza un producto existente (solo admins).
   * @param id ID del producto a actualizar
   * @param product Objeto con campos a actualizar
   * @returns Promise<Product | null> Producto actualizado o null si error
   */
  public async updateProduct(id: number, product: {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    stock?: number;
    categoria?: string;
    imagen?: string;
  }): Promise<Product | null> {
    try {
      const data = await ApiService.put(`/productos/${id}`, product);
      return this.mapProductFromApi(data);
    } catch (error) {
      console.error(`Error actualizando producto con ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Elimina un producto por ID (solo admins).
   * @param id ID del producto a eliminar
   * @returns Promise<boolean> true si eliminado, false si error
   */
  public async deleteProduct(id: number): Promise<boolean> {
    try {
      await ApiService.delete(`/productos/${id}`);
      return true;
    } catch (error) {
      console.error(`Error eliminando producto con ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Mapea un objeto recibido del API al formato Product de la aplicación.
   * @param data Objeto con datos del producto del API
   * @returns Product Objeto con datos normalizados
   */
  private mapProductFromApi(data: any): Product {
    return {
      id: data.id,
      name: data.nombre || '',
      description: data.descripcion || '',
      price: parseFloat(data.precio) || 0,
      imageUrl: this.getImageUrl(data.id + '.jpg'), // Construye URL de imagen con ID
      stock: data.cantidad_disponible || 0,
      category: data.categoria || '',
      onSale: parseFloat(data.precio) > 50 // Ejemplo de lógica de negocio: si precio > 50, está en oferta
    };
  }

  /**
   * Mapea un arreglo de objetos recibidos del API a un arreglo de Product.
   * @param data Array con objetos producto del API
   * @returns Product[] Array con productos mapeados
   */
  private mapProductsFromApi(data: any[]): Product[] {
    return data.map(item => this.mapProductFromApi(item));
  }

  /**
   * Construye la URL completa para la imagen de un producto.
   * @param imagePath Nombre o path de la imagen
   * @returns string URL completa para la imagen
   */
  private getImageUrl(imagePath: string): string {
    // Si la ruta es una URL completa, la devuelve tal cual
    if (imagePath && imagePath.startsWith('http')) {
      return imagePath;
    }
    // Construye URL usando base local para imágenes
    return `http://localhost:3001/imagenes/${imagePath}`;
  }
}

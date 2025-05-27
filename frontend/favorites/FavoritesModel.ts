import { ApiService } from '../services/ApiService';

export class FavoritesModel {
  /**
   * Obtiene la lista completa de productos favoritos del usuario.
   * Extrae el id del usuario desde localStorage y hace una petición GET al backend.
   * @returns Promise<any[]> Lista de favoritos o arreglo vacío si hay error o usuario no logueado.
   */
  async getFavorites(): Promise<any[]> {
    try {
      // Obtener datos del usuario almacenados en localStorage
      const userData = localStorage.getItem('userData');
      if (!userData) return [];

      const user = JSON.parse(userData);
      const userId = user.id;

      // Hacer petición GET para obtener los favoritos del usuario
      return await ApiService.get(`/favoritos/${userId}`);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      return [];
    }
  }

  /**
   * Agrega un producto a los favoritos del usuario.
   * Envía una petición POST con userId y productId.
   * Dispara un evento para notificar otros componentes sobre el cambio.
   * @param productId Id del producto a agregar a favoritos
   */
  async addFavorite(productId: number): Promise<void> {
    try {
      // Obtener datos del usuario
      const userData = localStorage.getItem('userData');
      if (!userData) return;

      const user = JSON.parse(userData);

      // Petición POST para agregar favorito
      await ApiService.post('/favoritos', {
        userId: user.id,
        productId: productId
      });

      // Disparar evento personalizado para indicar actualización en favoritos
      document.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error('Error agregando favorito:', error);
    }
  }

  /**
   * Elimina un producto de los favoritos del usuario.
   * Envía una petición DELETE con userId y productId.
   * Dispara evento para notificar otros componentes sobre el cambio.
   * @param productId Id del producto a eliminar de favoritos
   */
  async removeFavorite(productId: number): Promise<void> {
    try {
      // Obtener datos del usuario
      const userData = localStorage.getItem('userData');
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user.id;

      // Petición DELETE para eliminar favorito
      await ApiService.delete(`/favoritos/${userId}/${productId}`);

      // Disparar evento para notificar actualización en favoritos
      document.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    }
  }

  /**
   * Verifica si un producto específico está en la lista de favoritos.
   * @param productId Id del producto a verificar
   * @returns Promise<boolean> true si está en favoritos, false si no o si hay error
   */
  async isFavorite(productId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(item => item.productId === productId);
    } catch (error) {
      console.error('Error verificando estado de favorito:', error);
      return false;
    }
  }

  /**
   * Obtiene los favoritos filtrados según un criterio opcional.
   * Si no se provee filtro, devuelve todos los favoritos.
   * @param filter Texto opcional para filtrar favoritos
   * @returns Promise<any[]> Lista de favoritos filtrados o todos si no hay filtro
   */
  async getFilteredFavorites(filter?: string): Promise<any[]> {
    try {
      // Obtener datos del usuario
      const userData = localStorage.getItem('userData');
      if (!userData) return [];

      const user = JSON.parse(userData);
      const userId = user.id;

      // Construir endpoint con o sin filtro
      const endpoint = filter 
        ? `/favoritos/${userId}/filtrar?filter=${encodeURIComponent(filter)}` 
        : `/favoritos/${userId}`;

      // Petición GET para obtener favoritos filtrados
      return await ApiService.get(endpoint);
    } catch (error) {
      console.error('Error obteniendo favoritos filtrados:', error);
      return [];
    }
  }
}

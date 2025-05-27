import { Product } from '../products/ProductModel';

export class CartModel {
  // Clave usada para guardar y obtener el carrito en localStorage
  private readonly CART_STORAGE_KEY = 'cartItems';

  /**
   * Obtiene todos los productos que están en el carrito desde localStorage.
   * @returns Promise con arreglo de items en el carrito o arreglo vacío si no hay.
   */
  async getCartItems(): Promise<CartItem[]> {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (!cartData) return [];
      return JSON.parse(cartData);
    } catch (error) {
      console.error('Error cargando carrito:', error);
      return [];
    }
  }

  /**
   * Obtiene el total de unidades de productos en el carrito (suma de cantidades).
   * @returns Promise con el número total de items en el carrito.
   */
  async getTotalItems(): Promise<number> {
    try {
      const items = await this.getCartItems();
      return items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error obteniendo total de items:', error);
      return 0;
    }
  }

  /**
   * Ajusta la cantidad de un producto en el carrito.
   * Si delta es -999, elimina el producto completamente.
   * @param productId ID del producto a modificar
   * @param delta Cambio a aplicar en cantidad (+1, -1, o -999 para eliminar)
   */
  async adjustQuantity(productId: string, delta: number): Promise<void> {
    try {
      const items = await this.getCartItems();

      if (delta === -999) {
        // Eliminar producto completo del carrito
        const updatedItems = items.filter(item => item.id !== productId);
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(updatedItems));
      } else {
        // Actualizar cantidad del producto
        const itemIndex = items.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
          items[itemIndex].quantity += delta;

          // Si la cantidad es 0 o menor, eliminar producto
          if (items[itemIndex].quantity <= 0) {
            items.splice(itemIndex, 1);
          } else {
            // Actualizar subtotal del producto
            items[itemIndex].subtotal = items[itemIndex].price * items[itemIndex].quantity;
          }
          localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
        }
      }

      // Notificar a otros componentes que el carrito cambió
      document.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  }

  /**
   * Agrega un producto al carrito o incrementa cantidad si ya existe.
   * @param product Producto a añadir
   * @param quantity Cantidad a añadir (por defecto 1)
   */
  async addItem(product: Product, quantity: number = 1): Promise<void> {
    try {
      const items = await this.getCartItems();

      const existingItemIndex = items.findIndex(item => item.id === product.id.toString());

      if (existingItemIndex !== -1) {
        // Incrementar cantidad existente y actualizar subtotal
        items[existingItemIndex].quantity += quantity;
        items[existingItemIndex].subtotal = items[existingItemIndex].price * items[existingItemIndex].quantity;
      } else {
        // Añadir nuevo producto al carrito
        const newItem: CartItem = {
          id: product.id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: quantity,
          onSale: product.onSale !== undefined ? product.onSale : false,
          subtotal: product.price * quantity
        };
        items.push(newItem);
      }

      // Guardar carrito actualizado en localStorage
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));

      // Notificar que el carrito se actualizó
      document.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error agregando producto:', error);
    }
  }

  /**
   * Obtiene un resumen del carrito: subtotal, total e ítems totales.
   * @returns Promise con resumen del carrito
   */
  async getCartSummary(): Promise<CartSummary> {
    try {
      const items = await this.getCartItems();

      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = items.reduce((count, item) => count + item.quantity, 0);

      return {
        subtotal: subtotal,
        total: subtotal, // Aquí podrías agregar impuestos, envío, etc.
        itemCount: itemCount
      };
    } catch (error) {
      console.error('Error obteniendo resumen del carrito:', error);
      return {
        subtotal: 0,
        total: 0,
        itemCount: 0
      };
    }
  }
}

// Interface que representa un producto dentro del carrito
export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
  onSale: boolean;
  subtotal: number;
}

// Interface para resumen del carrito
export interface CartSummary {
  subtotal: number;
  total: number;
  itemCount: number;
}

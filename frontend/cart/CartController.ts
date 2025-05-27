import { CartModel } from './CartModel';

export class CartController {
  // Elementos HTML relacionados con el carrito
  private cartSlide: HTMLElement;
  private cartItemsContainer: HTMLElement;
  private cartCountSpan: HTMLElement;
  private cartSubtotalSpan: HTMLElement;
  private cartTotalSpan: HTMLElement;
  private cartMessage: HTMLElement;
  private closeBtn: HTMLElement;
  private cartModel: CartModel;

  // Monto mínimo para aplicar envío gratuito
  private freeShippingLimit = 45.0;

  constructor() {
    // Inicializa modelo y elementos del DOM
    this.cartModel = new CartModel();
    this.cartSlide = document.getElementById('cartSlide')!;
    this.cartItemsContainer = document.getElementById('cartItems')!;
    this.cartCountSpan = document.getElementById('cartCount')!;
    this.cartSubtotalSpan = document.getElementById('cartSubtotal')!;
    this.cartTotalSpan = document.getElementById('cartTotal')!;
    this.cartMessage = document.getElementById('cartMessage')!;
    this.closeBtn = document.getElementById('closeCartBtn')!;

    // Evento para cerrar el carrito cuando se clickea el botón cerrar
    this.closeBtn.addEventListener('click', () => this.hide());

    // Cargar los ítems del carrito al inicializar
    this.loadCartItems();
  }

  /**
   * Carga los ítems del carrito desde el modelo y los renderiza en la vista.
   * Maneja errores si no puede cargar los datos.
   */
  private async loadCartItems() {
    try {
      const items = await this.cartModel.getCartItems();
      this.render(items);
    } catch (error) {
      console.error('Error cargando los ítems del carrito:', error);
    }
  }

  /**
   * Refresca la lista de ítems en el carrito recargando los datos.
   */
  public async refreshCartItems() {
    await this.loadCartItems();
  }

  /**
   * Muestra el panel lateral del carrito.
   * También refresca los ítems para mostrar datos actualizados.
   */
  show() {
    this.cartSlide.classList.remove('hidden');
    this.cartSlide.classList.add('visible');
    this.loadCartItems();
  }

  /**
   * Oculta el panel lateral del carrito.
   */
  hide() {
    this.cartSlide.classList.remove('visible');
    this.cartSlide.classList.add('hidden');
  }

  /**
   * Calcula el subtotal sumando el precio por cantidad de todos los ítems.
   * @param items Array con los ítems del carrito
   * @returns subtotal numérico
   */
  private calculateSubtotal(items: any[]) {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  /**
   * Elimina un producto del carrito usando el modelo (cantidad -999 indica eliminación total).
   * Luego recarga y actualiza el contador del carrito.
   * @param id Id del producto a eliminar
   */
  private async removeProduct(id: string) {
    try {
      await this.cartModel.adjustQuantity(id, -999);
      await this.loadCartItems();
      this.updateCartCounter();
    } catch (error) {
      console.error('Error eliminando ítem:', error);
    }
  }

  /**
   * Actualiza la cantidad de un producto sumando delta (+1 o -1).
   * Luego recarga los ítems y actualiza el contador.
   * @param id Id del producto
   * @param delta Incremento o decremento (1 o -1)
   */
  private async updateQuantity(id: string, delta: number) {
    try {
      await this.cartModel.adjustQuantity(id, delta);
      await this.loadCartItems();
      this.updateCartCounter();
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  }

  /**
   * Actualiza el contador visual del número total de ítems en el carrito.
   */
  private async updateCartCounter() {
    try {
      const count = await this.cartModel.getTotalItems();
      const counterElement = document.getElementById('cartCounter');
      if (counterElement) {
        counterElement.textContent = count.toString();
      }
    } catch (error) {
      console.error('Error actualizando el contador del carrito:', error);
    }
  }

  /**
   * Renderiza los ítems del carrito en el HTML, actualiza subtotal, total y mensaje de envío gratuito.
   * Añade los event listeners a los botones de cantidad y eliminación para responder a interacciones.
   * @param items Array con los ítems a mostrar
   */
  private render(items: any[]) {
    // Actualizar el número de ítems visibles en el carrito
    this.cartCountSpan.textContent = items.length.toString();

    // Renderizar la lista de ítems en formato HTML
    this.cartItemsContainer.innerHTML = items.map(item => `
      <div class="cart-item">
        <img src="${item.imageUrl}" alt="${item.name}">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-price">${item.price.toFixed(2)} €</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <div class="cart-item-subtotal">
          ${(item.price * item.quantity).toFixed(2)} €
        </div>
        <button class="cart-item-remove" data-id="${item.id}">&times;</button>
      </div>
    `).join('');

    // Calcular y mostrar subtotal y total
    const subtotal = this.calculateSubtotal(items);
    this.cartSubtotalSpan.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
    this.cartTotalSpan.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';

    // Mostrar mensaje sobre envío gratuito según subtotal
    const remaining = this.freeShippingLimit - subtotal;
    if (remaining > 0) {
      this.cartMessage.textContent = `Te faltan ${remaining.toFixed(2).replace('.', ',')} € para disfrutar del envío gratuito.`;
    } else {
      this.cartMessage.textContent = '¡Envío gratuito aplicado!';
    }

    // Asignar evento click a botones de cantidad (+ y -)
    this.cartItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        const id = target.dataset.id;
        const delta = target.classList.contains('plus') ? 1 : -1;
        if (id) {
          await this.updateQuantity(id, delta);
        }
      });
    });

    // Asignar evento click a botones de eliminar producto (×)
    this.cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        const id = target.dataset.id;
        if (id) {
          await this.removeProduct(id);
        }
      });
    });
  }
}

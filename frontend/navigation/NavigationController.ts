import { CartModel } from '../cart/CartModel';
import { AccountController } from '../account/AccountController';
import { CartController } from '../cart/CartController';

export class NavigationController {
  private cartModel: CartModel;
  private accountController: AccountController;
  private cartController: CartController | null = null;
  
  constructor() {
    // Inicializa el modelo del carrito
    this.cartModel = new CartModel();
    
    // Obtiene o crea el contenedor para la cuenta de usuario
    const accountContainer = document.getElementById('accountContainer') || document.createElement('div');
    if (!accountContainer.id) {
      accountContainer.id = 'accountContainer';
      document.body.appendChild(accountContainer);
    }
    // Inicializa el controlador de cuenta con el contenedor
    this.accountController = new AccountController(accountContainer);
    
    // Inicializa el carrito (y crea el DOM si no existe)
    this.initializeCart();
    
    // Configura los eventos del DOM para botones y menús
    this.setupEventListeners();
    // Configura la actualización del contador del carrito cuando cambie
    this.setupCartUpdates();
  }

  /**
   * Crea el panel lateral del carrito en el DOM si no existe,
   * y crea el controlador asociado.
   */
  private initializeCart() {
    // Verifica si ya existe el panel lateral del carrito
    if (!document.getElementById('cartSlide')) {
      // Plantilla HTML del panel del carrito
      const cartSlideTemplate = document.createElement('template');
      cartSlideTemplate.innerHTML = `
        <div class="cart-slide" id="cartSlide">
          <div class="cart-header">
            <h2>Esta es tu cesta de la compra</h2>
            <button class="close-btn" id="closeCartBtn">&times;</button>
          </div>
          <div class="cart-content">
            <div id="cartItems" class="cart-items"></div>
            <div class="cart-summary">
              <div>
                <span>SUBTOTAL</span>
                <span id="cartSubtotal">0,00 €</span>
              </div>
              <div>
                <strong>TOTAL:</strong>
                <strong id="cartTotal">0,00 €</strong>
              </div>
              <div class="cart-message" id="cartMessage"></div>
            </div>
            <div class="cart-actions">
              <button class="checkout-button" id="checkoutBtn">Realizar pedido</button>
              <a href="/products" class="continue-shopping">¿Quieres añadir más productos?</a>
            </div>
          </div>
        </div>
      `;
      // Añade el panel al body
      document.body.appendChild(cartSlideTemplate.content.firstElementChild as Node);
    }
    
    // Crea el controlador del carrito
    this.cartController = new CartController();
  }

  /**
   * Configura los event listeners para los botones principales:
   * - Botón para mostrar carrito
   * - Menú desplegable de cuenta (login, registro, logout, carrito)
   * - Botón para mostrar/ocultar menú cuenta
   * - Botón de favoritos
   */
  private setupEventListeners() {
    // Botón para abrir el carrito
    const cartBtn = document.getElementById('cartBtn');
    cartBtn?.addEventListener('click', () => {
      this.cartController?.show();
    });
    
    // Menú desplegable de cuenta con acciones
    const accountDropdown = document.getElementById('accountDropdown');
    if (accountDropdown) {
      accountDropdown.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const action = target.closest('li')?.getAttribute('data-action');
        
        if (action) {
          switch(action) {
            case 'login':
              this.accountController.showLogin();
              break;
            case 'register':
              this.accountController.showRegister();
              break;
            case 'logout':
              this.accountController.logout();
              break;
            case 'cart':
              this.cartController?.show();
              break;
          }
        }
      });
    }
    
    // Botón para mostrar/ocultar menú de cuenta
    const accountBtn = document.getElementById('accountBtn');
    accountBtn?.addEventListener('click', () => {
      const dropdown = document.getElementById('accountDropdown');
      dropdown?.classList.toggle('hidden');
    });

    // Botón de favoritos que dispara evento para actualizar favoritos
    document.getElementById('favoritesBtn')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('favoritesUpdated'));
    });
  }

  /**
   * Actualiza el contador de ítems en el carrito mostrado en la navegación.
   */
  public async refreshCartCounter() {
    const count = await this.cartModel.getTotalItems();
    const counterElement = document.getElementById('cartCounter');
    if (counterElement) {
      counterElement.textContent = count.toString();
    }
  }

  /**
   * Escucha el evento 'cartUpdated' para refrescar el contador automáticamente.
   */
  public setupCartUpdates() {
    document.addEventListener('cartUpdated', () => {
      this.refreshCartCounter();
    });
  }
  
  /**
   * Método público para mostrar el panel lateral del carrito.
   */
  public showCartSlide() {
    this.cartController?.show();
  }

  /**
   * Método público para refrescar los ítems mostrados en el carrito.
   */
  public refreshCartItems() {
    this.cartController?.refreshCartItems?.();
  }
}

// Declaración global para exponer el controlador en window
declare global {
  interface Window {
    navigationController: NavigationController;
  }
}

// Inicializa el controlador una vez que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const navigationController = new NavigationController();
  window.navigationController = navigationController;
});

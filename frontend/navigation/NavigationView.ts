import { CartModel } from '../cart/CartModel';
import { AccountController } from '../account/AccountController';

export class NavigationView {
  
  // Elemento principal del componente navegación
  private element: HTMLElement;
  private accountController: AccountController;
  private cartModel: CartModel;
  private cartSlide: HTMLElement | null = null;

  /**
   * Constructor que inicializa la vista, crea el DOM de navegación y configura funcionalidades.
   * @param accountController Controlador para manejar la cuenta de usuario
   */
  constructor(accountController: AccountController) {
    this.accountController = accountController;
    this.cartModel = new CartModel();

    // Crear el elemento principal a partir del HTML base
    const template = document.createElement('template');
    template.innerHTML = this.getHTML();
    this.element = template.content.firstElementChild as HTMLElement;

    // Configurar panel lateral del carrito
    this.setupCartSlide();

    // Configurar menú desplegable de cuenta
    this.setupAccountDropdown();

    // Configurar funcionalidad del buscador
    this.setupSearch();

    // Actualizar contador de productos en el carrito
    this.updateCartCounter();
  }

  /**
   * Actualiza el contador visual del total de productos en el carrito.
   */
  private async updateCartCounter() {
    const count = await this.cartModel.getTotalItems();
    const counter = document.getElementById('cartCounter');
    if (counter) {
      counter.textContent = count.toString();
    }
  }

  /**
   * 
   * - NavigationView Class 
   */
  private setupCartSlide() {
    // Si el panel del carrito no existe, crearlo y añadirlo al DOM
    if (!document.getElementById('cartSlide')) {
      const cartSlideHTML = `
        <div id="cartSlide" class="cart-slide">
          <div class="cart-header">
            <h2><span class="material-symbols-rounded">shopping_cart</span> MI CARRITO (<span id="cartCount">0</span>)</h2>
            <button id="closeCartBtn" class="close-btn" aria-label="Cerrar carrito">&times;</button>
          </div>

          <div class="cart-content">
            <div id="cartItems" class="cart-items"></div>

            <div class="cart-summary">
              <div>Subtotal <span id="cartSubtotal">0,00 €</span></div>
              <div><strong>TOTAL (IVA incluido)</strong> <strong id="cartTotal">0,00 €</strong></div>
              <div id="cartMessage" class="cart-message">Te faltan 0,00 € para disfrutar del envío gratuito.</div>
            </div>
          </div>

          <div class="cart-actions">
            <button id="goToCartBtn" class="btn green">
              <span class="material-symbols-rounded">shopping_bag</span> Ver carrito
            </button>
            <button id="checkoutBtn" class="btn green">
              <span class="material-symbols-rounded">payment</span> Realizar pedido
            </button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', cartSlideHTML);
    }

    this.cartSlide = document.getElementById('cartSlide');
    const cartBtn = this.element.querySelector('#cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const goToCartBtn = document.getElementById('goToCartBtn');

    // Evento para abrir/cerrar el panel del carrito al hacer click en el botón carrito
    cartBtn?.addEventListener('click', () => {
      this.toggleCartSlide();
    });

    // Evento para cerrar el panel al hacer click en el botón cerrar
    closeCartBtn?.addEventListener('click', () => {
      this.hideCartSlide();
    });

    // Cerrar panel si se hace click fuera del carrito o del botón carrito
    document.addEventListener('click', (e) => {
      if (
        this.cartSlide &&
        !this.cartSlide.contains(e.target as Node) &&
        cartBtn &&
        !cartBtn.contains(e.target as Node)
      ) {
        this.hideCartSlide();
      }
    });

    // Evento para el botón "Ver carrito" (puedes implementar navegación)
    goToCartBtn?.addEventListener('click', () => {
      this.hideCartSlide();
      // Navegación al carrito (pendiente implementar)
    });

    // Cargar productos inicialmente en el carrito
    this.loadCartItems();
  }

  /**
   * Carga y renderiza los productos del carrito, actualiza totales y mensajes,
   * y configura eventos para botones de cantidad y eliminar.
   */
  private async loadCartItems() {
    try {
      const items = await this.cartModel.getCartItems();
      const cartItemsContainer = document.getElementById('cartItems');
      const cartCountSpan = document.getElementById('cartCount');
      const cartSubtotalSpan = document.getElementById('cartSubtotal');
      const cartTotalSpan = document.getElementById('cartTotal');
      const cartMessage = document.getElementById('cartMessage');

      if (cartItemsContainer && cartCountSpan && cartSubtotalSpan && cartTotalSpan && cartMessage) {
        cartCountSpan.textContent = items.length.toString();

        // Construir el HTML para cada producto en el carrito
        cartItemsContainer.innerHTML = items
          .map(
            (item) => `
          <div class="cart-item">
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="cart-item-details">
              <h4>${item.name}</h4>
              <div class="cart-item-price">${item.price.toFixed(2)} €</div>
              <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}" aria-label="Disminuir cantidad">
                  <span class="material-symbols-rounded">remove</span>
                </button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}" aria-label="Aumentar cantidad">
                  <span class="material-symbols-rounded">add</span>
                </button>
              </div>
            </div>
            <div class="cart-item-subtotal">
              ${(item.price * item.quantity).toFixed(2)} €
            </div>
            <button class="cart-item-remove" data-id="${item.id}" aria-label="Eliminar producto">
              <span class="material-symbols-rounded">delete</span>
            </button>
          </div>
        `
          )
          .join('');

        // Calcular subtotal y total
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartSubtotalSpan.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
        cartTotalSpan.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';

        // Mostrar mensaje de envío gratuito si corresponde
        const freeShippingLimit = 45.0;
        const remaining = freeShippingLimit - subtotal;
        if (remaining > 0) {
          cartMessage.textContent = `Te faltan ${remaining.toFixed(2).replace('.', ',')} € para disfrutar del envío gratuito.`;
        } else {
          cartMessage.textContent = '¡Envío gratuito aplicado!';
        }

        // Eventos para los botones de cantidad (+/-)
        cartItemsContainer.querySelectorAll('.quantity-btn').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            const id = target.dataset.id;
            const delta = target.classList.contains('plus') ? 1 : -1;
            if (id) {
              await this.cartModel.adjustQuantity(id, delta);
              this.loadCartItems();
              this.updateCartCounter();
            }
          });
        });

        // Eventos para los botones eliminar producto
        cartItemsContainer.querySelectorAll('.cart-item-remove').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            const id = target.dataset.id;
            if (id) {
              await this.cartModel.adjustQuantity(id, -999);
              this.loadCartItems();
              this.updateCartCounter();
            }
          });
        });
      }
    } catch (error) {
      console.error('Error cargando los productos del carrito:', error);
    }
  }

  /**
   * Alterna la visibilidad del panel lateral del carrito.
   * Si se muestra, carga los productos actualizados.
   */
  private toggleCartSlide() {
    if (this.cartSlide) {
      this.cartSlide.classList.toggle('visible');
      if (this.cartSlide.classList.contains('visible')) {
        this.loadCartItems();
      }
    }
  }

  /**
   * Oculta el panel lateral del carrito.
   */
  private hideCartSlide() {
    if (this.cartSlide) {
      this.cartSlide.classList.remove('visible');
    }
  }

  /**
   * Configura el menú desplegable de la cuenta con opciones:
   * perfil, pedidos, login, registro y logout.
   * Maneja eventos click y cierra menú si se hace click fuera.
   */
  private setupAccountDropdown() {
    const accountBtn = this.element.querySelector('#accountBtn');
    if (!accountBtn) return;

    // Crear el dropdown del menú de cuenta
    const dropdown = document.createElement('div');
    dropdown.className = 'account-dropdown';
    dropdown.innerHTML = `
      <ul class="dropdown-menu">
        <li data-action="profile"><span class="material-symbols-rounded">person</span> Mi perfil</li>
        <li data-action="orders"><span class="material-symbols-rounded">receipt_long</span> Mis pedidos</li>
        <li data-action="login"><span class="material-symbols-rounded">login</span> Iniciar sesión</li>
        <li data-action="register"><span class="material-symbols-rounded">person_add</span> Registrarse</li>
        <li data-action="logout"><span class="material-symbols-rounded">logout</span> Cerrar sesión</li>
      </ul>
    `;
    accountBtn.appendChild(dropdown);

    // Mostrar/ocultar menú al hacer click en botón cuenta
    accountBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // evitar cerrar inmediatamente por listener global
      dropdown.classList.toggle('show');
    });

    // Manejar clicks en las opciones del menú
    dropdown.querySelectorAll('li').forEach((item) => {
      item.addEventListener('click', async (e) => {
        const action = item.dataset.action;
        dropdown.classList.remove('show');

        if (action === 'profile' && this.accountController.showProfile) {
          this.accountController.showProfile();
        }
        if (action === 'orders' && this.accountController.showOrders) {
          this.accountController.showOrders();
        }
        if (action === 'logout' && this.accountController.logout) {
          await this.accountController.logout();
        }
      });
    });

    // Cerrar dropdown si se hace click fuera del menú
    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });
  }

  /**
   * Configura la funcionalidad del buscador:
   * manejar click en botón y tecla Enter para lanzar búsqueda.
   */
  private setupSearch() {
    const searchInput = this.element.querySelector('#searchInput') as HTMLInputElement;
    const searchBtn = this.element.querySelector('#searchBtn');

    // Buscar al hacer click en el botón
    searchBtn?.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        console.log('Buscando:', query);
        // Aquí implementar lógica real de búsqueda o navegación
      }
    });

    // Buscar al presionar Enter en el input
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          console.log('Buscando:', query);
          // Aquí implementar lógica real de búsqueda o navegación
        }
      }
    });
  }

  /**
   * Devuelve el HTML base de la barra de navegación.
   * Incluye logo, buscador, botones favoritos, cuenta y carrito.
   * @returns string HTML de la navegación
   */
  private getHTML(): string {
    return `
      <nav class="main-nav">
        <img src="./assets/imagenes/logo.jpg" alt="Logo Buena Vida" class="nav-logo" />

        <div class="nav-controls">
          <div class="search-container">
            <input type="text" placeholder="¿Qué producto estás buscando...?" id="searchInput" />
            <button class="search-btn" id="searchBtn" aria-label="Buscar">
              <span class="material-symbols-rounded">search</span>
            </button>
          </div>

          <button class="nav-icon" id="favoritesBtn" aria-label="Favoritos">
            <span class="material-symbols-rounded">favorite</span>
            <span class="nav-text">Favoritos</span>
          </button>

          <div class="nav-icon" id="accountBtn" aria-haspopup="true" aria-expanded="false" aria-label="Mi cuenta">
            <span class="material-symbols-rounded">person</span>
            <span class="nav-text">Mi cuenta</span>
          </div>

          <button class="nav-icon" id="cartBtn" aria-label="Carrito de compras">
            <span class="material-symbols-rounded">shopping_cart</span>
            <span class="cart-counter" id="cartCounter">0</span>
            <span class="nav-text">Carrito</span>
          </button>
        </div>
      </nav>
    `;
  }

  /**
   * Devuelve el elemento principal de la vista.
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Permite asociar callbacks a acciones específicas del menú de cuenta.
   * @param action Nombre de la acción (ej: "profile", "logout")
   * @param callback Función a ejecutar cuando se selecciona la acción
   */
  public onMenuAction(action: string, callback: () => void) {
    const dropdown = this.element.querySelector('.account-dropdown');
    const actionItem = dropdown?.querySelector(`[data-action="${action}"]`);
    actionItem?.addEventListener('click', callback);
  }
}

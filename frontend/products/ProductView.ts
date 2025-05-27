import { Product } from "./ProductModel";
import { CartModel } from "../cart/CartModel";
import { FavoritesModel } from "../favorites/FavoritesModel";

// Extiende la interfaz global Window para incluir referencias a controladores
declare global {
  interface Window {
    navigationView: any;
    cartController: any;
  }
}

export class ProductView {
  private currentPage = 1;           // Página actual para la paginación
  private itemsPerPage = 12;         // Productos mostrados por página
  private cartModel: CartModel;
  private favoritesModel: FavoritesModel;
  private productModal: HTMLElement | null = null; // Modal para mostrar detalles
  private products: Product[] = [];  // Lista de productos cargados

  /**
   * Constructor que inicializa modelos y prepara el modal de producto.
   * También se suscribe a evento para actualizar favoritos y re-renderizar.
   */
  constructor() {
    this.cartModel = new CartModel();
    this.favoritesModel = new FavoritesModel();
    this.setupProductModal();

    // Re-renderiza la lista cuando se actualizan los favoritos
    document.addEventListener('favoritesUpdated', () => {
      this.render(document.querySelector('.product-container') as HTMLElement, this.products);
    });
  }

  /**
   * Configura y crea el modal de detalles del producto, junto con sus eventos
   * para cerrar, cambiar cantidad, añadir a carrito y manejar favoritos.
   */
  private setupProductModal() {
    if (!document.getElementById('productModal')) {
      const modalHTML = `
        <div id="productModal" class="product-modal">
          <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-product">
              <div class="modal-product-image">
                <img src="" alt="Product Image" id="modalProductImage">
              </div>
              <div class="modal-product-info">
                <h2 id="modalProductName"></h2>
                <p id="modalProductDescription"></p>
                <div class="modal-product-price" id="modalProductPrice"></div>
                <div class="modal-quantity">
                  <span>Cantidad:</span>
                  <div class="quantity-input">
                    <button id="decreaseQuantity">-</button>
                    <input type="number" value="1" min="1" id="productQuantity">
                    <button id="increaseQuantity">+</button>
                  </div>
                </div>
                <div class="modal-actions">
                  <button class="action-btn" id="addToCartBtn">
                    <span class="material-symbols-rounded">shopping_cart</span> Añadir al carrito
                  </button>
                  <button class="action-btn add-to-favorites" id="addToFavoritesBtn">
                    <span class="material-symbols-rounded">favorite</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this.productModal = document.getElementById('productModal');

      // Eventos para cerrar modal
      const closeBtn = this.productModal?.querySelector('.modal-close');
      closeBtn?.addEventListener('click', () => this.hideProductModal());

      // Cerrar modal si se hace clic fuera del contenido
      this.productModal?.addEventListener('click', (e) => {
        if (e.target === this.productModal) {
          this.hideProductModal();
        }
      });

      // Controles para aumentar/disminuir cantidad
      const decreaseBtn = this.productModal?.querySelector('#decreaseQuantity');
      const increaseBtn = this.productModal?.querySelector('#increaseQuantity');
      const quantityInput = this.productModal?.querySelector('#productQuantity') as HTMLInputElement;

      decreaseBtn?.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
          quantityInput.value = (currentValue - 1).toString();
        }
      });

      increaseBtn?.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = (currentValue + 1).toString();
      });

      // Añadir producto al carrito
      const addToCartBtn = this.productModal?.querySelector('#addToCartBtn');
      addToCartBtn?.addEventListener('click', async () => {
        const productId = this.productModal?.getAttribute('data-product-id');
        const quantity = parseInt((this.productModal?.querySelector('#productQuantity') as HTMLInputElement).value);
        if (productId) {
          const product = await this.getProductById(productId);
          if (product) {
            await this.cartModel.addItem(product, quantity);
            document.dispatchEvent(new CustomEvent('cartUpdated'));

            const counter = document.getElementById('cartCounter');
            if (counter) {
              const count = await this.cartModel.getTotalItems();
              counter.textContent = count.toString();
            }
            if (window.cartController) {
              window.cartController.show();
              window.cartController.refreshCartItems();
            } else if (window.navigationController) {
              window.navigationController.showCartSlide();
              window.navigationController.refreshCartItems();
            }
          }
          this.hideProductModal();
        }
      });

      // Manejar añadir o quitar favoritos
      const addToFavoritesBtn = this.productModal?.querySelector('#addToFavoritesBtn');
      addToFavoritesBtn?.addEventListener('click', async () => {
        addToFavoritesBtn.classList.toggle('active');
        const productId = this.productModal?.getAttribute('data-product-id');
        if (productId) {
          const id = parseInt(productId);
          if (await this.favoritesModel.isFavorite(id)) {
            this.favoritesModel.removeFavorite(id);
          } else {
            this.favoritesModel.addFavorite(id);
          }
        }
      });
    }
  }

  /**
   * Muestra el modal con la información completa del producto.
   * Actualiza imagen, nombre, descripción, precio, cantidad y estado favorito.
   * @param product Producto a mostrar en el modal
   */
  private async showProductModal(product: Product) {
    if (!this.productModal) return;

    this.productModal.setAttribute('data-product-id', product.id.toString());

    const productImage = this.productModal.querySelector('#modalProductImage') as HTMLImageElement;
    const productName = this.productModal.querySelector('#modalProductName');
    const productDescription = this.productModal.querySelector('#modalProductDescription');
    const productPrice = this.productModal.querySelector('#modalProductPrice');
    const addToFavoritesBtn = this.productModal.querySelector('#addToFavoritesBtn');

    if (productImage) productImage.src = product.imageUrl;
    if (productName) productName.textContent = product.name;
    if (productDescription) productDescription.textContent = product.description;
    if (productPrice) productPrice.textContent = `${product.price.toFixed(2)} €`;

    const quantityInput = this.productModal.querySelector('#productQuantity') as HTMLInputElement;
    if (quantityInput) quantityInput.value = '1';

    if (addToFavoritesBtn) {
      if (await this.favoritesModel.isFavorite(product.id)) {
        addToFavoritesBtn.classList.add('active');
      } else {
        addToFavoritesBtn.classList.remove('active');
      }
    }

    this.productModal.classList.add('visible');
  }

  /**
   * Oculta el modal del producto.
   */
  private hideProductModal() {
    this.productModal?.classList.remove('visible');
  }

  /**
   * Busca un producto en la lista actual por su ID.
   * @param productId ID del producto a buscar
   * @returns Producto encontrado o undefined si no existe
   */
  private async getProductById(productId: string | number): Promise<Product | undefined> {
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    return this.products.find(p => p.id === id);
  }

  /**
   * Renderiza la lista de productos paginada con botones para acciones.
   * Incluye control de eventos para abrir modal, agregar al carrito y favoritos.
   * @param container Elemento HTML donde se insertan los productos
   * @param products Lista completa de productos a mostrar
   */
  public async render(container: HTMLElement, products: Product[]) {
    this.products = products;
    container.innerHTML = `
      <div class="product-list"></div>
      <div class="pagination"></div>
    `;

    const list = container.querySelector('.product-list')!;
    const pagination = container.querySelector('.pagination')!;

    const totalPages = Math.ceil(products.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const paginatedProducts = products.slice(start, end);

    // Renderizar cada producto en HTML, agregando badge y estado favorito
    list.innerHTML = await Promise.all(paginatedProducts.map(async p => {
      const isFav = await this.favoritesModel.isFavorite(p.id);
      return `
      <div class="product-item" data-product-id="${p.id}">
        ${p.price > 50 ? `<div class="promo-badge">-10%</div>` : ''}
        <img src="${p.imageUrl}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <span>${p.price.toFixed(2)} €</span>
        <div class="product-actions">
          <button class="action-btn add-to-cart" data-id="${p.id}">
            <span class="material-symbols-rounded">shopping_cart</span> Añadir
          </button>
          <button class="action-btn add-to-favorites${isFav ? ' active' : ''}" data-id="${p.id}">
            <span class="material-symbols-rounded">favorite</span>
          </button>
        </div>
      </div>
      `;
    })).then(items => items.join(''));

    // Añadir eventos a cada producto para abrir modal y manejar botones
    list.querySelectorAll('.product-item').forEach((item, index) => {
      const product = paginatedProducts[index];
      item.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        // Evitar abrir modal si se clickea un botón de acción
        if (!target.closest('.product-actions')) {
          this.showProductModal(product);
        }
      });

      // Botón Añadir al carrito
      const addToCartBtn = item.querySelector('.add-to-cart');
      addToCartBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.cartModel.addItem(product, 1);
        const counter = document.getElementById('cartCounter');
        if (counter) {
          const count = await this.cartModel.getTotalItems();
          counter.textContent = count.toString();
        }
        if (window.cartController) {
          window.cartController.show();
          window.cartController.refreshCartItems();
        } else if (window.navigationController) {
          window.navigationController.showCartSlide();
          window.navigationController.refreshCartItems();
        }
      });

      // Botón Añadir/Quitar favoritos
      const addToFavoritesBtn = item.querySelector('.add-to-favorites');
      addToFavoritesBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        addToFavoritesBtn.classList.toggle('active');
        if (await this.favoritesModel.isFavorite(product.id)) {
          this.favoritesModel.removeFavorite(product.id);
        } else {
          this.favoritesModel.addFavorite(product.id);
        }
      });
    });

    // Renderizar paginación con botones de página y navegación prev/next
    pagination.innerHTML = '';

    if (this.currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '<span class="material-symbols-rounded">chevron_left</span>';
      prevBtn.addEventListener('click', () => {
        this.currentPage--;
        this.render(container, products);
      });
      pagination.appendChild(prevBtn);
    }

    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement('button');
      btn.textContent = i.toString();
      if (i === this.currentPage) btn.classList.add('active');
      btn.addEventListener('click', () => {
        this.currentPage = i;
        this.render(container, products);
      });
      pagination.appendChild(btn);
    }

    if (this.currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '<span class="material-symbols-rounded">chevron_right</span>';
      nextBtn.addEventListener('click', () => {
        this.currentPage++;
        this.render(container, products);
      });
      pagination.appendChild(nextBtn);
    }
  }
}

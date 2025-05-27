import { AccountController } from './account/AccountController';
import { CartController } from './cart/CartController';
import { FavoritesController } from './favorites/FavoritesController';
import { NavigationView } from './navigation/NavigationView';
import { ProductController } from './products/ProductController';
import { ProductModel } from './products/ProductModel';

const app = document.getElementById('app');

if (app) {
  // Inyectar HTML slide carrito
  const cartSlideHTML = `
<div id="cartSlide" class="cart-slide">
  <div class="cart-header">
    <h2>MI CARRITO (<span id="cartCount">0</span>)</h2>
    <button id="closeCartBtn" class="close-btn">&times;</button>
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
    <button id="goToCartBtn" class="btn green">Ir al carrito</button>
    <button id="checkoutBtn" class="btn green">Realizar pedido</button>
  </div>
</div>
  `;
  document.body.insertAdjacentHTML('beforeend', cartSlideHTML);

  // Crear controladores
  const cartController = new CartController();
  const accountController = new AccountController(document.createElement('section'));
  const nav = new NavigationView(accountController);
  const section = document.createElement('section');
  const productModel = new ProductModel();
  const productController = new ProductController(productModel);
  const favoritesController = new FavoritesController();

  // Make navigationView and cartController available globally
  window.navigationView = nav;
  window.cartController = cartController;

  // Listen for showFavorites event
  document.addEventListener('showFavorites', () => {
    section.innerHTML = '';
    favoritesController.render(section);
  });

  // Agregar navegación y sección al DOM
  app.appendChild(nav.getElement());
  app.appendChild(section);

  // Renderizar productos al inicio
  productController.render(section);

  // Abrir slide carrito al hacer clic en el botón carrito
  document.getElementById('cartBtn')?.addEventListener('click', () => {
    cartController.show();
  });

  // Ensure cart UI updates on cart changes
  document.addEventListener('cartUpdated', () => {
    cartController.refreshCartItems();
  });

  // Manejo menú navegación: login y registro
  nav.onMenuAction('login', () => {
    section.innerHTML = '';
    accountController.showLogin();
  });

  nav.onMenuAction('register', () => {
    section.innerHTML = '';
    accountController.showRegister();
  });
  
  // Manejo menú navegación: perfil y pedidos
  nav.onMenuAction('profile', () => {
    section.innerHTML = '';
    accountController.showProfile();
  });
  
  nav.onMenuAction('orders', () => {
    section.innerHTML = '';
    accountController.showOrders();
  });

  // Botón volver en login/registro
  accountController.onBack(() => {
    section.innerHTML = '';
    productController.render(section);
  });
}

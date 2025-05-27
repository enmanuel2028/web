import { FavoritesView } from './FavoritesView';
import { FavoritesModel } from './FavoritesModel';
import { CartModel } from '../cart/CartModel';

export class FavoritesController {
  private view: FavoritesView;
  private favoritesModel: FavoritesModel;
  private cartModel: CartModel;

  constructor() {
    this.view = new FavoritesView();
    this.favoritesModel = new FavoritesModel();
    this.cartModel = new CartModel();

    // Listen for favorites updates
    document.addEventListener('favoritesUpdated', () => {
      this.loadFavorites();
    });
  }

  private async loadFavorites() {
    try {
      const favorites = await this.favoritesModel.getFavorites();
      // Instead of querying the document, use the view's element directly
      this.view.renderFavorites(favorites);
      this.setupEventListeners();
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  private setupEventListeners() {
    // Use the view's element directly instead of querying the document
    const container = this.view.getElement();
    if (!container) return;

    // Add event listeners for remove from favorites buttons
    container.querySelectorAll('.remove-favorite').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const productId = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
        if (productId) {
          await this.favoritesModel.removeFavorite(productId);
          this.loadFavorites();
        }
      });
    });

    // Add event listeners for add to cart buttons
    container.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const productId = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
        if (productId) {
          const favorites = await this.favoritesModel.getFavorites();
          const product = favorites.find(f => f.id === productId);
          if (product) {
            await this.cartModel.addItem(product, 1);
            // Show cart slide
            if (window.cartController) {
              window.cartController.show();
            }
          }
        }
      });
    });
  }

  public async render(container: HTMLElement) {
    container.innerHTML = '';
    container.appendChild(this.view.getElement());
    await this.loadFavorites();
  }
}

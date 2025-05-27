export class FavoritesView {
  // Elemento principal contenedor de la vista de favoritos
  private element: HTMLElement;

  constructor() {
    // Crear un div para contener toda la vista y asignarle clase CSS
    this.element = document.createElement('div');
    this.element.className = 'favorites-container';

    // Contenido inicial con título y contenedor para la lista de favoritos
    this.element.innerHTML = `
      <h2>Mis Favoritos</h2>
      <div class="favorites-list"></div>
    `;
  }

  /**
   * Devuelve el elemento HTML principal de la vista.
   * @returns HTMLElement contenedor de la vista
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Renderiza la lista de productos favoritos dentro del contenedor.
   * Si no hay favoritos, muestra un mensaje indicándolo.
   * @param favorites Array con objetos que representan productos favoritos
   */
  public renderFavorites(favorites: any[]) {
    // Buscar el contenedor donde se listarán los favoritos
    const listContainer = this.element.querySelector('.favorites-list');
    if (!listContainer) return;

    // Mostrar mensaje si no hay favoritos
    if (favorites.length === 0) {
      listContainer.innerHTML = '<p class="no-favorites">No tienes productos favoritos aún.</p>';
      return;
    }

    // Construir y colocar el HTML de los productos favoritos
    listContainer.innerHTML = favorites.map(fav => `
      <div class="favorite-item" data-id="${fav.id}">
        <img src="${fav.imageUrl}" alt="${fav.name}" />
        <div class="favorite-details">
          <h3>${fav.name}</h3>
          <p>${fav.description}</p>
          <div class="favorite-price">${fav.price.toFixed(2)} €</div>
          <div class="favorite-actions">
            <button class="btn green add-to-cart" data-id="${fav.id}">
              <span class="material-symbols-rounded">shopping_cart</span> Añadir al carrito
            </button>
            <button class="btn remove-favorite" data-id="${fav.id}">
              <span class="material-symbols-rounded">delete</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

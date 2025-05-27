import { ProductFilterView } from './ProductFilterView';
import { Product, ProductModel } from './ProductModel';
import { ProductView } from './ProductView';

export class ProductController {
  private model: ProductModel;
  private view: ProductView;
  private filterView: ProductFilterView;
  private allProducts: Product[] = [];

  /**
   * Constructor que recibe el modelo de productos y crea la vista principal y el filtro.
   * @param model Instancia del modelo de productos
   */
  constructor(model: ProductModel) {
    this.model = model;
    this.view = new ProductView();
    this.filterView = new ProductFilterView();
  }

  /**
   * Renderiza el controlador dentro del contenedor indicado.
   * Crea estructura HTML con filtro y contenedor de productos.
   * Obtiene todos los productos, establece el máximo precio en el filtro,
   * renderiza los productos inicialmente y configura búsqueda y filtro de precio.
   * @param container Elemento HTML donde se montará la vista de productos y filtro
   */
  public async render(container: HTMLElement) {
    // Crear contenedor principal con flexbox para filtro y productos
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '24px';
    wrapper.style.padding = '24px';

    // Obtener elemento HTML del filtro y contenedor para productos
    const filterElement = this.filterView.getElement();
    const viewContainer = document.createElement('div');
    viewContainer.style.flex = '1';

    // Agregar filtro y contenedor de productos al wrapper
    wrapper.appendChild(filterElement);
    wrapper.appendChild(viewContainer);
    container.appendChild(wrapper);

    // Obtener todos los productos desde el modelo
    this.allProducts = await this.model.getProducts();

    // Calcular el precio máximo entre todos los productos
    const maxPrice = Math.max(...this.allProducts.map(p => p.price));

    // Configurar el filtro con el precio máximo encontrado
    this.filterView.setMaxPrice(maxPrice);

    // Renderizar inicialmente todos los productos
    await this.view.render(viewContainer, this.allProducts);

    // Configurar la búsqueda de productos por nombre o descripción
    this.setupSearch(viewContainer);

    // Configurar el filtro de precio para actualizar la vista cuando cambie
    this.filterView.onFilter((min, max) => {
      // Filtrar productos dentro del rango de precios seleccionado
      const filtered = this.allProducts.filter(p => p.price >= min && p.price <= max);
      this.view.render(viewContainer, filtered);
    });
  }

  /**
   * Configura el input de búsqueda para filtrar productos dinámicamente
   * según el texto ingresado en el buscador.
   * @param viewContainer Contenedor donde se renderizan los productos
   */
  private setupSearch(viewContainer: HTMLElement) {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
          // Filtrar productos que coincidan con la búsqueda en nombre o descripción
          const filtered = this.allProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query)
          );
          this.view.render(viewContainer, filtered);
        } else {
          // Si la búsqueda está vacía, mostrar todos los productos
          this.view.render(viewContainer, this.allProducts);
        }
      });
    }
  }
}

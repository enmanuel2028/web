export class ProductFilterView {
  // Elemento HTML que contiene todo el filtro
  private element: HTMLElement;
  // Precio máximo configurado para el filtro (valor inicial 100)
  private maxPrice: number = 100;

  /**
   * Constructor que crea el HTML base del filtro de precio y configura
   * los eventos para sincronizar inputs y slider.
   * Inicializa el precio máximo con un valor por defecto (100).
   */
  constructor() {
    this.maxPrice = 100; // Valor inicial por defecto

    // Crear un template HTML y obtener el primer elemento
    const template = document.createElement('template');
    template.innerHTML = this.getHTML();
    this.element = template.content.firstElementChild as HTMLElement;

    // Configurar eventos para inputs y slider
    this.setupEventListeners();
  }

  /**
   * Configura los event listeners para los elementos:
   * - Cuando cambia el slider, actualiza el input "max" y cambia fondo
   * - Cuando cambia el input "max", actualiza el slider y cambia fondo
   * - Cuando cambia el input "min", valida que no sea mayor que el max
   */
  private setupEventListeners() {
    const slider = this.element.querySelector('#priceRange') as HTMLInputElement;
    const minInput = this.element.querySelector('#minPrice') as HTMLInputElement;
    const maxInput = this.element.querySelector('#maxPrice') as HTMLInputElement;

    // Al mover el slider, sincronizar input max y actualizar fondo visual
    slider.addEventListener('input', () => {
      maxInput.value = slider.value;
      this.updateSliderBackground(slider);
    });

    // Al cambiar el input max, sincronizar slider y actualizar fondo
    maxInput.addEventListener('input', () => {
      slider.value = maxInput.value;
      this.updateSliderBackground(slider);
    });

    // Validar que min no supere al max, si es así corregirlo
    minInput.addEventListener('input', () => {
      const min = parseInt(minInput.value);
      const max = parseInt(maxInput.value);
      if (min > max) {
        minInput.value = maxInput.value;
      }
    });

    // Inicializar el fondo del slider para reflejar su valor
    this.updateSliderBackground(slider);
  }

  /**
   * Actualiza el estilo de fondo del slider para mostrar una barra
   * de progreso en función del valor seleccionado.
   * @param slider Input de tipo range a actualizar
   */
  private updateSliderBackground(slider: HTMLInputElement) {
    const value = parseInt(slider.value);
    const max = parseInt(slider.max);
    const percentage = (value / max) * 100;
    slider.style.background = `linear-gradient(to right, #cddc39 0%, #cddc39 ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
  }

  /**
   * Devuelve el código HTML que representa el filtro base, con un slider,
   * inputs numéricos para mínimo y máximo, y un botón para aplicar filtro.
   */
  private getHTML(): string {
    return `
      <aside class="filter-box">
        <h3>Filtrar por precio</h3>
        <input type="range" min="0" max="${this.maxPrice}" value="${this.maxPrice}" class="price-slider" id="priceRange" />
        
        <div class="price-inputs">
          <div>
            <label>Desde</label>
            <input type="number" id="minPrice" min="0" value="0" />
          </div>
          <div>
            <label>Hasta</label>
            <input type="number" id="maxPrice" max="${this.maxPrice}" value="${this.maxPrice}" />
          </div>
        </div>

        <button id="filterButton">Aplicar filtro</button>
      </aside>
    `;
  }

  /**
   * Actualiza el precio máximo permitido para el filtro, sincronizando
   * el slider y los inputs para reflejar el nuevo máximo.
   * @param price Nuevo valor máximo para el filtro
   */
  public setMaxPrice(price: number) {
    this.maxPrice = price;
    const slider = this.element.querySelector('#priceRange') as HTMLInputElement;
    const maxInput = this.element.querySelector('#maxPrice') as HTMLInputElement;
    
    slider.max = price.toString();
    slider.value = price.toString();
    maxInput.max = price.toString();
    maxInput.value = price.toString();
    
    this.updateSliderBackground(slider);
  }

  /**
   * Devuelve el elemento HTML contenedor del filtro para insertarlo en el DOM.
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Permite registrar un callback que se ejecuta cuando cambia el filtro,
   * ya sea por botón, inputs o slider. El callback recibe el rango seleccionado.
   * @param callback Función que recibe los valores min y max seleccionados
   */
  public onFilter(callback: (min: number, max: number) => void) {
    const btn = this.element.querySelector('#filterButton')!;
    const minInput = this.element.querySelector('#minPrice') as HTMLInputElement;
    const maxInput = this.element.querySelector('#maxPrice') as HTMLInputElement;
    const slider = this.element.querySelector('#priceRange') as HTMLInputElement;

    // Ejecutar callback al hacer click en el botón Aplicar filtro
    btn.addEventListener('click', () => {
      const min = parseInt(minInput.value);
      const max = parseInt(maxInput.value);
      callback(min, max);
    });

    // Ejecutar callback en tiempo real cuando se mueve el slider
    slider.addEventListener('input', () => {
      const min = parseInt(minInput.value);
      const max = parseInt(slider.value);
      callback(min, max);
    });

    // Ejecutar callback en tiempo real al cambiar los inputs numéricos
    minInput.addEventListener('change', () => {
      const min = parseInt(minInput.value);
      const max = parseInt(maxInput.value);
      callback(min, max);
    });

    maxInput.addEventListener('change', () => {
      const min = parseInt(minInput.value);
      const max = parseInt(maxInput.value);
      callback(min, max);
    });
  }
}

export class PriceFilterView {
  // Elemento contenedor del filtro de precio
  private filterPanel: HTMLElement;
  // Input para precio mínimo
  private minInput: HTMLInputElement;
  // Input para precio máximo
  private maxInput: HTMLInputElement;
  // Slider para controlar el precio máximo visualmente
  private slider: HTMLInputElement;

  /**
   * Constructor que crea el panel de filtro con inputs y slider,
   * configurando los valores mínimos y máximos iniciales.
   * @param min Precio mínimo permitido
   * @param max Precio máximo permitido
   */
  constructor(min: number, max: number) {
    this.filterPanel = document.createElement('div');
    this.filterPanel.className = 'price-filter-panel';

    // HTML con inputs numéricos y slider para rango de precio
    this.filterPanel.innerHTML = `
      <h4>Filtrar por precio</h4>
      <div class="price-inputs">
        <input type="number" class="min-price" min="${min}" max="${max}" value="${min}">
        <span>-</span>
        <input type="number" class="max-price" min="${min}" max="${max}" value="${max}">
      </div>
      <input type="range" class="price-slider" min="${min}" max="${max}" value="${max}" step="1">
    `;

    // Obtener referencias a los inputs y slider dentro del panel
    this.minInput = this.filterPanel.querySelector('.min-price') as HTMLInputElement;
    this.maxInput = this.filterPanel.querySelector('.max-price') as HTMLInputElement;
    this.slider = this.filterPanel.querySelector('.price-slider') as HTMLInputElement;
  }

  /**
   * Devuelve el elemento HTML que contiene el filtro para insertarlo en el DOM.
   * @returns HTMLElement panel de filtro de precio
   */
  getPanel(): HTMLElement {
    return this.filterPanel;
  }

  /**
   * Permite registrar una función callback que se ejecutará cada vez que
   * cambie el valor del precio mínimo o máximo (inputs o slider).
   * @param callback Función que recibe min y max actualizados
   */
  onPriceChange(callback: (min: number, max: number) => void) {
    this.minInput.addEventListener('input', () => {
      callback(Number(this.minInput.value), Number(this.maxInput.value));
    });
    this.maxInput.addEventListener('input', () => {
      callback(Number(this.minInput.value), Number(this.maxInput.value));
    });
    this.slider.addEventListener('input', () => {
      // Sincronizar slider con input máximo
      this.maxInput.value = this.slider.value;
      callback(Number(this.minInput.value), Number(this.maxInput.value));
    });
  }

  /**
   * Actualiza los valores del filtro (inputs y slider) programáticamente.
   * @param min Nuevo valor para el precio mínimo
   * @param max Nuevo valor para el precio máximo
   */
  setRange(min: number, max: number) {
    this.minInput.value = String(min);
    this.maxInput.value = String(max);
    this.slider.value = String(max);
  }
}

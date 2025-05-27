import { AccountModel } from './AccountModel';

export class LoginView {
  private element: HTMLElement;
  private accountModel: AccountModel;

  /**
   * Constructor que crea la vista de login y configura eventos.
   * @param accountModel Instancia del modelo de cuenta para autenticar
   */
  constructor(accountModel: AccountModel) {
    this.accountModel = accountModel;
    const template = document.createElement('template');
    template.innerHTML = this.getHTML().trim();
    this.element = template.content.firstElementChild as HTMLElement;
    this.setupEventListeners();
  }

  /**
   * Permite registrar un callback que se ejecutará al hacer clic
   * en el enlace para ir a la vista de registro.
   * @param callback Función a ejecutar cuando se solicite ir a registro
   */
  public onBack(callback: () => void) {
    this.element.querySelector('#goToRegisterBtn')?.addEventListener('click', callback);
  }

  /**
   * Devuelve el elemento HTML de esta vista para insertarlo en el DOM.
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Configura los event listeners para botones y acciones internas.
   * Valida campos y llama al modelo para login.
   */
  private setupEventListeners() {
    const loginBtn = this.element.querySelector('#loginBtn');
    const facebookLoginBtn = this.element.querySelector('#facebookLoginBtn');

    loginBtn?.addEventListener('click', async () => {
      const email = (this.element.querySelector('#email') as HTMLInputElement).value;
      const password = (this.element.querySelector('#password') as HTMLInputElement).value;

      // Validar campos
      if (!email || !password) {
        alert('Por favor, completa todos los campos');
        return;
      }

      // Intentar login mediante el modelo
      const success = await this.accountModel.login(email, password);
      if (success) {
        // Redirigir o recargar página principal
        window.location.href = '/';
      } else {
        alert('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      }
    });

    facebookLoginBtn?.addEventListener('click', () => {
      console.log('Click en login con Facebook');
      // Inicio de seción con facebook
    });
  }

  /**
   * Devuelve el código HTML que representa esta vista.
   */
  private getHTML(): string {
    return `
      <section class="form-box">
        <h2>Iniciar Sesión</h2>
      
        <div class="input-field">
          <label for="email">Email</label>
          <div class="input-icon">
            <span class="material-symbols-rounded">mail</span>
            <input type="email" id="email" placeholder="Email" required />
          </div>
        </div>
      
        <div class="input-field">
          <label for="password">Contraseña</label>
          <div class="input-icon">
            <span class="material-symbols-rounded">lock</span>
            <input type="password" id="password" placeholder="Contraseña" required />
          </div>
        </div>
      
        <a href="#" class="forgot-link">¿Has olvidado tu contraseña?</a>
      
        <div class="recaptcha-container">
          <div class="recaptcha-box">
            <input type="checkbox" id="robot" />
            <label for="robot">No soy un robot</label>
            <div class="recaptcha-logo">
              <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" width="24" />
            </div>
          </div>
          <div class="recaptcha-terms">
            <small>reCAPTCHA</small>
            <small><a href="#">Privacidad</a> - <a href="#">Términos</a></small>
          </div>
        </div>
      
        <button id="loginBtn" class="btn green">Accede</button>
        <button id="facebookLoginBtn" class="btn blue">Accede con Facebook</button>
        
        <div class="form-footer">
          <p>¿No tienes cuenta? <a href="#" id="goToRegisterBtn">Crear nueva cuenta</a></p>
        </div>
      </section>
    `;
  }
}

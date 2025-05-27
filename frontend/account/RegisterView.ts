import { AccountModel } from './AccountModel';

export class RegisterView {
  private element: HTMLElement;
  private accountModel: AccountModel;

  /**
   * Constructor que crea la vista de registro y configura eventos.
   * @param accountModel Instancia del modelo para manejar registro
   */
  constructor(accountModel: AccountModel) {
    this.accountModel = accountModel;
    const template = document.createElement('template');
    template.innerHTML = this.getHTML().trim();
    this.element = template.content.firstElementChild as HTMLElement;
    this.setupEventListeners();
  }

  /**
   * Permite registrar un callback que se ejecuta al hacer clic
   * en el enlace para ir a la vista de login.
   * @param callback Función a ejecutar cuando se solicite ir a login
   */
  public onBack(callback: () => void) {
    this.element.querySelector('#goToLoginBtn')?.addEventListener('click', callback);
  }

  /**
   * Devuelve el elemento HTML que contiene la vista para insertarlo en el DOM.
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Configura los event listeners para el botón crear cuenta y login Facebook.
   * Realiza validaciones básicas antes de llamar al modelo para registrar usuario.
   */
  private setupEventListeners() {
    const createAccountBtn = this.element.querySelector('#createAccountBtn');
    const facebookLoginBtn = this.element.querySelector('#facebookLoginBtn');

    createAccountBtn?.addEventListener('click', async () => {
      const nombre = (this.element.querySelector('#nombre') as HTMLInputElement).value;
      const apellidos = (this.element.querySelector('#apellidos') as HTMLInputElement).value;
      const email = (this.element.querySelector('#email') as HTMLInputElement).value;
      const password = (this.element.querySelector('#password') as HTMLInputElement).value;
      const repeatPassword = (this.element.querySelector('#repeatPassword') as HTMLInputElement).value;

      // Validar que todos los campos estén completos
      if (!nombre || !apellidos || !email || !password || !repeatPassword) {
        alert('Por favor, completa todos los campos');
        return;
      }

      // Validar que las contraseñas coincidan
      if (password !== repeatPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      // Validar fortaleza de la contraseña (al menos una mayúscula y un número)
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
      if (!passwordRegex.test(password)) {
        alert('La contraseña debe contener al menos una mayúscula y un número');
        return;
      }

      // Llamar al modelo para registrar usuario
      const success = await this.accountModel.register({ nombre, apellidos, email, password });
      if (success) {
        // Redirigir o refrescar la página principal
        window.location.href = '/';
      } else {
        alert('Error al registrar usuario. Por favor, inténtalo de nuevo.');
      }
    });

    facebookLoginBtn?.addEventListener('click', () => {
      console.log('Click en login con Facebook');
      // Lógica para login con Facebook si es necesario
    });
  }

  /**
   * Devuelve el código HTML que representa la vista de registro.
   */
  private getHTML(): string {
    return `
      <section class="form-box">
        <h2>Crear nueva cuenta</h2>

        <div class="input-field">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" placeholder="Nombre" required />
        </div>

        <div class="input-field">
          <label for="apellidos">Apellidos</label>
          <input type="text" id="apellidos" placeholder="Apellidos" required />
        </div>

        <h3>Información de inicio de sesión</h3>

        <div class="input-field">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="Email" required />
        </div>

        <div class="input-field">
          <label for="password">Contraseña</label>
          <input type="password" id="password" placeholder="Contraseña" required />
        </div>
        <small class="password-requirements">La contraseña debe contener al menos una mayúscula y un número.</small>

        <div class="input-field">
          <label for="repeatPassword">Repetir contraseña</label>
          <input type="password" id="repeatPassword" placeholder="Repetir contraseña" required />
        </div>

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

        <button id="createAccountBtn" class="btn green">Crear cuenta</button>
        <button id="facebookLoginBtn" class="btn blue">Accede con Facebook</button>

        <div class="form-footer">
          <p>¿Ya tienes cuenta? <a href="#" id="goToLoginBtn">Iniciar sesión</a></p>
        </div>
      </section>
    `;
  }
}

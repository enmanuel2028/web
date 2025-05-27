import { AccountModel } from './AccountModel';
import { LoginView } from './LoginView';
import { RegisterView } from './RegisterView';

export class AccountController {
  private container: HTMLElement;
  private accountModel: AccountModel;
  private loginView: LoginView | null = null;
  private registerView: RegisterView | null = null;
  private backCallback: (() => void) | null = null;

  /**
   * Constructor que recibe el contenedor donde se mostrarán las vistas relacionadas con cuenta.
   * @param container Elemento HTML donde se renderizarán vistas de login, registro, perfil, etc.
   */
  constructor(container: HTMLElement) {
    this.container = container;
    this.accountModel = new AccountModel();
    this.updateAuthUI();
  }

  /**
   * Permite definir una función que se llamará para regresar a la vista anterior o hacer navegación.
   * @param callback Función a ejecutar cuando se quiera "volver atrás"
   */
  public onBack(callback: () => void) {
    this.backCallback = callback;
  }

  /**
   * Muestra la vista de Login.
   * También configura el botón "volver atrás" que puede regresar a una vista previa o a registro.
   */
  public showLogin() {
    this.loginView = new LoginView(this.accountModel);
    this.loginView.onBack(() => {
      if (this.backCallback) {
        this.backCallback();
      } else {
        this.showRegister();
      }
    });

    this.container.innerHTML = '';
    this.container.appendChild(this.loginView.getElement());
  }

  /**
   * Muestra la vista de Registro.
   * Configura el botón "volver atrás" para regresar a login o a la vista anterior.
   */
  public showRegister() {
    this.registerView = new RegisterView(this.accountModel);
    this.registerView.onBack(() => {
      if (this.backCallback) {
        this.backCallback();
      } else {
        this.showLogin();
      }
    });

    this.container.innerHTML = '';
    this.container.appendChild(this.registerView.getElement());
  }

  /**
   * Muestra la vista de perfil del usuario si está logueado.
   * Si no está logueado muestra mensaje y botón para ir a login.
   */
  showProfile() {
    console.log('Mostrando página de perfil');
    this.container.innerHTML = '';

    const profileElement = document.createElement('div');
    profileElement.className = 'profile-container';

    const userData = this.accountModel.getUserData();

    if (userData) {
      profileElement.innerHTML = `
        <h2>Mi Perfil</h2>
        <div class="profile-info">
          <div class="profile-field">
            <label>Nombre:</label>
            <span>${userData.nombre || 'No disponible'}</span>
          </div>
          <div class="profile-field">
            <label>Email:</label>
            <span>${userData.email || 'No disponible'}</span>
          </div>
          <div class="profile-field">
            <label>Teléfono:</label>
            <span>${userData.telefono || 'No disponible'}</span>
          </div>
          <div class="profile-field">
            <label>Dirección:</label>
            <span>${userData.direccion || 'No disponible'}</span>
          </div>
        </div>
        <button id="editProfileBtn" class="btn green">Editar Perfil</button>
      `;

      setTimeout(() => {
        const editProfileBtn = profileElement.querySelector('#editProfileBtn');
        editProfileBtn?.addEventListener('click', () => {
          console.log('Click en editar perfil');
          // Aquí puedes implementar la lógica para editar perfil
        });
      }, 0);
    } else {
      profileElement.innerHTML = `
        <div class="not-logged-in">
          <h2>No has iniciado sesión</h2>
          <p>Por favor, inicia sesión para ver tu perfil</p>
          <button id="loginBtn" class="btn green">Iniciar Sesión</button>
        </div>
      `;

      setTimeout(() => {
        const loginBtn = profileElement.querySelector('#loginBtn');
        loginBtn?.addEventListener('click', () => {
          this.showLogin();
        });
      }, 0);
    }

    this.container.appendChild(profileElement);
  }

  /**
   * Muestra la vista de pedidos realizados.
   * Si no hay usuario logueado muestra mensaje y botón para login.
   */
  showOrders() {
    console.log('Mostrando página de pedidos');
    this.container.innerHTML = '';

    const ordersElement = document.createElement('div');
    ordersElement.className = 'orders-container';

    const userData = this.accountModel.getUserData();

    if (userData) {
      ordersElement.innerHTML = `
        <h2>Mis Pedidos</h2>
        <div class="orders-list">
          <div class="no-orders">
            <p>No tienes pedidos recientes</p>
            <button id="shopNowBtn" class="btn green">Comprar Ahora</button>
          </div>
        </div>
      `;

      setTimeout(() => {
        const shopNowBtn = ordersElement.querySelector('#shopNowBtn');
        shopNowBtn?.addEventListener('click', () => {
          if (this.backCallback) {
            this.backCallback();
          }
        });
      }, 0);
    } else {
      ordersElement.innerHTML = `
        <div class="not-logged-in">
          <h2>No has iniciado sesión</h2>
          <p>Por favor, inicia sesión para ver tus pedidos</p>
          <button id="loginBtn" class="btn green">Iniciar Sesión</button>
        </div>
      `;

      setTimeout(() => {
        const loginBtn = ordersElement.querySelector('#loginBtn');
        loginBtn?.addEventListener('click', () => {
          this.showLogin();
        });
      }, 0);
    }

    this.container.appendChild(ordersElement);
  }

  /**
   * Ejecuta el cierre de sesión, actualiza UI y maneja errores.
   */
  async logout() {
    try {
      await this.accountModel.logout();
      this.updateAuthUI();
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Actualiza la interfaz de usuario según el estado de autenticación actual.
   * Muestra u oculta elementos del menú de cuenta y actualiza el texto del botón.
   */
  private updateAuthUI() {
    const isLoggedIn = this.accountModel.isLoggedIn();
    const userData = this.accountModel.getUserData();

    const accountDropdown = document.getElementById('accountDropdown');
    if (accountDropdown) {
      const loginItem = accountDropdown.querySelector('[data-action="login"]');
      const registerItem = accountDropdown.querySelector('[data-action="register"]');
      const logoutItem = accountDropdown.querySelector('[data-action="logout"]');

      if (loginItem && registerItem && logoutItem) {
        if (isLoggedIn) {
          loginItem.classList.add('hidden');
          registerItem.classList.add('hidden');
          logoutItem.classList.remove('hidden');
        } else {
          loginItem.classList.remove('hidden');
          registerItem.classList.remove('hidden');
          logoutItem.classList.add('hidden');
        }
      }
    }

    const accountBtn = document.querySelector('#accountBtn .nav-text');
    if (accountBtn && isLoggedIn && userData) {
      accountBtn.textContent = userData.nombre || 'Mi cuenta';
    }
  }
}

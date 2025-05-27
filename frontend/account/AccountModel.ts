import { ApiService } from '../services/ApiService';

export class AccountModel {
  private isAuthenticated: boolean = false; // Estado de autenticación del usuario
  private userData: any = null;              // Datos del usuario logueado

  /**
   * Constructor que verifica si ya hay sesión iniciada
   * leyendo token y datos del usuario del localStorage.
   */
  constructor() {
    this.checkAuthStatus();
  }

  /**
   * Verifica el estado de autenticación leyendo tokens y datos en localStorage.
   * Si hay token pero no datos, intenta obtener perfil del usuario desde API.
   */
  private checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.isAuthenticated = true;
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          this.userData = JSON.parse(userData);
        } else {
          // Si no hay datos, obtener perfil del usuario
          this.fetchUserProfile();
        }
      } catch (error) {
        console.error('Error al parsear datos de usuario:', error);
      }
    }
  }

  /**
   * Obtiene el perfil del usuario desde la API y actualiza el almacenamiento local.
   */
  private async fetchUserProfile() {
    try {
      const userData = await ApiService.get('/api/usuario/profile');
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
        this.userData = userData;
      }
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      // Si falla, puede que el token sea inválido, cerrar sesión
      this.logout();
    }
  }

  /**
   * Realiza el login con email y contraseña, guarda tokens y datos.
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns true si login exitoso, false si falla
   */
  public async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await ApiService.post('/api/usuario/login', { email, password });
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        localStorage.setItem('userData', JSON.stringify(response.user));
        this.isAuthenticated = true;
        this.userData = response.user;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  /**
   * Registra un nuevo usuario, guarda tokens y datos si es exitoso.
   * @param data Objeto con nombre, apellidos, email y password
   * @returns true si registro exitoso, false si falla
   */
  public async register(data: { nombre: string; apellidos: string; email: string; password: string }): Promise<boolean> {
    try {
      const response = await ApiService.post('/api/usuario/registro', data);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        localStorage.setItem('userData', JSON.stringify(response.user));
        this.isAuthenticated = true;
        this.userData = response.user;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  }

  /**
   * Actualiza el perfil del usuario logueado.
   * @param data Datos para actualizar perfil
   * @returns true si la actualización fue exitosa, false si falla
   */
  public async updateProfile(data: any): Promise<boolean> {
    try {
      if (!this.userData || !this.userData.id) return false;
      
      const response = await ApiService.put(`/api/usuario/${this.userData.id}`, data);
      if (response) {
        localStorage.setItem('userData', JSON.stringify(response));
        this.userData = response;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return false;
    }
  }

  /**
   * Cierra sesión, eliminando tokens y datos del almacenamiento local.
   */
  public logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    this.isAuthenticated = false;
    this.userData = null;
  }

  /**
   * Indica si hay un usuario autenticado.
   * @returns true si usuario está logueado, false si no
   */
  public isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Devuelve los datos actuales del usuario logueado.
   */
  public getUserData(): any {
    return this.userData;
  }

  /**
   * Verifica la validez del token actual con el backend.
   * @returns true si token es válido, false si no o error
   */
  public async verifyToken(): Promise<boolean> {
    try {
      const response = await ApiService.get('/verify');
      return !!response.valid;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }
}

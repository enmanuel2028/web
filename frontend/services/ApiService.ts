const API_BASE = 'http://localhost:3001';

export class ApiService {
  /**
   * Realiza una petición GET a la API.
   * @param url Ruta relativa del endpoint (ej: '/usuarios')
   * @returns Respuesta JSON de la API
   */
  public static async get(url: string) {
    return this.request('GET', url);
  }

  /**
   * Realiza una petición POST a la API con un cuerpo JSON.
   * @param url Ruta relativa del endpoint
   * @param body Objeto con los datos a enviar
   * @returns Respuesta JSON de la API
   */
  public static async post(url: string, body: object) {
    return this.request('POST', url, body);
  }

  /**
   * Realiza una petición PUT a la API con un cuerpo JSON.
   * @param url Ruta relativa del endpoint
   * @param body Objeto con los datos a enviar
   * @returns Respuesta JSON de la API
   */
  public static async put(url: string, body: object) {
    return this.request('PUT', url, body);
  }

  /**
   * Realiza una petición DELETE a la API.
   * @param url Ruta relativa del endpoint
   * @returns Respuesta JSON de la API
   */
  public static async delete(url: string) {
    return this.request('DELETE', url);
  }

  /**
   * Método privado que realiza la petición HTTP genérica.
   * Añade headers, maneja el token de autenticación y renueva el token si está expirado.
   * @param method Método HTTP ('GET', 'POST', etc.)
   * @param endpoint Ruta relativa al API_BASE
   * @param body (Opcional) Objeto con datos para el cuerpo de la petición
   * @returns Respuesta JSON de la API
   */
  private static async request(method: string, endpoint: string, body?: object): Promise<any> {
    // Se definen los headers iniciales
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // Permite solicitudes CORS desde cualquier origen
    });

    // Si existe un token de autenticación en localStorage, se añade al header Authorization
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    try {
      // Realiza la petición fetch con los parámetros recibidos
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      // Si el servidor responde con 401 (no autorizado), intenta renovar el token
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Si se renovó el token con éxito, se reintenta la misma petición
          return this.request(method, endpoint, body);
        } else {
          // Si no se pudo renovar, se limpia el token y se lanza error de sesión expirada
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      }

      // Si la respuesta no es exitosa (códigos distintos a 2xx), se extrae el mensaje de error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(errorData.message || 'La solicitud falló');
      }

      // Si todo va bien, se devuelve la respuesta parseada como JSON
      return response.json();
    } catch (error) {
      // Loguea errores en consola y los lanza para que sean manejados externamente
      console.error('Error en la solicitud API:', error);
      throw error;
    }
  }

  /**
   * Método privado que renueva el token de autenticación usando el refresh token almacenado.
   * @returns true si se renovó correctamente el token, false en caso contrario.
   */
  private static async refreshToken(): Promise<boolean> {
    try {
      // Obtiene el refresh token almacenado
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      // Solicita la renovación del token enviando el refresh token
      const response = await fetch(`${API_BASE}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      // Si la respuesta no es exitosa, retorna false
      if (!response.ok) return false;

      // Extrae el nuevo token de la respuesta
      const data = await response.json();
      if (data.token) {
        // Almacena el nuevo token para futuras solicitudes
        localStorage.setItem('authToken', data.token);
        return true;
      }
      return false;
    } catch (error) {
      // En caso de error, muestra en consola y retorna false
      console.error('Error al renovar token:', error);
      return false;
    }
  }
}

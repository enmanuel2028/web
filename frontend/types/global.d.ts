import { NavigationView } from '../navigation/NavigationView';
import { CartController } from '../cart/CartController';
import { NavigationController } from '../navigation/NavigationController';

declare global {
  interface Window {
    navigationView: NavigationView;
    cartController: CartController;
    navigationController: NavigationController;
  }
}
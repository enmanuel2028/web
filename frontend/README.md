# Frontend

This folder contains the frontend code for the Grupo project, organized by feature using the MVC pattern. Each feature (e.g., navigation, products, cart, filters) will have its own subfolder with Model, View, and Controller files in TypeScript. HTML templates are included for rendering, and all styles are stored in the `styles` directory.

## Structure Example

- frontend/
  - navigation/
    - NavigationModel.ts
    - NavigationView.html
    - NavigationController.ts
  - products/
    - ProductModel.ts
    - ProductView.html
    - ProductController.ts
  - cart/
    - CartModel.ts
    - CartView.html
    - CartController.ts
  - styles/
    - main.css

Controllers will be set up to fetch data from the Grupo backend API endpoints.
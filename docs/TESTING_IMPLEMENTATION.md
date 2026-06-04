# Implementación de Pruebas Unitarias

Se ha implementado una suite completa de pruebas unitarias para asegurar la estabilidad del sistema tanto en el frontend como en el backend.

## Cambios Realizados

### Backend (apps/api)
- Se han añadido pruebas para el middleware de autenticación (`middleware.test.ts`).
- Se han añadido pruebas para las rutas de especificaciones (`specs.test.ts`), verificando la obtención y actualización de datos con mocks de Supabase.
- Se ha verificado que las pruebas existentes de autenticación siguen funcionando.

### Frontend (apps/web)
- Se ha configurado **Vitest** como corredor de pruebas.
- Se han instalado las dependencias necesarias: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
- Se ha configurado el entorno de pruebas en `vite.config.ts` y se ha creado un archivo de configuración inicial `src/test/setup.ts`.
- Se han implementado las siguientes pruebas:
  - `api.test.ts`: Verifica la configuración de la instancia de axios.
  - `Modal.test.tsx`: Verifica el renderizado condicional y los eventos de cierre del componente Modal.
  - `ThemeContext.test.tsx`: Verifica el cambio de tema y la persistencia en localStorage.
  - `AuthContext.test.tsx`: Verifica el flujo de login, logout y la recuperación de sesión desde localStorage.
  - `LoginPage.test.tsx`: Verifica las validaciones de formulario (Zod) y la llamada a la API de login.
  - `SpecsPage.test.tsx`: Verifica la carga de datos del usuario, el renderizado de los editores y el guardado de cambios.

## Cómo ejecutar las pruebas

### API
```bash
cd apps/api
npm test
```

### Web
```bash
cd apps/web
npm test
```

## Cambios Sugeridos
1. **Pruebas de Integración (E2E):** Considerar la implementación de Playwright o Cypress para probar flujos completos de usuario (desde login hasta edición de specs) en un entorno real.
2. **Cobertura de Código:** Configurar herramientas de reporte de cobertura (como `c8` o `istanbul`) para identificar áreas del código que aún no tienen pruebas.
3. **CI/CD:** Integrar la ejecución de estas pruebas en el pipeline de despliegue (GitHub Actions o Vercel) para evitar regresiones automáticamente.
4. **Mocking Global de API:** Crear un manejador centralizado para mocks de API (como MSW) para simplificar las pruebas de componentes que realizan peticiones HTTP.

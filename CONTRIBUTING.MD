# Contribuyendo a Productivity App 🤝

¡Gracias por tu interés en colaborar! Este es un proyecto **open source** mantenido por voluntarios.

## 🛣️ Flujo de Trabajo (Git)

Utilizamos un flujo de ramas organizado para mantener la estabilidad del código:

- `main`: Rama de producción (solo código estable).
- `dev`: Rama de desarrollo donde se integran las nuevas funcionalidades.
- **Feature Branches**: Crea una rama para cada cambio (`feature/nombre-de-la-mejora`).

**Pasos para contribuir:**

1. Haz un Fork del proyecto.
2. Crea tu rama de funcionalidad: `git checkout -b feature/mi-mejora`.
3. Realiza tus cambios y asegúrate de que el linter pase.
4. Abre un **Pull Request (PR)** hacia la rama `dev`.

## 💻 Estándares de Código

Para mantener la consistencia, todos los colaboradores deben seguir estas reglas:

- **Formato:** Es obligatorio el uso de `ESLint` y `Prettier` (configurados en el proyecto).
- **Documentación:** Usa `JSDoc/TSDoc` para documentar funciones clave, parámetros y retornos.
- **TypeScript:** Asegúrate de tipar correctamente tus componentes y funciones de lógica.

## 🧪 Pruebas

Antes de enviar un PR, verifica que:

- La lógica de negocio (validaciones de formularios, queries) pase las pruebas unitarias.
- El flujo de autenticación y subida de servicios funcione correctamente.

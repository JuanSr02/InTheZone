# InTheZone 🎯

InTheZone es una aplicación de productividad moderna diseñada para ayudarte a mantener el enfoque y construir mejores hábitos. Combina un temporizador Pomodoro personalizable con seguimiento de hábitos y análisis para aumentar tu productividad.

## ✨ Características

- **Temporizador Pomodoro**: Un temporizador estilo líquido con intervalos de trabajo/descanso personalizables y sonidos.
- **Seguimiento de Hábitos**: Crea y sigue hábitos diarios para construir consistencia.
- **Análisis**: Visualiza tu tiempo de enfoque y rachas de hábitos con gráficos interactivos.
- **Notificaciones**: Sonidos de notificación para eventos del temporizador (inicio, completado, descanso).
- **Diseño Responsivo**: Totalmente optimizado para dispositivos de escritorio y móviles.
- **Modo Oscuro/Claro**: Soporte para cambio de tema sin interrupciones.

## 🛠️ Tecnologías

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes UI**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Gestión de Estado**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Formularios**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Iconos**: [Lucide React](https://lucide.dev/)

## 🚀 Empezando

### Prerrequisitos

- Node.js (v18 o superior)
- npm o pnpm

### Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/lautaro1910/InTheZone.git
   cd InTheZone
   ```

2. Instala las dependencias:

   ```bash
   npm install
   # o
   pnpm install
   ```

3. Configura el entorno (formatos, builds y comprobaciones):

   ```bash
   npm run setup
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador para ver el resultado.

## 📜 Scripts

| Script             | Descripción                                                                         |
| :----------------- | :---------------------------------------------------------------------------------- |
| `npm run dev`      | Inicia el servidor de desarrollo                                                    |
| `npm run build`    | Construye la aplicación para producción                                             |
| `npm run start`    | Inicia el servidor de producción                                                    |
| `npm run lint`     | Ejecuta ESLint para verificar problemas de calidad de código                        |
| `npm run lint:fix` | Ejecuta ESLint y arregla automáticamente problemas solucionables                    |
| `npm run format`   | Formatea el código usando Prettier                                                  |
| `npm run setup`    | Ejecuta una secuencia completa de configuración: install, format, lint, build y dev |
| `npm run validate` | Valida el proyecto (install, format, lint, build)                                   |

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee el [CONTRIBUTING.MD](CONTRIBUTING.MD) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para más detalles.

# InTheZone 🎯

InTheZone is a modern productivity application designed to help you stay focused and build better habits. It combines a customizable Pomodoro timer with habit tracking and analytics to boost your productivity.

## ✨ Features

- **Pomodoro Timer**: A liquid-style timer with customizable work/break intervals and focus sounds.
- **Habit Tracking**: Create and track daily habits to build consistency.
- **Analytics**: Visualize your focus time and habit streaks with interactive charts.
- **Notifications**: sound notifications for timer events (start, complete, break).
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Dark/Light Mode**: Seamless theme switching support.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/lautaro1910/InTheZone.git
   cd InTheZone
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Setup the environment (formats, builds, and checks):

   ```bash
   npm run setup
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Scripts

| Script             | Description                                                       |
| :----------------- | :---------------------------------------------------------------- |
| `npm run dev`      | Starts the development server                                     |
| `npm run build`    | Builds the application for production                             |
| `npm run start`    | Starts the production server                                      |
| `npm run lint`     | Runs ESLint to check for code quality issues                      |
| `npm run lint:fix` | Runs ESLint and fixes automatically fixable issues                |
| `npm run format`   | Formats code using Prettier                                       |
| `npm run setup`    | Runs a full setup sequence: install, format, lint, build, and dev |
| `npm run validate` | Validates the project (install, format, lint, build)              |

## 🤝 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.MD](CONTRIBUTING.MD) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

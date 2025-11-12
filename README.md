# Political Project

A Next.js application built with React and TypeScript for political engagement and civic discourse.

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm (comes with Node.js)

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
political_project/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout component
│   │   ├── page.tsx         # Home page
│   │   ├── globals.css      # Global styles
│   │   └── page.module.css  # Page-specific CSS module
│   └── components/          # React components
│       ├── Header/
│       │   ├── Header.tsx
│       │   └── Header.module.css
│       └── Hero/
│           ├── Hero.tsx
│           └── Hero.module.css
├── public/                  # Static assets
├── .github/                 # GitHub configuration
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **CSS Modules** - Scoped styling
- **ESLint** - Code linting

## Conventions

### Component Structure

Components follow this naming convention:

- Component files: `ComponentName.tsx`
- CSS Module files: `ComponentName.module.css`
- Components are organized in their own directories under `src/components/`

### Styling

- CSS Modules are used for component-specific styles
- Global styles are in `src/app/globals.css`
- Each component has its own `.module.css` file

## Git & Version Control

This project is set up for version control with Git.

### Initialize Git (if not already done):

```bash
git init
git add .
git commit -m "Initial commit: Next.js project setup"
```

### Connect to Remote Repository:

```bash
# Add your remote repository
git remote add origin https://github.com/yourusername/political_project.git

# Push to remote
git branch -M main
git push -u origin main
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

This project is private and not licensed for public use.

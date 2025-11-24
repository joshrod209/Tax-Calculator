# Tax Calculator - Next.js Migration

This project is being migrated from vanilla HTML/CSS/JS to Next.js with TypeScript.

## Current Status

### ✅ Completed
- Next.js project structure initialized
- TypeScript configuration
- Tailwind CSS setup
- App layout and routing
- All calculation logic migrated to TypeScript modules
- All HTML sections converted to React components
- React hooks for state management implemented
- Lucide React icons integrated
- All UI interactions migrated to React state

### 📋 TODO
- Test all functionality thoroughly
- Add any missing features from original implementation

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx             # Main page
│   └── globals.css          # Global styles
├── components/
│   ├── Calculator.tsx       # Main calculator component
│   ├── Header.tsx           # Header component
│   ├── InputSection.tsx     # Input form
│   └── ResultsSection.tsx   # Results display
├── lib/
│   ├── data.ts              # Tax year data (2025, 2026)
│   ├── utils.ts             # Utility functions
│   ├── ira-calculations.ts  # IRA deduction calculations
│   └── tax-calculations.ts  # Main tax calculation engine
├── hooks/
│   └── useTaxCalculator.ts  # React hook for state management
└── script.js                # Original vanilla JS (preserved for reference)
```

## Getting Started

### Install Dependencies

First, fix npm permissions if needed:
```bash
sudo chown -R $(whoami) ~/.npm
```

Then install:
```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Migration Notes

The original `script.js` file (2284 lines) contains:
- Tax calculation logic
- IRA deduction calculations
- Roth IRA eligibility checks
- UI update functions
- Event listeners

These have been migrated to:
- TypeScript modules in `lib/`
- React components in `components/`
- React hooks for state management

## Original Files

The original files (`index.html`, `script.js`, `styles.css`) are preserved for reference.

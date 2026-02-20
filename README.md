# TrendSheet Appraisal Tool

A web-based real estate appraisal adjustment and market analysis tool — the app version of the TrendSheet Excel workbook.

## Features

### 🏠 Subject Property
- Enter all subject property details (site size, GLA, year built, bedrooms, baths, basement, garage, etc.)
- Supports both square feet and acres for site size
- Effective date management for market trend calculations

### 📊 Comparables
- Add up to 9+ comparable sales with full property details
- Toggle comparables on/off for analysis
- MLS number, address, sale/list price, DOM, and all property characteristics

### ⚖️ Sales Comparison Adjustments
- Full adjustment grid matching the 1004/UAD format
- Configurable adjustment rates (GLA $/SF, age $/year, bath/bedroom/garage per unit, lot $/SF)
- Real-time calculation of net adjustment, adjusted price, $/SF, net %, and gross %
- Auto-calculation badges for fields that can be computed

### 📈 Market Trends
- Paste MLS data (tab-delimited) for automatic trend analysis
- Quarterly breakdowns: avg $/SF, avg price, median price, median DOM
- Absorption rate, months of supply, and inventory analysis
- Price distribution chart

### 🎯 Reconciliation
- Weighted value conclusion with customizable comp weights
- Average and median adjusted price indicators
- GLA adjustment analysis (min/max/avg/median $/SF)
- Value range summary

### 📋 MLS Data Import
- Paste tab-delimited MLS export data directly
- Automatic column detection (supports common MLS formats)
- Handles neighborhood and competing market data
- View all imported records with status badges

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
git clone https://github.com/TKMAppraisals/AdjustTool.git
cd AdjustTool
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready for deployment to any static hosting (Vercel, Netlify, GitHub Pages, etc.).

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Auto-deploys on push

### Netlify
1. Push to GitHub  
2. Connect repo in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

## Tech Stack
- **React 18** — UI framework
- **Vite** — Build tool
- **Pure CSS** — No CSS framework dependencies, dark theme

## Roadmap
- [ ] Export adjustment grid to PDF
- [ ] Save/load appraisals (local storage or cloud)
- [ ] Direct MLS API integration
- [ ] 1004MC auto-commentary generation
- [ ] Paired sales analysis module
- [ ] Sensitivity analysis module
- [ ] Below-grade adjustment calculator
- [ ] Effective age calculator
- [ ] Regression analysis
- [ ] Graph/chart exports

## License
Proprietary — TKM Appraisals

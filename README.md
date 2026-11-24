# APERTURE ROW

Vintage camera shop & servicing bench in Berlin. Hand-calibrated rangefinders, TLRs, SLRs, Super 8 and medium format film cameras.

This is an [AI Studio](https://ai.studio) applet built with **Next.js 15**, **React 19**, and **TypeScript**, styled with **Tailwind CSS 4**. It features a 120fps animated hero carousel, a camera catalog with add-to-cart flow, a visit-booking form, and an animated 9-blade aperture iris bench — plus optional Gemini AI capabilities.

---

## Features

- **Animated hero carousel** — scroll-, wheel-, drag-, and keyboard-driven camera rotation with canvas-drawn aperture ring and machining disc
- **Camera catalog** — rangefinder, compact, SLR, TLR, Super 8 cine, and medium format folding cameras with specs, condition, and accessories
- **Add to cart** — animated kit/warranty options, price counter, flying-item arc animation, and toast feedback
- **Visit booking** — condition check / servicing appointment form with booking code
- **Bench iris** — intersection-observed 9-blade aperture iris with f-stop readout and count-up statistics
- **Lightbox** — per-camera photo gallery with full-screen view
- **AI Studio ready** — declared `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` in `metadata.json`; consumes `GEMINI_API_KEY` and `APP_URL` at runtime

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4, class-variance-authority, clsx, tailwind-merge |
| Animations | Framer Motion (motion), canvas 2D |
| Icons | Lucide React |
| Forms | React Hook Form + resolvers |
| Linting | ESLint (eslint-config-next) |
| Deployment target | AI Studio / Cloud Run |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aperture-row

# Install dependencies
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Gemini AI API key (injected by AI Studio from user secrets at runtime) | Yes (for AI features) |
| `APP_URL` | Hosted URL of the applet (injected by AI Studio with the Cloud Run service URL) | Yes (for OAuth callbacks, self-referential links, API endpoints) |

```env
# .env.local
GEMINI_API_KEY="your_gemini_api_key"
APP_URL="http://localhost:3000"
```

> ⚠️ `.env*` is gitignored except `.env.example`. Never commit real secrets.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Scripts

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
npm run clean   # Clean Next.js cache
```

---

## Project Structure

```
aperture-row/
├── .vscode/
│   └── launch.json          # VS Code debugger configurations
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout, fonts, metadata
│   └── page.tsx             # Main page (camera carousel, cart, booking, bench)
├── .env.example             # Example environment variables
├── .eslintrc.json           # ESLint config
├── eslint.config.mjs        # Flat ESLint config
├── metadata.json            # AI Studio applet manifest
├── next.config.ts           # Next.js config
├── next-env.d.ts            # Next.js TypeScript declarations
├── package.json             # Dependencies & scripts
├── postcss.config.mjs       # PostCSS config
├── tsconfig.json            # TypeScript config
└── README.md                # This file
```

---

## VS Code Debugging

A `.vscode/launch.json` is included with the following configurations:

| Configuration | Description |
|---------------|-------------|
| **Next.js: debug server-side** | Launch `npm run dev` with the Node inspector attached (port 9229) |
| **Next.js: debug client-side (Chrome)** | Attach Chrome to `http://localhost:3000` with source maps |
| **Next.js: debug client-side (Edge)** | Same as above, for Microsoft Edge |
| **Node: attach to running process** | Attach to an already-running Node.js process on port 9229 |
| **Next.js: full stack (server + Chrome)** | Compound: launch server + attach Chrome together |
| **Next.js: full stack (server + Edge)** | Compound: launch server + attach Edge together |

Use the **Run and Debug** view (Ctrl+Shift+D) in VS Code to select and start a configuration.

---

## Deployment

This applet is designed to run on **AI Studio** (Google AI Studio) / Cloud Run. AI Studio automatically injects the `GEMINI_API_KEY` and `APP_URL` environment variables at runtime from user secrets and the deployed service URL.

To deploy:

1. Build the app: `npm run build`
2. Deploy to your target platform (e.g., `firebase deploy` or Cloud Run)
3. Ensure `GEMINI_API_KEY` and `APP_URL` are configured in the deployment environment / AI Studio Secrets panel

---

## License

Private project.

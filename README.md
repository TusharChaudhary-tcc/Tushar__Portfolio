# Tushar Chaudhary Portfolio

Personal developer portfolio built with React and Vite. The interface presents the portfolio as a focused, VS Code-inspired workspace with a Midnight Aurora visual theme.

## Technologies

- React 19
- Vite 6
- JavaScript and JSX
- CSS with responsive media queries
- Lucide React and Simple Icons
- Canvas-based technology visualization
- npm with a committed `package-lock.json`

## Features

- Boot and simulated portfolio lock screens
- Responsive virtual-file Explorer and editor tabs
- Home, projects, technology stack, competitive programming, certifications, About, and contact sections
- About profile for an aspiring software developer and second-year ABES Engineering College student
- Responsive certificate Explorer with PDF previews and downloads
- Gmail Compose contact link and copy-email action
- Custom cursor on supported fine-pointer devices
- Midnight Aurora theme with reduced-motion support

## Project structure

```text
.
├── public/
│   ├── certificates/       # Certificate PDFs used by the portfolio
│   └── profile.png         # Public profile image
├── src/
│   ├── components/         # Entry screens, certificate/contact views, and preserved game sources
│   ├── App.jsx             # Portfolio shell and virtual-file navigation
│   ├── index.css           # Theme and responsive styles
│   └── main.jsx            # React entry point
├── amplify.yml             # AWS Amplify Hosting build configuration
├── index.html              # Vite HTML entry point
├── package.json
└── package-lock.json
```

The preserved game components are not imported or rendered by the current portfolio. They remain in `src/components/` for possible future work.

## Local development

Requirements:

- Node.js 18 or newer
- npm 9 or newer

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

## Production build

Create the deployable static site:

```bash
npm run build
```

The generated site is written to `dist/`.

## AWS Amplify Hosting

1. Create or select an Amplify Hosting app.
2. Connect the Git repository and select the intended branch.
3. Use the committed `amplify.yml` build settings:
   - Install: `npm ci`
   - Build: `npm run build`
   - Output directory: `dist`
4. Review the build logs and confirm the generated static site before sharing the public URL.

This application uses virtual-file state rather than a client-side URL router, so no SPA rewrite rule is currently required. If URL-based client routing is introduced later, add an Amplify rewrite from `/<*>` to `/index.html`.

## Environment variables

There are currently no private runtime secrets or backend integrations. `.env.example` contains only a safe public placeholder. Vite variables prefixed with `VITE_` are exposed to browser users and must never contain AWS credentials, private API keys, passwords, or tokens.

If a future public configuration value is needed:

```bash
Copy-Item .env.example .env.local
```

Replace only safe public placeholders. Keep `.env.local` and all other secret-bearing `.env*` files untracked.

## Security notes

- Never commit AWS access keys, secret keys, tokens, passwords, private keys, or database credentials.
- Review `git diff` and `git status` before publishing the repository.
- Do not publish local build output, logs, caches, or editor state.
- The portfolio intentionally contains public profile links, a contact email, profile imagery, and certificate documents. Confirm that each item is appropriate for public display before publishing.
- The current HTML entry point uses the Tailwind CDN for utility classes. It is functional, but production deployments may show the CDN's development-use warning; migrating to a local Tailwind/PostCSS setup can be considered separately.

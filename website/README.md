# AutoPurge Website

Official website for AutoPurge - Automatic History Cleaner Chrome Extension.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Pages

- **Home** (`/`) - Landing page with features and CTA
- **About** (`/about`) - Information about AutoPurge and the team
- **Blog** (`/blog`) - Blog posts and updates
- **Pricing** (`/pricing`) - Pricing plans and comparison
- **Contact** (`/contact`) - Contact form and support information

## Project Structure

```
website/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── blog/              # Blog page
│   ├── contact/           # Contact page
│   ├── pricing/           # Pricing page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Navbar.tsx         # Navigation bar
│   └── Footer.tsx         # Footer
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Development

### Adding a New Page

1. Create a new folder in `app/` directory
2. Add a `page.tsx` file inside the folder
3. Update navigation links in `components/Navbar.tsx`

### Styling

This project uses Tailwind CSS for styling. Customize the theme in `tailwind.config.js`.

## Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables

No environment variables are required for basic functionality. Add them in `.env.local` if needed:

```env
# Example
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

MIT License - see the [LICENSE](../LICENSE) file for details.

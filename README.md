# THY Forum

Turkish Airlines Forum application using Next.js 15 and Supabase.

## Features

- User authentication with Supabase
- Forum topics and discussions
- Comments and likes
- User profiles
- Search functionality
- Admin dashboard for category management
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/UI
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm 9.6.7 or later
- Supabase account

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/yourusername/thy-forum.git
cd thy-forum
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cache settings
CACHE_DURATION=1800
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment to Vercel

### Using Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy the project:

```bash
vercel
```

### Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in the Vercel dashboard
3. Configure your project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CACHE_DURATION`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_SITE_URL`
5. Deploy!

## Project Structure

- `app/` - Next.js 15 App Router
  - `(forum)/` - Forum-related pages
  - `actions/` - Server actions
  - `api/` - API routes
  - `auth/` - Authentication pages
  - `components/` - React components
- `lib/` - Utilities and helpers
  - `supabase/` - Supabase client
  - `actions/` - Server actions
  - `utils/` - Utility functions
- `public/` - Static assets

## Contributing

Please feel free to submit pull requests or issues to improve the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

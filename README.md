# THY Forum

A modern forum application built with React, TypeScript, and Supabase.

## Features

- User authentication with Supabase
- Real-time updates with Supabase Realtime
- Rich text editor with TinyMCE
- Premium features with Stripe integration
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Modern React with hooks

## Prerequisites

- Node.js 18 or later
- Yarn package manager
- Supabase account
- Stripe account (for premium features)
- TinyMCE API key

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/thy-forum.git
   cd thy-forum
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Copy the environment variables:

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your credentials:

   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `VITE_TINYMCE_API_KEY`: Your TinyMCE API key

5. Start the development server:
   ```bash
   yarn dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/     # React components
├── core/          # Core functionality
│   ├── context/   # React context providers
│   └── services/  # External service integrations
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── styles/        # Global styles
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Available Scripts

- `yarn dev`: Start the development server
- `yarn build`: Build the production bundle
- `yarn preview`: Preview the production build
- `yarn lint`: Run ESLint
- `yarn type-check`: Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

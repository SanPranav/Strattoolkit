yes this is chatgpted

# Optix Toolkit

Our comprehensive solution for tracking everything!

1. **Outreach Tracking** - Log and track team member outreach hours, with approval workflows for mentors
2. **Scouting** - Collect data on other teams' robot performance during competitions to help with alliance selection
3. **More Coming Soon!** - Plans for tool management 

## Features

- 📊 **Outreach Management**: Track member hours, event participation, and generate reports
- 🤖 **Robot Scouting**: Customizable forms to collect match and pit scouting data
- 📱 **Mobile Friendly**: Works well on phones and tablets for pit scouting
- 📈 **Data Visualization**: Charts and graphs for analyzing team performance

## Tech Stack

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Backend**: PocketBase (handles auth, API, and database)
- **UI**: Tailwind CSS with shadcn/ui components
- **Database**: SQLite (via PocketBase)

## Quick Start

### Prerequisites

- Bun (recommended) or npm
- Pocketbase

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/optix-toolkit.git
   cd optix-toolkit
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_PB_URL=http://localhost:30090
   ```

4. **Start PocketBase**
   
   Navigate to the PocketBase directory and start the server:
   ```bash
   cd otoolkit-pb
   # On Windows with WSL:
   wsl ./LocalStart.sh
   # Or manually:
   ./pocketbase serve --dir=. --dev
   ```
   
   PocketBase will run on `http://localhost:30090`

5. **Start the development server**
   ```bash
   bun run dev
   # or npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

### First Time Setup

1. Visit `http://localhost:30090/_/` to access PocketBase admin
2. Create an admin account
3. Import the database schema (migrations should run automatically)
4. Create your first user account in the app

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── outreach/       # Outreach tracking pages
│   ├── scouting/       # Robot scouting forms
│   └── auth/           # Authentication pages
├── components/         # Reusable React components
├── lib/               # Utilities and configurations
└── middleware.ts      # Route protection

otoolkit-pb/           # PocketBase configuration
├── pb_data/          # Database files
├── pb_migrations/    # Database migrations
└── pocketbase        # PocketBase binary
```

## Development Commands

```bash
# Start development server with Turbopack
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Lint code
bun run lint

# Start PocketBase (from otoolkit-pb directory)
wsl ./LocalStart.sh
```

## Contributing

We welcome contributions from other FRC teams and developers! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feat/new-feature`)
5. Create a Pull Request

Please follow TypeScript best practices and ensure your code passes linting.

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Attribution Required

If you use this software, please provide attribution by mentioning:
- "Optix Toolkit by FRC Team Optix 3749"
- Include a link back to this repository

## About Team Optix 3749

We are a FIRST Robotics Competition team from Del Norte High School in San Diego, California. This toolkit was built by our students and mentors to help streamline team operations and improve our competitive performance.

## Credits

- **Created by**: FRC Team Optix 3749
- **Main Contributors**: Neel Adem

---

**Questions or Issues?** Open an issue on GitHub or contact our team through our website.
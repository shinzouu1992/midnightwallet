DISCORD_TOKEN=           # Discord bot token
VERIFICATION_CHANNEL_ID= # Channel ID for verification messages
GUILD_ID=               # Discord server ID
VERIFIED_ROLE_ID=       # Role ID to assign after verification
VERIFICATION_SERVER=     # Server URL (e.g. https://midnightpass.click)
```

2. Server directory (`server/.env`):
```env
DISCORD_TOKEN=           # Same Discord bot token as root
VERIFICATION_CHANNEL_ID= # Same channel ID as root
GUILD_ID=               # Same guild ID as root
VERIFIED_ROLE_ID=       # Same role ID as root
VERIFICATION_SERVER=     # Same server URL as root
```

3. Client directory (`client/.env`):
```env
VITE_BOT_API_URL=       # Your API URL (e.g. https://midnightpass.click)
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Run setup check:
```bash
npm run check-setup
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
├── client/             # Frontend React application
├── server/             # Backend Express server + Discord bot
├── shared/             # Shared types and schemas
└── scripts/            # Utility scripts
```

## API Endpoints

- `POST /api/verify/initiate` - Start verification
- `POST /api/verify/complete` - Complete verification
- `GET /api/verify/:discordId` - Check verification status


## Troubleshooting

1. Bot not responding:
   - Check DISCORD_TOKEN is correct
   - Verify bot permissions
   - Ensure bot is in server

2. Role assignment fails:
   - Check VERIFIED_ROLE_ID
   - Verify bot role hierarchy
   - Check bot permissions

## 🏗️ Technical Architecture

### Frontend (`/client`)
```
client/
├── src/
│   ├── pages/           # React page components
│   │   ├── home.tsx     # Wallet installation check
│   │   └── verify.tsx   # Wallet verification flow
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # shadcn/ui components
│   │   └── shared/      # Common components
│   └── lib/            # Utilities and helpers
│       ├── utils.ts    # Helper functions
│       └── types.ts    # TypeScript definitions
```

#### Component Details:
- `home.tsx`: Handles wallet installation check
- `verify.tsx`: Manages verification flow
- `ui/`: Contains shadcn components
- `shared/`: Reusable components
- `lib/`: Utility functions

### Backend (`/server`)
```
server/
├── routes.ts           # API endpoints
├── discord-bot.ts      # Discord bot implementation
└── storage.ts          # Verification storage
```

#### Service Details:
- `routes.ts`: API endpoint definitions
- `discord-bot.ts`: Bot functionality
- `storage.ts`: Data management

### Shared (`/shared`)
```
shared/
└── schema.ts          # Shared types and validation
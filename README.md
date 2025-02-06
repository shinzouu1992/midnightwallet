DISCORD_TOKEN=           # Discord bot token
VERIFICATION_CHANNEL_ID= # Channel ID for verification messages
GUILD_ID=               # Discord server ID
VERIFIED_ROLE_ID=       # Role ID to assign after verification
VERIFICATION_SERVER=     # Server URL (e.g. https://midnightpass.click)
```

## Project Structure

```
├── client/             # Frontend React application
├── server/             # Backend Express server + Discord bot
├── shared/             # Shared types and schemas
└── scripts/            # Utility scripts
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`

3. Start development server:
```bash
npm run dev
```

## Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configurations
- Write comprehensive tests
- Document code changes
- Use conventional commits


## API Endpoints

### POST /api/verify/initiate
Initiates verification process

### POST /api/verify/complete  
Completes verification and assigns role

### GET /api/verify/:discordId
Gets verification status for user


## Security Considerations

- Secure storage of Discord tokens
- Validation of wallet signatures
- Rate limiting on API endpoints
- Proper error handling

## 🔧 Troubleshooting Guide
### Common Issues

1. Wallet Detection Failed
   - Check wallet installation
   - Verify browser compatibility
   - Clear browser cache
   - Restart browser

2. Role Assignment Failed
   - Verify bot permissions
   - Check role hierarchy
   - Confirm server settings
   - Review error logs

3. Verification Timeout
   - Check network connection
   - Verify server status
   - Clear browser cache
   - Try again later

### Error Messages

1. "Wallet Not Found"
   - Install Midnight Lace Wallet
   - Check browser compatibility
   - Enable wallet extension

2. "Connection Failed"
   - Verify network connection
   - Check wallet status
   - Try reconnecting

3. "Role Assignment Failed"
   - Contact server admin
   - Check bot permissions
   - Verify role settings

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
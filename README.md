# Romax Pay - Telegram Mini App for Crypto Payments

## Overview

Romax Pay is a production-ready Telegram Mini App designed to facilitate seamless USDT (TRC20) to Russian Ruble (RUB) payments. It provides a complete ecosystem for cryptocurrency payment processing within the Telegram environment.

### Purpose and Goals
- **Enable USDT-to-RUB Payments**: Allow users to manage USDT balances and create payment requests in RUB
- **Automated Deposit Detection**: Use blockchain scanning to automatically detect and confirm USDT deposits
- **Operator Management**: Provide a complete system for operators to process payment requests
- **Seamless User Experience**: Offer a modern, responsive interface directly within Telegram

### Key Features
- **USDT (TRC20) Payments**: Full support for USDT on TRON blockchain
- **Real-time Exchange Rates**: Automated USD/RUB conversion with 30-minute updates
- **Dual-Bot System**: Separate bots for users and operators
- **Automated Deposit Detection**: Blockchain scanner for automatic deposit confirmation
- **Operator Task Distribution**: Smart assignment system for payment requests
- **Admin Panel**: Comprehensive management interface for users, payments, and operators
- **Neo-Brutalist UI**: Bold, modern design with thick borders and zero border-radius

### Current Status
**Production-Ready Beta** - All core features implemented and tested. The application is fully functional for production use with comprehensive error handling and logging.

---

## Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui (New York variant) component library
- Radix UI primitives
- React Query for server state management
- Wouter for routing

**Backend:**
- Express.js with TypeScript
- Drizzle ORM for type-safe database queries
- Node.js PostgreSQL driver (pg)
- Helmet for security
- CORS and rate limiting
- Express session management

**Database:**
- PostgreSQL (Neon-backed)
- Drizzle ORM with schema migrations
- High-precision numeric types for financial data (18 digits, 8 decimal places)

**Telegram:**
- Telegram WebApp SDK for Mini App integration
- node-telegram-bot-api for bot functionality
- Dual-bot architecture (user bot + operator bot)
- Webhook support for production

**Blockchain:**
- TronWeb for TRON blockchain interaction
- USDT TRC20 contract integration
- Automated transaction scanning
- Event-based deposit detection

### System Components

#### 1. Mini App (Telegram WebApp)

The main user interface accessible through Telegram's WebApp.

**Pages:**
- **Dashboard**: Balance overview, quick actions, exchange rate display
- **TopUp**: USDT deposit interface with QR code and countdown timer
- **Pay**: Payment request creation with RUB-to-USDT conversion
- **History**: Transaction history and request status tracking
- **Support**: Contact information and help resources
- **Settings**: User preferences and account information

**Design System:**
- **Neo-Brutalist Style**: Thick borders (4px), harsh drop shadows, high contrast
- **Zero Border-Radius**: Sharp, geometric shapes throughout
- **Color Palette**: Black, white, vibrant accent colors
- **Typography**: Inter font family with bold weights
- **Desktop Adaptation**: Max-width 430px for Telegram WebApp viewport
- **Mobile-First**: Fully responsive design

**Key Features:**
- Telegram WebApp SDK integration
- Real-time balance updates
- In-app notifications with unread badges
- Russian language interface
- Demo mode for non-Telegram environments

#### 2. Admin Panel (/admin)

Password-protected administrative interface.

**Features:**
- **User Management**: View all users with balances
- **Payment Processing**: Approve/reject payment requests
- **Deposit Management**: Confirm/reject USDT deposits
- **Operator Management**: Create, activate/deactivate operators
- **Balance Adjustment**: Manual balance updates for users
- **Receipt Review**: View payment receipts and attachments

**Authentication:**
- Password-based access (ADMIN_PASSWORD environment variable)
- Session management with 24-hour expiration
- All admin endpoints require password verification

#### 3. Operator Panel (/operator)

Interface for operators to process payment requests.

**Features:**
- **Login System**: Secure operator authentication
- **Task Queue**: View assigned and available payment requests
- **Online/Offline Toggle**: Control availability for new tasks
- **Payment Processing**: Mark payments as completed
- **Request Filtering**: Filter by status and urgency

**Task Assignment:**
- Only online operators receive new tasks
- First-come-first-served assignment
- Request locking to prevent double processing
- Bidirectional sync with Telegram bot

#### 4. User Bot (BOT_TOKEN)

Main Telegram bot for user interactions.

**Commands:**
- `/start` - Open Mini App and register user

**Features:**
- User authentication via initData validation
- Automatic user registration
- chatId storage for notifications
- WebApp launch button
- Menu button configuration
- Push notifications for:
  - Deposit confirmations
  - Deposit rejections
  - Payment request updates
  - Balance changes

#### 5. Operator Bot (BOT_OPER_TOKEN)

Dedicated bot for operator management.

**Features:**
- Operator login via Telegram
- Online/Offline status toggle
- Real-time payment request notifications
- "Взять в работу" (Take to Work) inline buttons
- Task assignment confirmation
- Automatic task distribution to online operators

**Notification Types:**
- New payment requests (urgent/normal)
- Task assignment confirmations
- Status updates

---

## Payment Flow

### User Deposit Flow

1. **User Initiates Deposit**
   - User navigates to TopUp page
   - Enters desired USDT amount (30-20,000 USDT)
   - Clicks "Пополнить" (Top Up)

2. **Duplicate Check**
   - System checks for active deposits with same amount
   - If duplicate found, suggests decimal variation (±0.01-0.05 USDT)
   - Example: 100.00 → 99.97 or 100.03

3. **Unique Amount Generation**
   - System generates unique payable amount using `generateUniquePayableAmount()`
   - Ensures no collisions with active deposits
   - Stores requestedAmount and payableAmount separately

4. **Deposit Creation**
   - Creates deposit record with:
     - Unique payable amount (e.g., 99.97 USDT)
     - Master wallet address: THVyqrSDMBvpibitvTt4xJFWxVgY61acLu
     - 10-minute expiration timer
     - Status: 'pending'
   - Displays QR code and wallet address
   - Shows countdown timer

5. **User Sends USDT**
   - User scans QR code or copies wallet address
   - Sends exact payable amount to master wallet
   - Transaction broadcasts to TRON network

6. **Blockchain Detection**
   - Scanner polls TRON network every 15 seconds
   - Detects Transfer events to master wallet
   - Matches transaction amount to pending deposits
   - Updates deposit with txHash

7. **Admin Approval** (Manual Step)
   - Admin views pending deposit in admin panel
   - Reviews transaction details
   - Clicks "Подтвердить" (Confirm) or "Отклонить" (Reject)

8. **Balance Update**
   - On confirmation:
     - User's availableBalance += requestedAmount
     - Deposit status → 'confirmed'
     - In-app notification created
     - Telegram push notification sent
   - On rejection:
     - Deposit status → 'rejected'
     - Notification with reason sent

9. **User Notification**
   - User receives notification in Mini App
   - Telegram push notification arrives
   - Balance updates in real-time

### Payment Request Flow

1. **User Creates Payment Request**
   - User navigates to Pay page
   - Enters amount in RUB
   - System converts to USDT using current exchange rate
   - Selects urgency (normal/urgent)
   - Urgent adds 10% fee
   - Adds optional attachments/comments
   - Clicks "Создать заявку" (Create Request)

2. **Balance Validation**
   - System checks if availableBalance >= amountUsdt
   - If insufficient, shows error
   - If sufficient, freezes USDT amount:
     - availableBalance -= amountUsdt
     - frozenBalance += amountUsdt

3. **Request Creation**
   - Creates payment_request record with:
     - amountRub (requested RUB amount)
     - amountUsdt (converted USDT amount)
     - frozenRate (exchange rate at creation time)
     - urgency ('normal' or 'urgent')
     - hasUrgentFee (1 or 0)
     - status ('submitted')
   - Returns request ID to user

4. **Operator Notification**
   - System queries all online operators
   - Sends Telegram notification to each via Operator Bot
   - Notification includes:
     - Request ID
     - Amount in RUB and USDT
     - Urgency indicator
     - "Взять в работу" (Take to Work) inline button

5. **Task Assignment**
   - First operator clicks "Взять в работу"
   - System assigns request:
     - assignedOperatorId = operator.id
     - Operator receives confirmation
   - Other operators see "Заявка передана" (Request assigned)
   - Request locked to assigned operator

6. **Operator Processes Payment**
   - Operator transfers RUB to user via bank
   - Operator uploads receipt in operator panel
   - Operator marks payment as processed

7. **Admin Final Approval**
   - Admin reviews operator's work
   - Checks receipt and details
   - Clicks "Оплатить" (Mark as Paid) or "Отклонить" (Reject)
   - Can add admin comments

8. **Request Completion**
   - On approval:
     - Request status → 'paid'
     - frozenBalance -= amountUsdt
     - Notification sent to user
   - On rejection:
     - Request status → 'rejected'
     - frozenBalance -= amountUsdt
     - availableBalance += amountUsdt (refund)
     - Notification with reason sent

9. **User Notification**
   - User receives in-app notification
   - Telegram push notification
   - Request appears in History with final status

---

## Database Schema

### users
Stores user account information and balances.

```sql
id: varchar (UUID, primary key)
telegramId: text (unique, Telegram user ID)
username: text (Telegram username)
chatId: text (Telegram chat ID for notifications)
availableBalance: numeric(18,8) (USDT balance available for use)
frozenBalance: numeric(18,8) (USDT balance locked in pending requests)
registeredAt: timestamp (account creation time)
```

### payment_requests
Stores all payment requests from users.

```sql
id: varchar (UUID, primary key)
userId: varchar (foreign key to users.id)
amountRub: numeric(18,2) (requested amount in Russian Rubles)
amountUsdt: numeric(18,8) (converted USDT amount)
frozenRate: numeric(18,2) (USD/RUB exchange rate at creation)
urgency: text ('normal' or 'urgent')
hasUrgentFee: integer (0 or 1, whether 10% urgent fee applied)
attachments: jsonb (array of attachment objects)
comment: text (user comment)
status: text ('submitted', 'processing', 'paid', 'rejected', 'cancelled')
receipt: jsonb (operator upload, admin view only)
adminComment: text (admin notes)
assignedOperatorId: varchar (foreign key to operators.id)
createdAt: timestamp (request creation time)
```

### deposits
Stores USDT deposit requests and confirmations.

```sql
id: varchar (UUID, primary key)
userId: varchar (foreign key to users.id)
amount: numeric(18,8) (actual deposited amount)
requestedAmount: numeric(18,8) (amount user requested)
payableAmount: numeric(18,8) (unique amount user must send)
walletAddress: text (master wallet address)
expiresAt: timestamp (10 minutes from creation)
status: text ('pending', 'confirmed', 'rejected', 'expired')
txHash: text (TRON transaction hash)
createdAt: timestamp (deposit creation time)
confirmedAt: timestamp (confirmation time)
confirmedBy: varchar (admin who confirmed)
```

### notifications
Stores in-app notifications for users.

```sql
id: varchar (UUID, primary key)
userId: varchar (foreign key to users.id)
requestId: varchar (optional, related payment request)
type: text (notification type)
message: text (notification message in Russian)
metadata: jsonb (additional data)
isRead: integer (0 or 1)
createdAt: timestamp (notification time)
```

### operators
Stores operator accounts for payment processing.

```sql
id: varchar (UUID, primary key)
login: text (unique, operator username)
passwordHash: text (bcrypt hash)
salt: varchar(64) (password salt)
isActive: integer (0 or 1, account enabled)
isOnline: integer (0 or 1, available for tasks)
lastActivityAt: timestamp (last action time)
chatId: text (Telegram chat ID for notifications)
createdAt: timestamp (account creation time)
```

### tron_scan_state
Stores blockchain scanner state.

```sql
id: varchar (UUID, primary key)
lastProcessedBlockNumber: text (last scanned block)
lastProcessedTimestamp: timestamp (timestamp of last block)
lastSuccessfulScan: timestamp (last successful scan)
updatedAt: timestamp (state update time)
```

---

## Key Features

### 2-Decimal Formatting

All USDT amounts displayed to users use exactly 2 decimal places for consistency and clarity.

**Implementation:**
- **Frontend**: `formatUsdt()` utility in `client/src/lib/utils.ts`
- **Backend**: Stores full 8-decimal precision, formats on output
- **Bot Messages**: All amounts formatted to 2 decimals

**Usage:**
```typescript
// Frontend
import { formatUsdt } from '@/lib/utils';
const displayAmount = formatUsdt(99.97123456); // "99.97"

// Backend stores as: "99.97123456" (numeric 18,8)
// Displays as: "99.97"
```

**Examples:**
- `99.97123456` → displayed as `"99.97"`
- `85.31` → displayed as `"85.31"`
- `0.00000001` → displayed as `"0.00"`

### Notification System

Dual notification system combining in-app and Telegram push notifications.

**In-App Notifications:**
- Stored in `notifications` table
- Displayed in notification sheet (bell icon)
- Unread count badge
- Mark as read functionality
- Clickable to view related payment request

**Telegram Push Notifications:**
- Sent via User Bot using `sendNotificationToUser()`
- Requires valid chatId stored in user record
- Formatted with HTML parse mode
- Non-blocking (failures don't break flow)

**Notification Events:**
- Deposit confirmed
- Deposit rejected
- Deposit expired
- Payment request approved
- Payment request rejected
- Payment request cancelled
- Balance updated
- Status changes

**Example Flow:**
```typescript
// Backend creates notification
await storage.createNotification({
  userId: user.id,
  message: `Пополнение на ${formatUsdt(amount)} USDT подтверждено`,
  isRead: 0,
});

// Also sends Telegram push
await sendNotificationToUser(
  user.chatId,
  `✅ Пополнение на ${formatUsdt(amount)} USDT подтверждено`
);
```

### Online/Offline Status

Operators can control their availability for receiving new payment requests.

**Status Management:**
- **Online (isOnline = 1)**: Receives new payment request notifications
- **Offline (isOnline = 0)**: Does not receive new notifications

**Toggle Methods:**
1. **Via Telegram Bot**:
   - Operator sends message to Operator Bot
   - Bot provides inline keyboard with Online/Offline buttons
   - Status updates in database

2. **Via Web Panel**:
   - Operator uses toggle switch in operator panel
   - API call updates status
   - Bot receives sync update

**Bidirectional Sync:**
- Status change in bot → updates database → reflects in web panel
- Status change in web panel → updates database → bot knows status
- Real-time updates across all interfaces

**Task Distribution Logic:**
```typescript
// Only online operators receive notifications
const onlineOperators = await storage.getOnlineOperators();
for (const operator of onlineOperators) {
  await sendOperatorNotification(operator, paymentRequest);
}
```

### Duplicate Protection

Prevents multiple active deposits with the same USDT amount to ensure accurate blockchain detection.

**Problem:** If two users deposit 100.00 USDT simultaneously, the blockchain scanner cannot determine which transaction belongs to which user.

**Solution:** Generate unique payable amounts with small variations.

**Algorithm:**
1. User requests amount (e.g., 100.00 USDT)
2. System checks for active deposits with same amount
3. If unique, use requested amount as payable amount
4. If duplicate, generate variation:
   - Try subtracting 0.01 USDT → 99.99
   - Try adding 0.01 USDT → 100.01
   - Continue with ±0.02, ±0.03, up to ±0.05
   - Return first unique amount found

**Implementation:**
```typescript
// server/services/depositUniqueness.ts
export async function generateUniquePayableAmount(requestedAmount: number): Promise<number> {
  const activeDeposits = await storage.getActiveDeposits();
  const usedAmounts = new Set(activeDeposits.map(d => d.payableAmount));
  
  if (!usedAmounts.has(requestedAmount)) {
    return requestedAmount;
  }
  
  // Try variations ±0.01 to ±0.05
  for (let delta = 0.01; delta <= 0.05; delta += 0.01) {
    if (!usedAmounts.has(requestedAmount - delta)) {
      return requestedAmount - delta;
    }
    if (!usedAmounts.has(requestedAmount + delta)) {
      return requestedAmount + delta;
    }
  }
  
  throw new Error('Unable to generate unique amount');
}
```

**User Experience:**
- Requested: 100.00 USDT
- Payable: 99.97 USDT (unique variation)
- User deposits exactly 99.97 USDT
- System matches transaction to deposit
- User receives 100.00 USDT in balance (requested amount)

---

## API Endpoints

### User Endpoints

**POST /api/user/auth**
- Authenticate user via Telegram initData
- Creates user if not exists
- Returns user object with balances

**GET /api/user/:userId/balance**
- Get user balance information
- Returns availableBalance and frozenBalance

### Payment Request Endpoints

**GET /api/payments/user/:userId**
- Get all payment requests for user
- Returns array of payment request objects

**GET /api/payments/:requestId**
- Get single payment request details
- Returns payment request object

**POST /api/payments/create**
- Create new payment request
- Body: `{ userId, amountRub, urgency, attachments, comment }`
- Returns created payment request

**PATCH /api/payments/:requestId/status**
- Update payment request status
- Body: `{ status }`

### Deposit Endpoints

**POST /api/deposits/create-automated**
- Create automated deposit with unique amount
- Body: `{ userId, requestedAmount }`
- Returns deposit with payableAmount and wallet address

**POST /api/deposits/create**
- Create manual deposit
- Body: `{ userId, amount, txHash }`

**GET /api/deposits/user/:userId**
- Get user deposit history
- Returns array of deposit objects

### Notification Endpoints

**GET /api/notifications/user/:userId**
- Get user notifications
- Returns array of notification objects

**GET /api/notifications/user/:userId/unread-count**
- Get count of unread notifications
- Returns: `{ count: number }`

**PATCH /api/notifications/:notificationId/read**
- Mark notification as read
- Returns: `{ success: true }`

### Exchange Rate Endpoint

**GET /api/exchange-rate**
- Get current USD/RUB exchange rate
- Returns: `{ rate: number, timestamp: string, source: string }`

### Admin Endpoints

All admin endpoints require `password` query parameter or in body.

**POST /api/admin/login**
- Verify admin password
- Body: `{ password }`

**GET /api/admin/users?password=xxx**
- Get all users with balances

**GET /api/admin/payments?password=xxx**
- Get all payment requests
- Optional filters: status, userId, urgency

**GET /api/admin/payments/:id?password=xxx**
- Get payment request details for admin

**POST /api/admin/user/:userId/balance**
- Update user balance manually
- Body: `{ password, amount, type: 'add' | 'subtract' }`

**POST /api/admin/deposits/:depositId/confirm**
- Confirm pending deposit
- Body: `{ password }`

**POST /api/admin/deposits/:depositId/reject**
- Reject pending deposit
- Body: `{ password, reason }`

**PATCH /api/admin/payments/:id/process**
- Process payment request (mark as paid/rejected)
- Body: `{ password, status, adminComment }`

**GET /api/admin/operators?password=xxx**
- Get all operators

**POST /api/admin/operators**
- Create new operator
- Body: `{ password, login, operatorPassword }`

**PATCH /api/admin/operators/:id/status**
- Activate/deactivate operator
- Body: `{ password, isActive }`

**PATCH /api/admin/operators/:id/online-status**
- Change operator online status
- Body: `{ password, isOnline }`

**DELETE /api/admin/operators/:id**
- Delete operator account
- Body: `{ password }`

### Operator Endpoints

**POST /api/operator/login**
- Operator login
- Body: `{ login, password }`
- Returns operator object and sets session

**GET /api/operator/:operatorId/payments**
- Get payment requests for operator
- Requires operator session
- Query params: status

**PATCH /api/operator/:operatorId/payments/:requestId/process**
- Process payment request
- Requires operator session
- Body: `{ action: 'complete' | 'reject' }`

**PATCH /api/operator/:operatorId/online-status**
- Update operator online status
- Requires operator session
- Body: `{ isOnline: boolean }`

### Telegram Webhook Endpoints

**POST /telegram/webhook**
- Receive Telegram bot updates
- Handles /start command, callback queries

**GET /telegram/webhook**
- Verify webhook configuration
- Returns webhook info

---

## Environment Variables

### Required

**DATABASE_URL**
- PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database`
- Provided automatically by Replit's PostgreSQL integration

**BOT_TOKEN**
- Main user bot token from @BotFather
- Format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
- Used for user authentication and notifications

**BOT_OPER_TOKEN**
- Operator bot token from @BotFather
- Separate bot for operator management
- Format: Same as BOT_TOKEN

**ADMIN_PASSWORD**
- Password for admin panel access
- Recommended: Strong, random password
- Example: `MySecureAdm1nP@ssw0rd!`

### Optional

**MASTER_WALLET_ADDRESS**
- TRON TRC20 wallet address for deposits
- Default: `THVyqrSDMBvpibitvTt4xJFWxVgY61acLu`
- Must be valid TRON address (34 characters, starts with 'T')

**USDT_CONTRACT_ADDRESS**
- USDT TRC20 contract address
- Default: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` (official USDT)
- Do not change unless using testnet

**TRONGRID_API_KEY**
- TronGrid API key for higher rate limits
- Optional but recommended for production
- Get from: https://www.trongrid.io/

**WEBAPP_URL**
- URL of the Mini App
- Auto-detected from REPLIT_DOMAINS in production
- Override if using custom domain

**SESSION_SECRET**
- Secret for session encryption
- Auto-generated if not provided
- Recommended: Set for production

**NODE_ENV**
- Environment mode: `development` or `production`
- Affects logging, CORS, rate limiting

### Example .env File

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Telegram Bots
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_OPER_TOKEN=0987654321:ZYXwvuTSRqponMLKJIhgfeDCBA

# Admin
ADMIN_PASSWORD=SuperSecurePassword123!

# TRON Blockchain
MASTER_WALLET_ADDRESS=THVyqrSDMBvpibitvTt4xJFWxVgY61acLu
TRONGRID_API_KEY=your-api-key-here

# Optional
SESSION_SECRET=random-secret-key
NODE_ENV=production
```

---

## Deployment

### Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   ```bash
   npm run db:push
   ```
   This applies the database schema from `shared/schema.ts`.

3. **Configure Environment Variables**
   - Set required environment variables in Replit Secrets or `.env` file
   - At minimum: DATABASE_URL, BOT_TOKEN, BOT_OPER_TOKEN, ADMIN_PASSWORD

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server runs on port 5000 (http://localhost:5000)

5. **Access the Application**
   - Mini App: https://your-repl.replit.dev
   - Admin Panel: https://your-repl.replit.dev/admin
   - Operator Panel: https://your-repl.replit.dev/operator

### Production

1. **Build the Application**
   ```bash
   npm run build
   ```
   This:
   - Builds frontend with Vite → `dist/client`
   - Bundles backend with esbuild → `dist/index.js`

2. **Start Production Server**
   ```bash
   npm start
   ```
   Runs the bundled server on port 5000

3. **Set Up Telegram Webhook**
   - Webhook is automatically configured in production
   - Uses REPLIT_DOMAINS environment variable
   - Webhook URL: `https://your-domain.replit.dev/telegram/webhook`

4. **Verify Deployment**
   - Check health endpoint: `https://your-domain.replit.dev/health`
   - Verify webhook: `https://your-domain.replit.dev/telegram/webhook` (GET)
   - Test Mini App through Telegram bot

### Database Migrations

After pulling code changes, you must apply database schema migrations to update your database with new columns and tables.

**Apply Schema Changes:**
```bash
npm run db:push
```

**Force Apply (Skip Warnings):**
```bash
npm run db:push -- --force
```

**Current Migrations:**
This applies all pending migrations including:
- `0001_purple_ben_parker.sql` - Adds `fullName` and `avatarUrl` columns to `users` table

**For Production Deployments:**
1. Stop the application
2. Run `npm run db:push -- --force`
3. Restart the application

**Development Migration Workflow:**
1. Edit `shared/schema.ts` with new schema
2. Run `npm run db:push` to apply changes
3. Verify changes in database
4. Update storage.ts with new methods
5. Update controllers and frontend

**Important Notes:**
- Drizzle Kit compares schema.ts with actual database
- Shows warnings for destructive changes
- Use `--force` only if you understand the impact
- Always backup database before major migrations

### Environment-Specific Configuration

**Development:**
- CORS: Allow all origins (`*`)
- Rate Limit: 1000 requests/15 minutes
- Logging: Verbose console output
- Hot Module Replacement (HMR)
- Telegram: Polling mode (no webhook)

**Production:**
- CORS: Only Telegram and REPLIT_DOMAINS
- Rate Limit: 100 requests/15 minutes
- Logging: Structured, minimal
- Telegram: Webhook mode
- Security: Helmet headers, secure cookies

---

## Testing

### Test Framework

Romax Pay uses **Vitest** for testing with **happy-dom** for DOM emulation. The test suite covers critical functionality across frontend, backend, and integration layers.

### Test Structure

```
tests/
├── frontend/          # Frontend utility and UI tests
│   ├── formatting.test.ts    # USDT/RUB formatting functions
│   └── ui.test.ts            # CSS and component structure
├── backend/           # Backend validation and services
│   ├── validation.test.ts    # Deposit validation logic
│   └── services.test.ts      # Notification and operator services
└── integration/       # End-to-end flow tests
    └── flows.test.ts         # Complete user workflows
```

### Running Tests

**Run All Tests:**
```bash
npm test
```

**Watch Mode (Re-run on file changes):**
```bash
npm run test:watch
```

**Test UI (Interactive browser interface):**
```bash
npm run test:ui
```

**Coverage Report:**
```bash
npm run test:coverage
```

### Test Coverage

**Frontend Tests (16 tests):**
- ✅ `formatUsdt()` - Returns exactly 2 decimal places (99.97, 0.00)
- ✅ `formatRub()` - Groups thousands with spaces (24 172)
- ✅ `bigIntToUsdt()` - Converts BigInt to USDT number
- ✅ `usdtToBigInt()` - Converts USDT to BigInt (8 decimals)
- ✅ Round-trip conversions maintain precision
- ✅ Tailwind CSS integration
- ✅ CSS custom properties
- ✅ BottomNavigation padding styles
- ✅ Responsive design utilities

**Backend Tests (22 tests):**
- ✅ Deposit min/max validation (30-20,000 USDT)
- ✅ Duplicate deposit detection
- ✅ Notification creation with type field
- ✅ All notification types (deposit_confirmed, payment_paid, etc.)
- ✅ Notification metadata handling
- ✅ Operator online/offline status updates
- ✅ User authentication returns fullName/avatarUrl

**Integration Tests (16 tests):**
- ✅ Deposit flow: create → pending → confirmed/expired
- ✅ Payment request: create → freezes balance → operator assigns
- ✅ Balance freezing/unfreezing on payment lifecycle
- ✅ Notification flow: event → stored with type → retrieved from API
- ✅ Notification filtering by type
- ✅ Unread notification counting

### Test Philosophy

The test suite focuses on **critical path coverage** rather than 100% code coverage:

- **Unit Tests**: Pure functions and validation logic
- **Service Tests**: Business logic and state management
- **Integration Tests**: Complete user workflows without requiring running server
- **Mocking**: Database calls mocked where appropriate for speed

**Total: 60 tests passing** ✅

All tests are designed to run in isolation without requiring:
- Running database server
- Active Telegram bot connections
- External API calls
- Production environment variables

---

## AI Development Guidelines

### Code Style

**TypeScript:**
- Strict mode enabled (`"strict": true` in tsconfig.json)
- Explicit return types for functions
- No `any` types (use `unknown` if necessary)
- Interfaces for complex objects
- Type imports: `import type { Type } from 'module'`

**React:**
- Functional components only
- Hooks for state and side effects
- Props interface for all components
- Destructure props in function signature
- Use `React.FC` sparingly (prefer explicit props)

**Styling:**
- Tailwind CSS utility classes
- No inline styles (use Tailwind)
- shadcn/ui components for UI primitives
- Neo-Brutalist design principles:
  - `border-4 border-black` (thick borders)
  - `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` (harsh shadows)
  - `rounded-none` (zero border-radius)
  - High contrast colors

**Russian Language:**
- ALL user-facing text in Russian
- Comments can be in English
- API responses in Russian for user messages
- Error messages in Russian

### BigInt Precision

USDT amounts use high-precision arithmetic to prevent rounding errors.

**Backend Storage:**
- Database: `numeric(18, 8)` - 18 total digits, 8 decimal places
- TypeScript: String representation of numeric
- Example: `"99.97123456"`

**Conversion Functions:**

```typescript
// Frontend (client/src/lib/utils.ts)

// Display: BigInt/number → "99.97" (2 decimals)
export function formatUsdt(value: number | string | bigint): string {
  const num = typeof value === 'bigint' ? bigIntToUsdt(value) : Number(value);
  return num.toFixed(2);
}

// Convert: BigInt → number (JavaScript number)
export function bigIntToUsdt(value: bigint): number {
  return Number(value) / 100000000; // 8 decimal places
}

// Convert: number → BigInt (for backend)
export function usdtToBigInt(value: number | string): bigint {
  const num = Number(value);
  return BigInt(Math.round(num * 100000000));
}
```

**Backend Helpers:**

```typescript
// server/config/tron.ts

// Format for database storage
export function formatUsdtBalance(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(8); // Always 8 decimals for storage
}

// Parse from database
export function parseUsdtAmount(amount: string | number): number {
  return parseFloat(typeof amount === 'string' ? amount : amount.toString());
}
```

**Usage Rules:**
1. **Frontend Display**: Always use `formatUsdt()` for showing amounts to users
2. **Database Storage**: Always use 8 decimal precision (`formatUsdtBalance()`)
3. **API Communication**: Send/receive as numbers, store as strings
4. **Arithmetic**: Use BigInt for calculations, convert to number for display
5. **Never**: Use JavaScript floating-point math directly on USDT amounts

**Example Workflow:**

```typescript
// User inputs amount
const userInput = 99.97;

// Store in database
const dbValue = formatUsdtBalance(userInput); // "99.97000000"

// Display to user
const displayValue = formatUsdt(dbValue); // "99.97"

// Convert for calculations
const bigIntValue = usdtToBigInt(userInput); // BigInt(9997000000)
```

### Adding New Features

Follow this workflow for adding new features to maintain consistency.

#### 1. Update Database Schema

Edit `shared/schema.ts`:

```typescript
export const newTable = pgTable("new_table", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 8 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNewTableSchema = createInsertSchema(newTable).omit({
  id: true,
  createdAt: true,
});

export type NewTable = typeof newTable.$inferSelect;
export type InsertNewTable = z.infer<typeof insertNewTableSchema>;
```

#### 2. Apply Database Migration

```bash
npm run db:push --force
```

Review changes carefully before forcing.

#### 3. Update Storage Layer

Edit `server/storage.ts`:

```typescript
class Storage {
  // ... existing methods

  async createNewTableEntry(data: InsertNewTable): Promise<NewTable> {
    const result = await db.insert(newTable)
      .values(data)
      .returning();
    return result[0];
  }

  async getNewTableEntries(userId: string): Promise<NewTable[]> {
    return await db.select()
      .from(newTable)
      .where(eq(newTable.userId, userId));
  }
}
```

#### 4. Create Controller

Create `server/controllers/newController.ts`:

```typescript
import { Request, Response } from 'express';
import { storage } from '../storage';

export async function createEntry(req: Request, res: Response) {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = await storage.createNewTableEntry({
      userId,
      amount: formatUsdtBalance(amount),
    });

    res.json({
      id: entry.id,
      amount: parseFloat(entry.amount),
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEntries(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const entries = await storage.getNewTableEntries(userId);

    res.json(entries.map(e => ({
      id: e.id,
      amount: parseFloat(e.amount),
      createdAt: e.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

#### 5. Add Routes

Edit `server/routes.ts`:

```typescript
import { createEntry, getEntries } from './controllers/newController';

// In registerRoutes():
app.post('/api/entries/create', createEntry);
app.get('/api/entries/user/:userId', getEntries);
```

#### 6. Update Frontend API

Edit `client/src/lib/api.ts`:

```typescript
export async function createEntry(userId: string, amount: number) {
  const response = await fetch(`${API_BASE}/entries/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount }),
  });

  if (!response.ok) {
    throw new Error('Failed to create entry');
  }

  return response.json();
}

export async function getEntries(userId: string) {
  const response = await fetch(`${API_BASE}/entries/user/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch entries');
  }

  return response.json();
}
```

#### 7. Create Frontend Component

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { formatUsdt } from '@/lib/utils';

export function EntriesPage({ userId }: { userId: string }) {
  const { data: entries } = useQuery({
    queryKey: ['entries', userId],
    queryFn: () => api.getEntries(userId),
  });

  const createMutation = useMutation({
    mutationFn: (amount: number) => api.createEntry(userId, amount),
    onSuccess: () => {
      // Refetch entries
      queryClient.invalidateQueries({ queryKey: ['entries', userId] });
    },
  });

  return (
    <div className="space-y-4">
      {entries?.map(entry => (
        <div key={entry.id} className="border-4 border-black p-4">
          <div className="text-2xl font-black">
            {formatUsdt(entry.amount)} USDT
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### 8. Test Thoroughly

- Test API endpoints with curl/Postman
- Test frontend components in browser
- Check database for correct data
- Verify error handling
- Test edge cases

### Common Patterns

**Format USDT Amount (2 decimals):**
```typescript
formatUsdt(amount) → "99.97"
```

**Format RUB Amount (no decimals, space separators):**
```typescript
formatRub(amount) → "24 172"
```

**Convert BigInt to USDT:**
```typescript
bigIntToUsdt(bigint) → number
```

**Convert USDT to BigInt:**
```typescript
usdtToBigInt(number) → bigint
```

**Create Notification:**
```typescript
await storage.createNotification({
  userId: user.id,
  message: 'Ваш баланс обновлен',
  isRead: 0,
});

await sendNotificationToUser(user.chatId, 'Ваш баланс обновлен');
```

**Query with Filters:**
```typescript
await db.select()
  .from(table)
  .where(
    and(
      eq(table.status, 'pending'),
      gt(table.amount, 100)
    )
  )
  .orderBy(desc(table.createdAt));
```

**Transaction with Rollback:**
```typescript
await db.transaction(async (tx) => {
  await tx.update(users)
    .set({ availableBalance: newBalance })
    .where(eq(users.id, userId));

  await tx.insert(notifications)
    .values({ userId, message: 'Balance updated' });
});
```

**Error Handling:**
```typescript
try {
  const result = await someOperation();
  res.json({ success: true, result });
} catch (error) {
  console.error('Operation failed:', error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ error: message });
}
```

**Date Formatting:**
```typescript
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const formatted = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: ru });
// "16 ноября 2025, 14:30"
```

---

## Troubleshooting

### Common Issues

**1. Blockchain Scanner Not Detecting Deposits**
- Check TRONGRID_API_KEY is set (rate limits without key)
- Verify MASTER_WALLET_ADDRESS is correct
- Check scanner logs for errors
- Ensure deposit amount matches payableAmount exactly

**2. Telegram Bot Not Responding**
- Verify BOT_TOKEN is correct
- Check webhook is set (production) or polling is running (development)
- Ensure REPLIT_DOMAINS is set correctly
- Check bot permissions in @BotFather

**3. Admin Panel Shows "Unauthorized"**
- Verify ADMIN_PASSWORD environment variable
- Clear browser cache/cookies
- Check password is correct (case-sensitive)

**4. Exchange Rate Not Updating**
- Check external API is accessible
- Verify no rate limiting on ExchangeRate-API
- Check server logs for errors
- Service retries every 30 minutes

**5. Operator Not Receiving Notifications**
- Check operator isOnline status
- Verify BOT_OPER_TOKEN is correct
- Check operator chatId is set
- Ensure operator is active (isActive = 1)

### Debug Mode

Enable verbose logging:

```bash
DEBUG=* npm run dev
```

Check specific services:

```bash
DEBUG=tron:* npm run dev  # TRON scanner logs
DEBUG=bot:* npm run dev   # Bot logs
DEBUG=api:* npm run dev   # API logs
```

### Database Inspection

Access PostgreSQL directly:

```bash
psql $DATABASE_URL

# Useful queries:
SELECT * FROM users;
SELECT * FROM deposits WHERE status = 'pending';
SELECT * FROM payment_requests WHERE status = 'submitted';
SELECT * FROM tron_scan_state;
```

---

## Support

For issues, questions, or contributions:

**Telegram:** [@ex_romax](https://t.me/ex_romax)

**Project Repository:** [Replit Project]

---

## License

Proprietary - All rights reserved.

---

**Built with ❤️ for seamless crypto-to-fiat payments in Russia.**

---

## Appendix: File Structure

```
romax-pay/
├── client/                    # Frontend application
│   ├── public/
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TopUpPage.tsx
│   │   │   ├── PayPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── SupportPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── NotificationsSheet.tsx
│   │   │   └── RequestDetailPage.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── lib/             # Utilities and helpers
│   │   │   ├── api.ts       # API client functions
│   │   │   ├── utils.ts     # Utility functions (formatUsdt, etc.)
│   │   │   └── queryClient.ts
│   │   ├── pages/           # Page components
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── OperatorPanel.tsx
│   │   │   └── not-found.tsx
│   │   ├── App.tsx          # Main App component
│   │   ├── main.tsx         # Entry point
│   │   ├── index.css        # Global styles
│   │   └── telegram.d.ts    # Telegram types
│   └── index.html
├── server/                   # Backend application
│   ├── config/
│   │   └── tron.ts          # TRON blockchain config
│   ├── controllers/         # API endpoint handlers
│   │   ├── adminController.ts
│   │   ├── depositController.ts
│   │   ├── notificationController.ts
│   │   ├── operatorController.ts
│   │   ├── paymentController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   └── operatorAuth.ts  # Operator authentication
│   ├── services/            # Background services
│   │   ├── blockchainScanner.ts
│   │   ├── depositExpiration.ts
│   │   ├── depositUniqueness.ts
│   │   ├── exchangeRate.ts
│   │   ├── notificationService.ts
│   │   └── operatorService.ts
│   ├── telegram/            # Telegram bot integration
│   │   ├── bot.ts           # User bot
│   │   ├── operatorBot.ts   # Operator bot
│   │   └── webhooks.ts      # Webhook handlers
│   ├── types/
│   │   └── session.d.ts     # Session type definitions
│   ├── utils/
│   │   ├── password.ts      # Password hashing
│   │   └── telegram.ts      # Telegram utilities
│   ├── db.ts                # Database connection
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Database query layer
│   └── vite.ts              # Vite middleware
├── shared/                  # Shared code
│   └── schema.ts            # Database schema (Drizzle)
├── migrations/              # Database migrations
│   └── meta/
├── attached_assets/         # Generated assets
├── tests/                   # Test files
│   ├── frontend/
│   ├── backend/
│   └── integration/
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── tailwind.config.ts       # Tailwind CSS config
├── drizzle.config.ts        # Drizzle ORM config
├── postcss.config.js        # PostCSS config
├── components.json          # shadcn/ui config
├── design_guidelines.md     # Design system docs
├── SETUP.md                 # Setup instructions
├── LAUNCH_GUIDE.md          # Launch guide
├── replit.md                # Project overview
└── README.md                # This file
```

---

## Changelog

### Version 1.0.0 - Beta (Current)
- Initial production-ready release
- Full payment request system
- Automated deposit detection
- Dual-bot system (user + operator)
- Admin and operator panels
- Neo-Brutalist UI design
- Comprehensive notification system
- Exchange rate integration
- Duplicate deposit protection
- Session management
- Full error handling and logging

---

*Last updated: November 16, 2025*

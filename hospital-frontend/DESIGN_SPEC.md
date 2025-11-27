# Fixed Asset Trading Platform - Professional UI Design Specification

## Design System Overview

### Color Palette
- **Primary (Finance)**: #1a237e (Deep Indigo) - Authority, trust, professional
- **Secondary (Healthcare)**: #00695c (Teal) - Health, wellness, stability
- **Neutral**: #424242 (Professional Gray) - Balance, clarity
- **Accents**: 
  - Success: #2e7d32 (Dark Green)
  - Warning: #ff9800 (Amber)
  - Danger: #d32f2f (Red)

### Typography Rules
- **Headers**: Inter Bold (700) - h1: 32px, h2: 24px, h3: 18px, h4: 16px
- **Body**: Inter Regular (400) - 14px, line-height: 1.5
- **Data/Code**: Roboto Mono (500) - 12px for addresses, hashes, amounts
- **Labels**: Inter SemiBold (600) - 13px, uppercase, letter-spacing: 0.5px

### Layout Principles
- **Grid**: 12-column responsive grid (max-width: 1280px)
- **Spacing**: 4px base unit (xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, 3xl: 32)
- **Radius**: Flat sharp corners (0-8px, no gradients)
- **Shadows**: Subtle only (sm, md, lg, xl)
- **No emojis, cartoons, or decorative gradients**

---

## PATIENT SCREENS (P01-P06)

### P01 - Login / Signup
**Layout**: Centered card, minimal distractions
- Logo/Icon in primary color box (56x56px)
- Title + subtitle
- Form fields (Wallet Address, Password, Confirm Password)
- Submit button (full-width)
- Footer: Legal notice, copyright
- State: Login mode / Register mode (tab or switch)
- Validation: Real-time feedback, error messages inline

### P02 - Patient Dashboard
**Layout**: Grid-based dashboard
- Welcome header with greeting + role
- 4 Stat Cards (2x2): Total Asset Value, Health Tokens, Benefits Earned, Active Requests
- Recent Activity Table: Date, Type, Amount, Status (with badges)
- Quick Action Cards (2x2): Deposit Assets, View My Assets, Redeem Benefits, Transaction History
- Responsive: Stack on mobile, expand on desktop

### P03 - Deposit Asset Form
**Layout**: Form card + preview
- Form fields:
  - Asset Type (dropdown: Gold, Silver, Cash, Jewelry, etc.)
  - Quantity (number input + unit selector)
  - Estimated Value (USD)
  - Description (textarea)
  - Photos/Proof (file upload)
- Live preview panel showing amount breakdown
- Submit button with confirmation
- Success/error messages

### P04 - My Assets Table
**Layout**: Data-heavy table with filters
- Table columns: Asset ID, Type, Quantity, Value (USD), Status, Actions
- Filters: By Type, By Status, By Date Range
- Sorting: Clickable column headers
- Row actions: View details, Edit, Delete
- Pagination with page size selector
- Export button (CSV/PDF)

### P05 - My Health Tokens
**Layout**: Token balance overview + transaction table
- Large stat card: Total HBT balance + historical chart sparkline
- Token information: Minting date, conversion rate, total earned
- Transaction table: Date, Type (Minted/Redeemed), Amount, Hospital/Bank, Status
- Filter + sort options
- View transaction details (hash, gas, blockchain link)

### P06 - Redeem Benefits
**Layout**: Benefit catalog grid + redemption modal
- Grid of benefit cards (3-column):
  - Benefit image/icon
  - Title + description
  - HBT cost (badge)
  - Availability status
  - "Redeem" button
- Modal on redemption:
  - Benefit summary
  - HBT deduction preview
  - Confirmation + delivery details
  - Track status after redemption

---

## HOSPITAL SCREENS (H01-H05)

### H01 - Hospital Dashboard
**Layout**: Executive dashboard with KPIs
- Welcome header + role indicator
- KPI Cards (2x2): Active Patients, Total Asset Value, Pending Trades, Total Profit Distributed
- Patient Overview Table: Patient ID, Assets Deposited, Token Balance, Last Activity, Status
- Trade Summary: Ongoing trades (compact list), Total P&L
- Pending Approvals: Count badge, link to approval queue

### H02 - Patient Management Table
**Layout**: Advanced data grid
- Table: Patient ID, Name, Status, Total Assets, Token Balance, Requests, Actions
- Filters: By Status, By Asset Type, By Date Range
- Actions: View Profile, Approve Assets, Send Message, View Transaction History
- Patient Profile Modal: Full details, asset history, transaction graph
- Bulk actions: Select multiple, approve all, send notification

### H03 - Asset Requests
**Layout**: Request queue with approval workflow
- Pending Requests Table: Request ID, Patient, Asset Type, Quantity, Value, Date Submitted, Actions
- Status columns: "Verify", "Approve", "Reject", "Request Info"
- Request Detail Modal:
  - Patient info + asset photos
  - Valuation details (market rate, suggested value)
  - Approve/Reject buttons
  - Comment field for notes
  - History of status changes

### H04 - Trading Desk
**Layout**: Trading execution + history
- Start Trade Form:
  - Select Assets (multi-select from patient pool)
  - Trade Parameters (duration, type, expected return)
  - Counterparty (Bank or external market)
  - Submit button
- Trade History Table: Trade ID, Assets, Duration, Status, P&L, Completion Date
- Active Trades section: Live status, real-time updates, close/modify buttons
- Trade Performance chart (if data available)

### H05 - Benefit Allocation
**Layout**: Distribution workflow
- Profit Input: Total profit amount, distribution method (equal, weighted, tiered)
- Allocation Preview Table: Patient ID, Benefit Value, HBT Amount, Delivery Method
- Approve + Distribute button (with confirmation)
- Distribution Status: Show completion progress per patient
- History Table: Date, Amount, Recipients, Status

---

## BANK SCREENS (B01-B04)

### B01 - Bank Dashboard
**Layout**: Operations dashboard
- KPI Cards (2x2): Total Tokenized Assets, Pending Mint Requests, Insurance Policies, Settlement Status
- Minting Queue: Count, oldest request, action button
- Insurance Summary: Active policies, claims pending, coverage value
- Ledger Snapshot: Recent transactions (compact, last 10)

### B02 - Minting Requests
**Layout**: Request approval queue
- Pending Requests Table: Request ID, Hospital, Patient, Asset, Quantity, Requested Value, Date, Actions
- Columns: Request ID, From, Asset Details, Requested Amount, Status, Actions
- Request Detail Panel (side drawer):
  - Asset verification checklist (photos, valuation, proof)
  - Market reference rate
  - Suggested mint amount (in tokens)
  - Verify/Request Info/Mint buttons
  - Comments + approval signature
- Approved/Minted table: Status history + confirmation hashes

### B03 - Token Ledger
**Layout**: Immutable transaction log
- Ledger Table: Timestamp, Patient Address, Asset, Quantity, Tokens Minted, Transaction Hash, Status
- Columns sortable/filterable by any field
- Date range selector
- Columns: DateTime, PatientID, AssetType, Qty, HBTMinted, TxHash, Status
- View Detail Link: Opens modal with full transaction details
- Export option (CSV, filtered by date range)
- Verification status: Confirmed (green), Pending (yellow), Failed (red)

### B04 - Insurance Management
**Layout**: Policy creation + administration
- Active Policies Table: Policy ID, Hospital, Coverage Amount, Expiry, Premium Status, Actions
- Policy Creation Form:
  - Hospital selection
  - Coverage type (asset loss, trading loss, fraud)
  - Coverage amount (USD)
  - Premium rate (%)
  - Duration (months)
  - Submit button
- Claims Processing: Pending claims table with approve/reject actions
- Policy History: Renewals, amendments, claims history

---

## SHARED COMPONENTS (All Screens)

### Navigation/Layout
- **Top Navigation Bar**:
  - Logo + Platform Name (left)
  - User Profile Menu (right): Role, Name, Wallet Address, Sign Out
  - Notification bell (if applicable)
  - Settings icon
  
- **Sidebar** (optional, for multi-role):
  - Navigation links by role
  - Active page highlight
  - Collapse/expand toggle

### Common Components
1. **DataTable**: Sortable, filterable, paginated, striped rows, hover effects
2. **StatCard**: Icon + label, large value, optional trend indicator
3. **StatusBadge**: Color-coded status labels (pending, approved, rejected, etc.)
4. **FormField**: Label, input, error message, helper text, focus state
5. **Modal**: Centered overlay, title, form/content, action buttons
6. **Button**: Primary, Secondary, Outline variants with hover/disabled states
7. **Input**: Text, number, date, file upload with validation feedback
8. **Select/Dropdown**: Options list with search, clear button
9. **Textarea**: Multi-line input with character count
10. **Switch/Toggle**: For boolean options (e.g., auto-approve)

### Forms
- **Validation**: Real-time feedback, inline error messages, required field markers
- **States**: Default, Focus, Disabled, Error, Success
- **Buttons**: Submit (primary), Cancel (secondary), Clear (outline)
- **Spacing**: Consistent 12px between fields

### Data Tables
- **Header**: Gray background (#f5f5f5), uppercase labels, bold
- **Rows**: Alternating white/#f5f5f5, hover state with subtle shadow
- **Borders**: Light gray (#e0e0e0) for all dividers
- **Actions**: View, Edit, Delete icons (right-aligned)
- **Pagination**: Bottom-aligned, page size selector

### Alerts / Messages
- **Success**: Green (#2e7d32) background, white text, check icon
- **Warning**: Amber (#ff9800) background, dark text, warning icon
- **Error**: Red (#d32f2f) background, white text, error icon
- **Info**: Blue (#1976d2) background, white text, info icon

---

## INTERACTION PATTERNS

### Buttons
- **Primary**: `background: #1a237e`, hover: `#0d1353`, text: white
- **Secondary**: `background: #00695c`, hover: `#004d40`, text: white
- **Outline**: `border: 2px #1a237e`, hover: light background
- **Disabled**: `background: #bdbdbd`, cursor: not-allowed
- All buttons: Rounded 6px, 12px horizontal padding, text-transform: uppercase

### Form Inputs
- Border: 1px #e0e0e0
- Focus: 2px #1a237e border, blue outline shadow
- Error: Red border, error message below
- Placeholder: #757575 (gray)
- Padding: 12px 16px, 14px font

### Cards
- Background: White (#ffffff)
- Border: 1px #e0e0e0
- Border radius: 6px
- Padding: 16-24px (varies by context)
- Shadow: 0 1px 2px rgba(0,0,0,0.05) baseline, 0 2-4px on hover

### Modals
- Overlay: Semi-transparent black (rgba(0,0,0,0.5))
- Card: Centered, max-width 500px, white background
- Title: 24px bold, primary color
- Close button: X icon (top-right)
- Actions: Bottom-aligned buttons

---

## RESPONSIVE BREAKPOINTS
- **Mobile**: < 640px (single column, stacked layout)
- **Tablet**: 640px - 1024px (2-column grid)
- **Desktop**: > 1024px (3-4 column grid, sidebar visible)

All screens must be mobile-responsive. Tables may scroll horizontally on small screens.

---

## ACCESSIBILITY & BEST PRACTICES
- Contrast ratio: All text ≥ 4.5:1 (AA standard)
- Focus states: Visible outlines for keyboard navigation
- ARIA labels on all interactive elements
- Keyboard shortcuts documented where applicable
- Color not sole means of status indication (use icons/text too)

---

## DESIGN FILES & IMPLEMENTATION
- All styles use CSS variables (var(--color-primary), var(--spacing-lg), etc.)
- No inline styles except for dynamic data (use components)
- Consistent font sizes, weights, colors across all screens
- Icons: Simple, monochrome, 20-24px sizes
- Charts (if used): Simple line/bar charts, professional color palette


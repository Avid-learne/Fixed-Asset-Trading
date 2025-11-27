# Fixed Asset Trading Platform - Implementation Roadmap

## Completed
✅ Design System & Color Tokens (#1a237e, #00695c, #424242 primary colors)
✅ Typography System (Inter + Roboto Mono)
✅ Spacing & Radius Utilities
✅ Shared UI Components:
  - DataTable (sortable, filterable, striped, hover effects)
  - StatCard (KPI display with trends)
  - StatusBadge (color-coded status indicators)
  - FormField (with validation, error states)
✅ P01 - Patient Login (professional header, form, footer)
✅ Design Specification Document (DESIGN_SPEC.md)

## Next Priority (Patient Screens)

### P02 - Patient Dashboard
- 4 StatCards: Total Asset Value, Health Tokens, Benefits Earned, Active Requests
- Recent Activity DataTable
- 4 Quick Action Cards (clickable to other sections)
- Responsive grid layout

### P03 - Deposit Asset Form
- Asset type dropdown
- Quantity + unit selector
- Estimated value
- Description textarea
- Photo upload
- Live breakdown preview
- Submit with validation

### P04 - My Assets Table
- Full-featured DataTable with:
  - Filters (Type, Status, Date)
  - Sorting
  - Pagination
  - Row actions (View, Edit, Delete)
  - Export (CSV)

### P05 - My Health Tokens
- Balance overview card
- Transaction history table
- Minting date, conversion rate, earnings
- Filter + sort
- View transaction details link

### P06 - Redeem Benefits
- Benefit catalog grid (3-column)
- Benefit cards with image, title, description, HBT cost
- Redemption modal with confirmation
- Track redemption status

## Hospital Screens

### H01 - Hospital Dashboard
- KPI Cards (4x)
- Patient Overview Table
- Trade Summary
- Pending Approvals counter

### H02 - Patient Management
- Advanced DataTable with filters
- Patient profile modal on row click
- Bulk selection + actions

### H03 - Asset Requests
- Request queue table
- Request detail modal with valuation
- Approve/Reject/Request Info workflow

### H04 - Trading Desk
- Start Trade Form
- Trade History Table
- Active Trades section
- P&L tracking

### H05 - Benefit Allocation
- Profit input form
- Distribution preview table
- Approve + Distribute workflow
- Distribution status tracking

## Bank Screens

### B01 - Bank Dashboard
- KPI Cards (4x)
- Minting Queue counter
- Insurance Summary
- Recent Ledger Snapshot

### B02 - Minting Requests
- Pending requests table
- Request detail side drawer
- Verification checklist
- Market reference rates
- Mint button + confirmation

### B03 - Token Ledger
- Immutable transaction log table
- Date range filters
- Sortable/filterable columns
- Transaction detail modal
- Export option
- Verification status indicators

### B04 - Insurance Management
- Active Policies Table
- Policy Creation Form
- Claims Processing Queue
- Policy History

## Key Features to Implement

1. **Navigation**:
   - Role-based routing (patient, hospital, bank)
   - Top navbar with user profile menu
   - Sidebar (optional based on preference)
   - Sign out functionality

2. **Authentication**:
   - Login page (role selection)
   - Session management
   - Protected routes
   - Redirect to login if not authenticated

3. **Data Persistence**:
   - Use localStorage (demo) or connect to backend API
   - Form validation + submission
   - Error handling + user feedback

4. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints: 640px, 1024px
   - Touch-friendly buttons (min 44px height)

5. **Accessibility**:
   - Keyboard navigation
   - ARIA labels
   - Focus states
   - Color contrast (AA standard)

## Color Quick Reference

```css
/* Primary Colors */
--color-primary: #1a237e;              /* Deep Indigo */
--color-primary-light: #283593;
--color-primary-dark: #0d1353;

/* Secondary */
--color-secondary: #00695c;            /* Teal */
--color-secondary-light: #00897b;
--color-secondary-dark: #004d40;

/* Neutral */
--color-neutral: #424242;              /* Gray */

/* Accents */
--color-success: #2e7d32;              /* Dark Green */
--color-success-light: #4caf50;
--color-warning: #ff9800;              /* Amber */
--color-danger: #d32f2f;               /* Red */
```

## Typography Quick Reference

```css
/* Headings (Inter Bold 700) */
h1: 32px, line-height: 1.2
h2: 24px, line-height: 1.3
h3: 18px, line-height: 1.3
h4: 16px, line-height: 1.4

/* Body (Inter Regular 400) */
Body: 14px, line-height: 1.5
Small: 12px

/* Labels (Inter SemiBold 600, Uppercase) */
13px, letter-spacing: 0.5px

/* Data (Roboto Mono, 500) */
12px for addresses, hashes, amounts
```

## Component Patterns

### Button States
- Default: Primary color background, white text
- Hover: Slightly darker shade
- Focus: Visible outline ring
- Disabled: Gray background, not-allowed cursor
- Loading: Show spinner, disabled state

### Form Validation
- Real-time feedback
- Error messages below field (red text)
- Helper text (gray) for guidance
- Required field marker (*)
- Success state (green border/check)

### Table Interactions
- Hover: Subtle background change
- Sort: Clickable headers with arrows
- Filter: Input field or dropdown per column
- Pagination: Page number selector + size dropdown
- Row actions: Icons on row hover or end of row

### Modal Pattern
- Overlay (semi-transparent)
- Centered card (max-width: 500px)
- Title + close button
- Content area (scrollable if needed)
- Footer buttons (Primary + Secondary)

## Testing Checklist

- [ ] All screens responsive on mobile (< 640px)
- [ ] All screens responsive on tablet (640-1024px)
- [ ] All screens responsive on desktop (> 1024px)
- [ ] Form validation working
- [ ] Error messages displaying correctly
- [ ] Navigation between screens works
- [ ] Authentication/protected routes working
- [ ] Data persistence working
- [ ] All buttons/links functional
- [ ] Accessibility: keyboard navigation, focus states
- [ ] Performance: page load time acceptable
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

## Notes

- All screens follow "flat UI, sharp corners, no gradients" rule
- Minimal white space, strict grid layout
- Financial-grade, medical-clean, bank-secure aesthetic
- No emojis, cartoons, or decorative elements
- Use professional icons (minimal line-style)
- Consistent color palette throughout all screens


### Folder Structure 
frontend/
├── app/                              # Next.js 14 App Router
│   ├── (auth)/                      # Route group for auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/                 # Protected dashboard routes  
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── analytics/page.tsx
│   │   │   ├── watchlist/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── layout.tsx              # Dashboard layout
│   ├── api/                        # API routes (if needed)
│   │   └── auth/[...nextauth]/route.ts
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                   # Landing/Market Overview page
├── components/                     # Reusable components
│   ├── layout/                    # Layout components
│   │   ├── header.tsx            # Enhanced header
│   │   ├── sidebar.tsx           # Enhanced sidebar  
│   │   ├── search/               # Search functionality
│   │   │   ├── search-bar.tsx
│   │   │   └── search-modal.tsx
│   │   └── notifications/        # Bell notifications
│   │       ├── notification-bell.tsx
│   │       └── notification-panel.tsx
│   ├── auth/                     # Authentication components
│   │   ├── login-modal.tsx       # Soft login modal
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── google-auth-button.tsx
│   ├── ui/                       # Shadcn UI components
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── kpi-pill.tsx
│   │   ├── metric-card.tsx
│   │   └── ...
│   ├── charts/                   # Chart components
│   │   ├── aiStrategyChart.tsx
│   │   ├── marketChart.tsx
│   │   └── ...
│   └── onboarding/              # Tour & onboarding
│       ├── onboarding-banner.tsx
│       └── tour-highlight.tsx
├── lib/                         # Utility functions
│   ├── auth.ts                  # NextAuth configuration
│   ├── api.ts                   # API client setup
│   ├── utils.ts                 # General utilities
│   └── validations.ts           # Form validations
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   ├── use-search.ts           # Search functionality
│   ├── use-keyboard.ts         # Keyboard shortcuts
│   └── use-notifications.ts    # Notifications hook
├── store/                      # State management
│   ├── auth-store.ts          # Auth state (Zustand)
│   ├── search-store.ts        # Search state
│   └── notification-store.ts   # Notification state
├── types/                      # TypeScript definitions
│   ├── auth.ts
│   ├── api.ts
│   └── index.ts
└── utils/                      # Helper utilities
    ├── constants.ts           # App constants
    ├── keyboard-shortcuts.ts  # Alt+S handling
    └── storage.ts            # localStorage helpers

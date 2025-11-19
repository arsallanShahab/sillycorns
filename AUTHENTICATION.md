# Dashboard Authentication Setup

## Environment Variables

Create a `.env.local` file in your project root with:

```env
DASHBOARD_EMAIL=admin@example.com
DASHBOARD_PASSWORD=password123
```

Replace with your desired email and password.

## How It Works

### 1. **Authentication Flow**

- Users visit `/dashboard/login`
- Enter email and password
- Credentials validated against `DASHBOARD_EMAIL` and `DASHBOARD_PASSWORD` env variables
- On success, authentication status stored in browser's `localStorage`

### 2. **Local Storage**

- Session stored in: `dashboard_auth` (value: "true" or removed)
- Persists across browser refreshes
- Only cleared when user clicks "Logout"

### 3. **Protected Dashboard**

- Dashboard at `/dashboard` automatically redirects to login if not authenticated
- `useAuth()` hook checks `localStorage` and validates on load
- Logout button clears storage and redirects to login page

## Files Created/Modified

### New Files:

- `lib/auth-context.tsx` - Authentication context and hook
- `app/api/auth/login/route.ts` - Login validation API
- `app/dashboard/login/page.tsx` - Login UI
- `components/ProtectedDashboardLayout.tsx` - Protection wrapper
- `.env.local.example` - Example environment variables

### Modified Files:

- `app/layout.tsx` - Added AuthProvider wrapper
- `app/dashboard/page.tsx` - Added logout button and auth checks

## Usage

```typescript
// In any client component:
import { useAuth } from "@/lib/auth-context";

function MyComponent() {
  const { isAuthenticated, login, logout, isLoading } = useAuth();

  // Use the auth state
}
```

## Security Notes

⚠️ **Important**:

- This is basic client-side authentication for simple use cases
- Passwords stored in `.env.local` are bundled in client (basic obfuscation only)
- For production, consider:
  - Hashing passwords
  - Using proper authentication libraries (NextAuth.js, Clerk, etc.)
  - Implementing session tokens
  - Using HTTP-only cookies

For maximum security, keep `.env.local` in `.gitignore` and never commit credentials!

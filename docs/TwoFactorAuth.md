# Two-Factor Authentication (2FA)

Handle 2FA flows easily with the updated login API.

## Login with 2FA Support

The `login()` method now returns a `LoginResult` object that tells you if 2FA verification is required:

```typescript
const result = await db.auth.login('user@example.com', 'password123');

if (result.requires_2fa) {
  // 2FA is required - show code input to user
  console.log(result.message); // "2FA code sent to your email"

  // Store email for the verify step
  setEmail('user@example.com');
  showTwoFactorInput();
} else {
  // Login successful
  console.log('Logged in as:', result.user?.email);
  redirectToDashboard();
}
```

## Completing 2FA Login

After the user enters their 2FA code, call `verify2FALogin()`:

```typescript
try {
  const user = await db.auth.verify2FALogin(email, code);
  console.log('Logged in as:', user.email);
  redirectToDashboard();
} catch (error) {
  console.error('Invalid code:', error.message);
  showError('Invalid or expired code');
}
```

## Complete Example (React)

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const result = await db.auth.login(email, password);

      if (result.requires_2fa) {
        setNeeds2FA(true);
      } else {
        // Success - redirect
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleVerify2FA(e: FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await db.auth.verify2FALogin(email, code);
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid or expired code');
    }
  }

  if (needs2FA) {
    return (
      <form onSubmit={handleVerify2FA}>
        <p>Enter the 2FA code sent to your email</p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          maxLength={6}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Verify</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

## Managing 2FA for Users

### Enable 2FA

```typescript
// User must be authenticated
await db.auth.enable2FA();
```

### Disable 2FA

```typescript
await db.auth.disable2FA();
```

### Send 2FA Code (for authenticated users)

```typescript
await db.auth.send2FACode();
```

### Verify 2FA Code (for authenticated users)

```typescript
// Use this for security actions that require 2FA verification
await db.auth.verify2FACode('123456');
```

## Types

```typescript
interface LoginResult {
  /** Whether 2FA verification is required */
  requires_2fa: boolean;
  /** User object (only present if login succeeded without 2FA) */
  user?: AppUser;
  /** Message from server (present when 2FA is required) */
  message?: string;
}

interface TwoFAVerifyResponse {
  access_token: string;
  user: AppUser;
  message: string;
}
```

## Registration with 2FA

The `register()` method also returns `LoginResult` for consistency:

```typescript
const result = await db.auth.register('user@example.com', 'password123', {
  username: 'johndoe'
});

if (result.requires_2fa) {
  // Handle 2FA if enabled by default for new users
} else {
  console.log('Registered:', result.user?.email);
}
```

# Clerk Integration Guide - Amrita Nexus
## Step-by-Step Setup Instructions

---

## 📋 Table of Contents
1. [Creating a Clerk Account](#creating-a-clerk-account)
2. [Getting API Keys](#getting-api-keys)
3. [Configuring Clerk](#configuring-clerk)
4. [Installing Clerk SDK](#installing-clerk-sdk)
5. [Integrating with Your Project](#integrating-with-your-project)
6. [Testing the Integration](#testing-the-integration)
7. [Deployment](#deployment)

---

## 🔑 Creating a Clerk Account

### Step 1: Sign Up
1. Visit [clerk.com/signup](https://clerk.com/signup)
2. Enter your email address
3. Create a strong password
4. Verify your email
5. Complete the signup form

### Step 2: Create Application
1. Log in to Clerk Dashboard
2. Click **"Create Application"**
3. Name it: **"Amrita Nexus"**
4. Select **"Web"** application type
5. Click **"Create"**

### Step 3: Choose Authentication Methods
- ✅ Email
- ✅ Google OAuth
- ❌ Facebook (optional)
- ❌ GitHub (optional)

---

## 🔐 Getting API Keys

### Finding Your Keys:
1. Go to Clerk Dashboard
2. Left sidebar → **"API Keys"**
3. You'll see two keys:

**Publishable Key** (Safe to expose in frontend)
```
pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Secret Key** (NEVER share this - for backend only)
```
sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Store Keys Securely:
For static HTML project:
- Use only the **Publishable Key** in your JavaScript
- Never commit keys to Git

**Example .gitignore addition:**
```
.env
.env.local
auth-secrets.js
```

---

## ⚙️ Configuring Clerk

### Dashboard Settings

#### 1. Enable Sign In & Sign Up
1. Navigate to **Users** → **Email Addresses**
2. Ensure **Email** is enabled
3. Go to **Users** → **OAuth** → **Google**
4. Click **"Connect"**
5. (You'll be asked to connect your Google project - optional for development)

#### 2. Email Settings
1. Go to **Email** section
2. Verify your email domain (optional for testing)
3. Customize email templates (optional)

#### 3. Password Requirements
1. Go to **Passwords**
2. Set minimum length: **8**
3. Require uppercase: **Yes**
4. Require lowercase: **Yes**
5. Require numbers: **Yes**
6. Require special characters: **Yes**

**Our requirement:** At least 8 characters, 1 uppercase, 1 lowercase, 1 special character ✓

#### 4. Redirect URLs
Essential for redirect after authentication:

**Development:**
- After Sign In: `http://localhost/dashboard.html`
- After Sign Up: `http://localhost/dashboard.html`

**Production:**
- After Sign In: `https://yourdomain.com/dashboard.html`
- After Sign Up: `https://yourdomain.com/dashboard.html`

To set these:
1. Go to **Applications** (or **API** section)
2. Find **"Redirect URLs"**
3. Add your URLs
4. Save changes

---

## 🛠️ Installing Clerk SDK

### Option 1: CDN (Recommended for Static HTML)

Add to `<head>` of pages that need authentication:

```html
<script async crossorigin="anonymous" 
  src="https://cdn.clerk.com/npm/@clerk/clerk-js@latest/dist/clerk.min.js">
</script>
```

### Option 2: NPM (For Node.js/Build Tools)

```bash
npm install @clerk/clerk-js
```

Then import:
```javascript
import Clerk from '@clerk/clerk-js';
```

---

## 🔗 Integrating with Your Project

### Step 1: Update auth-config.js

```javascript
const CLERK_CONFIG = {
  publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
  signInUrl: '/login.html',
  signUpUrl: '/signup.html',
  afterSignInUrl: '/dashboard.html',
  afterSignUpUrl: '/dashboard.html',
};
```

Replace `pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your actual Publishable Key from Clerk.

### Step 2: Add Clerk Script to signup.html

In the `<head>` section, after other scripts:

```html
<script async crossorigin="anonymous" 
  src="https://cdn.clerk.com/npm/@clerk/clerk-js@latest/dist/clerk.min.js">
</script>
```

### Step 3: Update signup.html Script Section

Replace the Google OAuth placeholder with:

```javascript
function startGoogleAuth() {
  isGoogleAuth = true;
  
  window.Clerk.signIn.create({
    strategy: 'oauth_google',
    redirectUrl: window.location.origin + '/dashboard.html'
  }).then(() => {
    // After Google auth succeeds
    goToStep(4); // Go to name collection step
  });
}
```

### Step 4: Update Email/OTP Verification

Replace the email verification placeholder:

```javascript
function verifyEmail() {
  const email = document.getElementById('emailInput').value;
  const errorEl = document.getElementById('emailError');
  
  if (!email || !email.includes('@')) {
    errorEl.textContent = 'Please enter a valid email';
    errorEl.classList.remove('hidden');
    return;
  }

  errorEl.classList.add('hidden');
  currentEmail = email;
  document.getElementById('displayEmail').textContent = email;
  
  // Create sign-up with Clerk
  window.Clerk.signUp.create({
    emailAddress: email
  }).then(() => {
    // Clerk will send OTP automatically
    goToStep(3);
  }).catch(err => {
    errorEl.textContent = err.errors[0].message;
    errorEl.classList.remove('hidden');
  });
}
```

### Step 5: Update OTP Verification

```javascript
function verifyOTP() {
  const otp = document.getElementById('otpInput').value;
  const errorEl = document.getElementById('otpError');
  
  if (!otp || otp.length !== 6) {
    errorEl.textContent = 'Please enter a valid 6-digit OTP';
    errorEl.classList.remove('hidden');
    return;
  }

  window.Clerk.signUp.attemptEmailAddressVerification({
    code: otp
  }).then(() => {
    errorEl.classList.add('hidden');
    goToStep(5); // Go to password creation
  }).catch(err => {
    errorEl.textContent = 'Invalid OTP. Please try again.';
    errorEl.classList.remove('hidden');
  });
}
```

### Step 6: Update Account Creation

```javascript
function createAccount() {
  const password = document.getElementById('passwordInput').value;
  const confirmPassword = document.getElementById('confirmPasswordInput').value;
  const errorEl = document.getElementById('confirmError');

  if (!passwordValidator.isValid(password)) {
    errorEl.textContent = 'Password does not meet requirements';
    errorEl.classList.remove('hidden');
    return;
  }

  if (password !== confirmPassword) {
    errorEl.textContent = 'Passwords do not match';
    errorEl.classList.remove('hidden');
    return;
  }

  errorEl.classList.add('hidden');
  
  // Create account with Clerk
  window.Clerk.signUp.update({
    password: password
  }).then(() => {
    // Mark email as verified and complete signup
    completeSignup();
  }).catch(err => {
    errorEl.textContent = err.errors[0].message;
    errorEl.classList.remove('hidden');
  });
}
```

### Step 7: Add Clerk Initialization

Add this to the end of your script in signup.html:

```javascript
// Initialize Clerk when page loads
window.addEventListener('DOMContentLoaded', () => {
  if (window.Clerk) {
    window.Clerk.load();
  }
  
  updatePasswordStrength('#passwordInput', '#passwordStrengthIndicator');
  document.getElementById('confirmPasswordInput').addEventListener('input', () => {
    validatePasswordMatch('#passwordInput', '#confirmPasswordInput');
  });
});
```

---

## 🧪 Testing the Integration

### Test 1: Google OAuth Sign-Up
1. Go to `signup.html`
2. Click "Continue with Google"
3. Sign in with your Google account
4. Enter your full name
5. Should redirect to `dashboard.html`

### Test 2: Email/OTP Sign-Up
1. Go to `signup.html`
2. Click "Sign Up with Email"
3. Enter test email: `test@example.com`
4. Check Clerk Dashboard → **"Sessions"** → Find OTP
5. Enter OTP (shown in Clerk dashboard for test)
6. Create password: `TestPass123!`
7. Confirm password
8. Should redirect to `dashboard.html`

### Test 3: Login
1. Go to `login.html`
2. Enter email: test email from signup
3. Enter password: `TestPass123!`
4. Should redirect to `dashboard.html`

### Test 4: Protected Routes
1. Open DevTools (F12)
2. Clear cookies and localStorage
3. Try to access `dashboard.html` directly
4. Should redirect to `login.html`

### Test 5: Password Validation
1. On signup page, try passwords:
   - `weak` → 🔴 Red (too short)
   - `WeakPass` → 🔴 Red (no special char)
   - `WeakPass1!` → 🟠 Orange
   - `VeryStrongPass123!@#` → 🟢 Green

---

## 🚀 Deploying with Clerk

### Using GitHub Pages

**Important:** GitHub Pages doesn't support server-side code. Clerk SDK works client-side, so it's compatible!

```bash
# 1. Create GitHub repository
git init
git add .
git commit -m "feat: Amrita Nexus with Clerk authentication"
git remote add origin https://github.com/username/amrita-nexus.git
git push -u origin main

# 2. Enable GitHub Pages
# Go to repository → Settings → Pages
# Select "main" branch as source
# Site will be at: https://username.github.io/amrita-nexus
```

**Update Clerk Redirect URLs:**
1. Go to Clerk Dashboard
2. Navigate to **API Keys** → **Redirect URLs**
3. Add: `https://username.github.io/amrita-nexus/dashboard.html`

### Using Netlify

**Step 1: Connect Repository**
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select repository
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `.`
6. Click "Deploy"

**Step 2: Update Clerk**
1. In Netlify, find your domain (e.g., `amrita-nexus.netlify.app`)
2. Go to Clerk Dashboard
3. Update redirect URLs to: `https://amrita-nexus.netlify.app/dashboard.html`

### Using Firebase Hosting

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Initialize
firebase login
firebase init hosting

# 3. Configuration
# Public directory: .
# Single page app: No
# Setup rewrites: No

# 4. Deploy
firebase deploy
```

---

## 🔒 Security Checklist

- ✅ Publishable Key is in frontend code (OK)
- ✅ Secret Key is NOT in code (keep in backend)
- ✅ Passwords are validated on client AND server
- ✅ OTP is time-limited (Clerk handles this)
- ✅ Sessions use secure tokens
- ✅ HTTPS is used in production
- ✅ No sensitive data in localStorage
- ✅ CORS configured properly (Clerk handles)

---

## 🐛 Troubleshooting

### Issue: "Clerk is not defined"
**Solution:** Ensure Clerk script is loaded:
```html
<script async crossorigin="anonymous" 
  src="https://cdn.clerk.com/npm/@clerk/clerk-js@latest/dist/clerk.min.js">
</script>
```

### Issue: OTP not sending
**Check:**
1. Email address is valid
2. Clerk Email provider is configured
3. Check Clerk Dashboard → Logs for errors

### Issue: Google OAuth not working
**Check:**
1. Google OAuth is enabled in Clerk Dashboard
2. Redirect URLs are configured correctly
3. Browser allows third-party cookies

### Issue: Password validation not showing
**Check:**
1. password-strength.js is loaded
2. Check browser console for errors
3. Ensure password input has correct ID

### Issue: Session not persisting
**Solution:** Clerk automatically manages sessions. If not working:
1. Check browser allows cookies
2. Verify Clerk is properly initialized
3. Check browser console for Clerk errors

---

## 📊 Monitoring in Clerk

**Dashboard Insights:**
1. Navigate to **"Users"** to see all registered users
2. Check **"Sessions"** for active logins
3. View **"Logs"** for authentication events
4. Monitor **"Metrics"** for usage statistics

---

## ✅ Completion Checklist

- [ ] Created Clerk account
- [ ] Got Publishable Key
- [ ] Updated auth-config.js with key
- [ ] Added Clerk script to HTML
- [ ] Configured redirect URLs in Clerk
- [ ] Updated signup.html with Clerk calls
- [ ] Tested Google OAuth flow
- [ ] Tested Email/OTP flow
- [ ] Tested password validation
- [ ] Tested protected routes
- [ ] Deployed to hosting platform
- [ ] Updated Clerk with production URLs
- [ ] Tested on production domain

---

## 📚 Additional Resources

- [Clerk Official Docs](https://clerk.com/docs)
- [Clerk JavaScript SDK](https://clerk.com/docs/reference/clerk-js)
- [Email Verification](https://clerk.com/docs/custom-flows/email-sms-otp)
- [OAuth Setup Guide](https://clerk.com/docs/authentication/social-connections/google)

---

## 🎯 Next Steps

1. **Complete the setup** following this guide
2. **Test all flows** thoroughly
3. **Deploy to production** with your domain
4. **Monitor usage** in Clerk Dashboard
5. **Implement features** from the "Future Enhancements" section

---

**Questions?** Check the main README.md or contact Clerk Support!


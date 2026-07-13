// Clerk Configuration
// ⚠️ SECURITY NOTE: Only the publishable key should be here
// NEVER commit the secret key to version control!

const CLERK_CONFIG = {
  publishableKey: window.AMRITA_CLERK_PUBLISHABLE_KEY || 'pk_test_Y29vbC1nb2JsaW4tMjkuY2xlcmsuYWNjb3VudHMuZGV2JA',
  signInUrl: '/login.html',
  signUpUrl: '/signup.html',
  afterSignInUrl: '/dashboard.html',
  afterSignUpUrl: '/dashboard.html',
};

async function loadClerk() {
  if (!window.Clerk) return null;
  await window.Clerk.load({ publishableKey: CLERK_CONFIG.publishableKey });
  return window.Clerk;
}

// Initialize Clerk (to be called in page load)
function initializeClerk() {
  if (window.Clerk) {
    loadClerk().then(() => {
      checkAuthStatus();
    });
  }
}

// Check authentication status
async function checkAuthStatus() {
  if (window.Clerk) {
    const session = await window.Clerk.session;
    const user = await window.Clerk.user;
    return { session, user };
  }
  return null;
}

// Get current user
async function getCurrentUser() {
  if (window.Clerk && window.Clerk.user) {
    return window.Clerk.user;
  }
  return null;
}

// Logout function
async function logoutUser() {
  if (window.Clerk) {
    await window.Clerk.signOut();
    window.location.href = '/login.html';
  }
}

// Redirect to login if not authenticated
async function requireAuth() {
  const auth = await checkAuthStatus();
  if (!auth || !auth.user) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

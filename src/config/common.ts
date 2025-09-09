export const STORE_NAME = "state";

// NETWORK
export const NETWORK_CONFIG = {
  HOST: import.meta.env.VITE_APP_URL,
  NEW_API_BASE_URL: import.meta.env.VITE_NEW_APP_URL,
  MIN_DEPOSIT: import.meta.env.VITE_MIN_DEPOSIT || 500,
  PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID,
  APTOS_API_KEY: import.meta.env.VITE_APTOS_CLIENT_API_KEY,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  REACT_GA_ID: "G-WKR7YJR3W9",
  ENABLE_FEATURE: import.meta.env.VITE_DISABLE_PRODUCTION_FEATURE !== "true",
};

export const ROUTES = {
  HOME: "/",
  VAULT: "/dashboard",
  LOGIN: "/login",
  USER_PROFILE: "/user-profile",
  NOT_FOUND: "/not-found",
  LEADERBOARD: "/leaderboard",
  EDIT_PROFILE: "/edit-profile",
  VERIFY: "/verify",
  MAINTAIN: "/maintain",
  UNSUPPORT: "/unsupported",
};

export const SOCIAL = {
  FACEBOOK: "https://www.facebook.com/profile.php?id=61572848954970",
  TELEGRAM: "https://t.me/MoneyFiHub",
  TWITTER: "https://x.com/MoneyFiHub",
  DISCORD: "https://discord.gg/NjSu7kJwuT",
};

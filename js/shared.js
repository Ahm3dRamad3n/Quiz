export function ShowLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.style.display = "flex";
  }
}
export function CloseLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
}

import "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-check-compat.js";

// 2. سحب الكائن من المتصفح
const firebase = window.firebase;

export const firebaseConfig = {
  apiKey: "AIzaSyD1T2YkT0bJ3-6xrqzGRafObRuln6ajYpg",
  authDomain: "interactive-quiz-platfor-1a676.firebaseapp.com",
  projectId: "interactive-quiz-platfor-1a676",
  storageBucket: "interactive-quiz-platfor-1a676.firebasestorage.app",
  messagingSenderId: "192993714442",
  appId: "1:192993714442:web:528534562bceff2e391af3",
  measurementId: "G-2KRYYZY7NR",
};

if (typeof firebase !== "undefined" && firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

if (window.location.hostname === "127.0.0.1") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

firebase
  .appCheck()
  .activate(
    new firebase.appCheck.ReCaptchaEnterpriseProvider(
      "6LdCfCstAAAAAK9zKRoSN-lepPmF7uXc_0MVFyTC",
    ),
    true,
  );

export const analytics =
  typeof firebase !== "undefined" ? firebase.analytics() : null;
export const auth = typeof firebase !== "undefined" ? firebase.auth() : null;

export const API_BASE_URL = "http://localhost:5154/api";
//export const API_BASE_URL = "https://quiz-backend.runasp.net/api";

export const themes = [
  { name: "🔵 أزرق بنفسجي", primary: "#667eea", secondary: "#764ba2" },
  { name: "🔴 أحمر برتقالي", primary: "#f44336", secondary: "#ff9800" },
  { name: "🟢 أخضر سماوي", primary: "#4caf50", secondary: "#00bcd4" },
  { name: "💗 وردي بنفسجي", primary: "#e91e63", secondary: "#9c27b0" },
  { name: "🔷 أزرق سماوي", primary: "#2196f3", secondary: "#00bcd4" },
  { name: "🟠 برتقالي أحمر", primary: "#ff6f00", secondary: "#d32f2f" },
  { name: "🌲 أخضر داكن", primary: "#1b5e20", secondary: "#388e3c" },
  { name: "💜 بنفسجي فاتح", primary: "#7b1fa2", secondary: "#c2185b" },
  { name: "🌊 أزرق داكن", primary: "#0d47a1", secondary: "#1565c0" },
  { name: "🏝️ تركواز", primary: "#00796b", secondary: "#00897b" },
  { name: "✨ ذهبي", primary: "#f57f17", secondary: "#ff6f00" },
  { name: "🌙 رمادي أزرق", primary: "#455a64", secondary: "#546e7a" },
  { name: "🖤 Dark - أسود", primary: "#1a1a1a", secondary: "#2d2d2d" },
  { name: "🌑 Dark - رمادي", primary: "#2c3e50", secondary: "#34495e" },
  { name: "🌃 Dark - أزرق داكن", primary: "#1e3a5f", secondary: "#2c5aa0" },
];

export async function apiFetch(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };

  if (options.body && typeof options.body === "object") {
    options.body = JSON.stringify(options.body);
  }

  try {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn(
        "No authenticated user found. Proceeding without auth token.",
      );
    }
  } catch (e) {
    console.error("Error getting auth token:", e);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export function getCurrentUser() {
  const user = firebase.auth().currentUser;
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "User",
    photoURL: user.photoURL || "",
  };
}

export function applyTheme(index) {
  const theme = themes[index];
  document.documentElement.style.setProperty("--primary", theme.primary);
  document.documentElement.style.setProperty("--secondary", theme.secondary);
  localStorage.setItem("selectedTheme", String(index));
}

export function loadTheme() {
  const savedTheme = localStorage.getItem("selectedTheme") || "0";
  applyTheme(parseInt(savedTheme, 10));
}

export function sanitizeImageUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(String(url), window.location.href);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch (e) {}
  return "";
}

export function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

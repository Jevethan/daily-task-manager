/**
 * Server entry point - routes all API requests
 * Base URL: https://monarch.hypeframe.ai/api
 */

import {
  register,
  login,
  googleLogin,
  sendOTP,
  verifyOTPEndpoint,
  refreshToken,
  logout,
  getCurrentUser,
} from "./auth-endpoints.js";
import {
  createDocumentEndpoint,
  readDocumentsEndpoint,
  updateDocumentEndpoint,
  deleteDocumentEndpoint,
  bulkOperations,
  getCollectionsEndpoint,
  getStatsEndpoint,
} from "./db-endpoints.js";
import {
  createCheckoutSessionEndpoint,
  createOneTimePaymentSessionEndpoint,
  cancelSubscriptionEndpoint,
  webhookEndpoint,
} from "./payment-endpoints.js";
import { trackEventEndpoint } from "./analytics-endpoints.js";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  };
}

function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Authentication APIs - all require X-API-Key header
    if (
      pathname === "/api/project-auth/register" &&
      request.method === "POST"
    ) {
      return await register(request, env);
    }

    if (pathname === "/api/project-auth/login" && request.method === "POST") {
      return await login(request, env);
    }

    if (
      pathname === "/api/project-auth/google-login" &&
      request.method === "POST"
    ) {
      return await googleLogin(request, env);
    }

    if (
      pathname === "/api/project-auth/otp/send" &&
      request.method === "POST"
    ) {
      return await sendOTP(request, env);
    }

    if (
      pathname === "/api/project-auth/otp/verify" &&
      request.method === "POST"
    ) {
      return await verifyOTPEndpoint(request, env);
    }

    if (pathname === "/api/project-auth/refresh" && request.method === "POST") {
      return await refreshToken(request, env);
    }

    if (pathname === "/api/project-auth/logout" && request.method === "POST") {
      return await logout(request, env);
    }

    if (pathname === "/api/project-auth/me" && request.method === "GET") {
      return await getCurrentUser(request, env);
    }

    // Database APIs - all require Authorization: Bearer <token> header
    if (pathname === "/api/project-db/create" && request.method === "POST") {
      return await createDocumentEndpoint(request, env);
    }

    if (pathname === "/api/project-db/read" && request.method === "GET") {
      return await readDocumentsEndpoint(request, env);
    }

    if (pathname === "/api/project-db/update" && request.method === "PUT") {
      return await updateDocumentEndpoint(request, env);
    }

    if (pathname === "/api/project-db/delete" && request.method === "DELETE") {
      return await deleteDocumentEndpoint(request, env);
    }

    if (pathname === "/api/project-db/bulk" && request.method === "POST") {
      return await bulkOperations(request, env);
    }

    if (
      pathname === "/api/project-db/collections" &&
      request.method === "GET"
    ) {
      return await getCollectionsEndpoint(request, env);
    }

    if (pathname === "/api/project-db/stats" && request.method === "GET") {
      return await getStatsEndpoint(request, env);
    }

    // Payment APIs
    if (
      pathname === "/api/project-payment/create-checkout-session" &&
      request.method === "POST"
    ) {
      return await createCheckoutSessionEndpoint(request, env);
    }

    if (
      pathname === "/api/project-payment/create-one-time-payment-session" &&
      request.method === "POST"
    ) {
      return await createOneTimePaymentSessionEndpoint(request, env);
    }

    if (
      pathname === "/api/project-payment/cancel-subscription" &&
      request.method === "POST"
    ) {
      return await cancelSubscriptionEndpoint(request, env);
    }

    if (
      pathname.startsWith("/api/project-payment/webhook/") &&
      request.method === "POST"
    ) {
      return await webhookEndpoint(request, env);
    }

    // Analytics APIs
    if (pathname === "/api/analytics/track" && request.method === "POST") {
      return await trackEventEndpoint(request, env);
    }

    // 404 for unmatched routes
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  },
};

/**
 * Payment API Endpoints
 */

import {
  createCheckoutSession,
  createOneTimePaymentSession,
  cancelSubscription,
  handleWebhook,
} from "./payment.js";
import {
  getBearerToken,
  verifyToken,
} from "./auth.js";
import { successResponse, errorResponse } from "./functions/response.js";

/**
 * POST /project-payment/create-checkout-session
 */
export async function createCheckoutSessionEndpoint(request, env) {
  try {
    // Auth: Bearer Token
    const token = getBearerToken(request);
    if (!token) return errorResponse("Authorization token required", 401);

    const payload = verifyToken(token);
    if (!payload) return errorResponse("Invalid token", 401);

    const body = await request.json();
    const { priceId, mode, successUrl, cancelUrl, metadata, planType } = body;

    // Add planType to metadata if present
    const finalMetadata = { ...metadata };
    if (planType) {
      finalMetadata.planType = planType;
    }

    const result = await createCheckoutSession({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      metadata: finalMetadata,
      userId: body.userId || payload.userId,
      email: body.email || payload.email,
      projectId: payload.projectId || "default",
      env,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /project-payment/create-one-time-payment-session
 */
export async function createOneTimePaymentSessionEndpoint(request, env) {
  try {
    // Auth: Bearer Token
    const token = getBearerToken(request);
    if (!token) return errorResponse("Authorization token required", 401);

    const payload = verifyToken(token);
    if (!payload) return errorResponse("Invalid token", 401);

    const body = await request.json();
    const { amount, currency, description, successUrl, cancelUrl, metadata } =
      body;

    const result = await createOneTimePaymentSession({
      amount,
      currency,
      description,
      successUrl,
      cancelUrl,
      metadata,
      userId: body.userId || payload.userId,
      email: body.email || payload.email,
      projectId: payload.projectId || "default",
      env,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /project-payment/cancel-subscription
 */
export async function cancelSubscriptionEndpoint(request, env) {
  try {
    // Auth: Bearer Token
    const token = getBearerToken(request);
    if (!token) return errorResponse("Authorization token required", 401);

    const payload = verifyToken(token);
    if (!payload) return errorResponse("Invalid token", 401);

    const body = await request.json();
    const { subscriptionId } = body;

    const result = await cancelSubscription(
      subscriptionId,
      payload.userId,
      payload.projectId || "default",
      env
    );

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /project-payment/webhook/:projectId
 */
export async function webhookEndpoint(request) {
  try {
    // Auth: Stripe Signature (Mocked here, but passed to controller)
    const signature = request.headers.get("stripe-signature");
    const url = new URL(request.url);
    const projectId = url.pathname.split("/").pop(); // Extract projectId from URL

    const body = await request.text(); // Webhooks need raw body for signature verification

    const result = await handleWebhook(signature, body, projectId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}

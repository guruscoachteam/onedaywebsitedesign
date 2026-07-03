import Stripe from "stripe";

const DEPOSIT_CENTS = 10000;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to Cloudflare." },
      503
    );
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const email = (data.email || "").trim();
  const fullName = (data.fullName || "").trim();
  const businessName = (data.businessName || "").trim();

  if (!email || !fullName || !businessName) {
    return jsonResponse({ error: "Name, email, and business name are required." }, 400);
  }

  const origin = new URL(request.url).origin;
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: DEPOSIT_CENTS,
            product_data: {
              name: "One Day Website Design — $100 Deposit",
              description:
                "Refundable deposit applied to your $999 website build. Delivered in 48 hours.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        fullName,
        businessName,
        phone: (data.phone || "").slice(0, 500),
        country: (data.country || "").slice(0, 500),
        city: (data.city || "").slice(0, 500),
        state: (data.state || "").slice(0, 500),
        serviceType: (data.serviceType || "").slice(0, 500),
        serviceArea: (data.serviceArea || "").slice(0, 500),
      },
      success_url: `${origin}/reserve/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/reserve/`,
    });

    return jsonResponse({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return jsonResponse({ error: "Could not start checkout. Please try again." }, 500);
  }
}

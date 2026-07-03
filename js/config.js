/**
 * Site configuration
 *
 * STRIPE (via Cloudflare Pages Function)
 * 1. Create a Stripe account at https://dashboard.stripe.com
 * 2. Add secrets to Cloudflare Pages:
 *      npx wrangler pages secret put STRIPE_SECRET_KEY --project-name=onedaywebsitedesign
 *      npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name=onedaywebsitedesign
 * 3. In Stripe Dashboard → Developers → Webhooks, add endpoint:
 *      https://onedaywebsitedesign.pages.dev/api/stripe-webhook
 *    Event: checkout.session.completed
 * 4. Use test keys (sk_test_...) first, then switch to live (sk_live_...) when ready.
 *
 * TURNSTILE (bot protection)
 * 1. Cloudflare Dashboard → Turnstile → Add widget
 * 2. Domains: onedaywebsitedesign.pages.dev, onedaywebsitedesign.co
 * 3. Paste Site Key below; add Secret Key to Cloudflare:
 *      npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name=onedaywebsitedesign
 */
window.SITE_CONFIG = {
  checkoutEndpoint: "/api/create-checkout",
  formspreeEndpoint: "https://formspree.io/f/mykqboaw",
  successPage: "/reserve/success.html",
  turnstileSiteKey: "0x4AAAAAADvHaczzlZiZw28C",
};

/**
 * Site configuration — update these before going live.
 *
 * WHOP CHECKOUT
 * 1. In Whop Dashboard → Checkout links → Create checkout link
 * 2. Set pricing to $100 one-time (your deposit product)
 * 3. Under "Redirect after checkout", set:
 *    https://onedaywebsitedesign.co/reserve/success.html
 * 4. Copy the checkout URL and paste it below.
 */
window.SITE_CONFIG = {
  whopCheckoutUrl: "https://whop.com/checkout/plan_REPLACE_ME",

  /**
   * Optional: Formspree endpoint to email yourself each submission.
   * Sign up at https://formspree.io → create a form → paste the endpoint URL.
   * Leave empty to skip (form data still saved in browser until payment).
   */
  formspreeEndpoint: "",

  successPage: "/reserve/success.html",
};

(function () {
  const form = document.getElementById("reserve-form");
  const submitBtn = document.getElementById("submit-btn");
  const domainFields = document.getElementById("domain-fields");
  const hasDomainRadios = form?.querySelectorAll('input[name="hasDomain"]');
  const config = window.SITE_CONFIG || {};
  let turnstileWidgetId = null;

  if (!form) return;

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  function isTurnstileConfigured() {
    const key = config.turnstileSiteKey || "";
    return key && !key.includes("REPLACE");
  }

  function initTurnstile() {
    if (!isTurnstileConfigured()) return;

    const container = document.getElementById("turnstile-widget");
    if (!container) return;

    function renderWidget() {
      if (!window.turnstile || turnstileWidgetId !== null) return;
      turnstileWidgetId = window.turnstile.render(container, {
        sitekey: config.turnstileSiteKey,
        theme: "light",
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      window.addEventListener("load", renderWidget);
    }
  }

  function getTurnstileToken() {
    if (!isTurnstileConfigured()) return "";
    if (!window.turnstile || turnstileWidgetId === null) return "";
    return window.turnstile.getResponse(turnstileWidgetId) || "";
  }

  function resetTurnstile() {
    if (!window.turnstile || turnstileWidgetId === null) return;
    window.turnstile.reset(turnstileWidgetId);
  }

  function toggleDomainFields() {
    const selected = form.querySelector('input[name="hasDomain"]:checked');
    const show = selected && selected.value === "yes";
    if (domainFields) {
      domainFields.hidden = !show;
      const domainInput = domainFields.querySelector('input[name="domainName"]');
      if (domainInput) domainInput.required = show;
    }
  }

  hasDomainRadios?.forEach(function (radio) {
    radio.addEventListener("change", toggleDomainFields);
  });
  toggleDomainFields();
  initTurnstile();

  function getFormData() {
    const data = new FormData(form);
    const obj = {};
    data.forEach(function (value, key) {
      obj[key] = value;
    });
    obj.submittedAt = new Date().toISOString();
    return obj;
  }

  function validateForm() {
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    if (isTurnstileConfigured() && !getTurnstileToken()) {
      alert("Please complete the security check before continuing.");
      return false;
    }

    return true;
  }

  async function sendToFormspree(data) {
    const endpoint = config.formspreeEndpoint;
    if (!endpoint) return true;

    const body = new FormData();
    Object.entries(data).forEach(function ([key, value]) {
      body.append(key, value);
    });
    body.append("_subject", "New build reservation: " + (data.businessName || data.fullName));

    const response = await fetch(endpoint, {
      method: "POST",
      body: body,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Could not save your project brief. Please try again.");
    }
    return true;
  }

  async function createStripeCheckout(data) {
    const endpoint = config.checkoutEndpoint || "/api/create-checkout";
    const payload = Object.assign({}, data, {
      turnstileToken: getTurnstileToken(),
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(function () {
      return {};
    });

    if (!response.ok || !result.url) {
      throw new Error(result.error || "Could not start secure checkout. Please try again.");
    }

    return result.url;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!validateForm()) return;

    const data = getFormData();
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying…";

    try {
      submitBtn.textContent = "Saving your brief…";
      const checkoutUrl = await createStripeCheckout(data);

      sessionStorage.setItem("odwd_reservation", JSON.stringify(data));
      await sendToFormspree(data);

      submitBtn.textContent = "Redirecting to secure checkout…";
      window.location.href = checkoutUrl;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Continue to payment — $100 deposit →";
      resetTurnstile();
      alert(err.message || "Something went wrong. Please try again.");
    }
  });
})();

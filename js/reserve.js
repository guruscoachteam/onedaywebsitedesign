(function () {
  const form = document.getElementById("reserve-form");
  const submitBtn = document.getElementById("submit-btn");
  const domainFields = document.getElementById("domain-fields");
  const hasDomainRadios = form?.querySelectorAll('input[name="hasDomain"]');
  const config = window.SITE_CONFIG || {};

  if (!form) return;

  // Mobile nav (shared pattern)
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

    const whopUrl = config.whopCheckoutUrl || "";
    if (!whopUrl || whopUrl.includes("REPLACE_ME")) {
      alert(
        "Payment is not configured yet. Add your Whop checkout URL in js/config.js."
      );
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

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!validateForm()) return;

    const data = getFormData();
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving your brief…";

    try {
      sessionStorage.setItem("odwd_reservation", JSON.stringify(data));
      await sendToFormspree(data);

      submitBtn.textContent = "Redirecting to payment…";
      window.location.href = config.whopCheckoutUrl;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Continue to payment — $100 deposit →";
      alert(err.message || "Something went wrong. Please try again.");
    }
  });
})();

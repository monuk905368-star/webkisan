// ==========================================================================
// Kisan Union — shared site behaviour (nav, small helpers)
// ==========================================================================

(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav when a link is chosen
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Utility: put a real 10-digit mobile number validator on any input
  // with [data-validate="mobile"], showing a friendly inline error.
  document.querySelectorAll('[data-validate="mobile"]').forEach(function (input) {
    input.addEventListener('blur', function () {
      validateMobileField(input);
    });
  });

  window.validateMobileField = function (input) {
    var field = input.closest('.field');
    if (!field) return true;
    var value = input.value.trim();
    var ok = /^[6-9]\d{9}$/.test(value);
    field.classList.toggle('has-error', !ok);
    return ok;
  };

  // Simple button loading-state helper used across pages
  window.setButtonLoading = function (btn, isLoading) {
    if (!btn) return;
    btn.classList.toggle('is-loading', isLoading);
    btn.disabled = isLoading;
  };
})();

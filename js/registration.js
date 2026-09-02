// ==========================================================================
// Kisan Union — member registration (4-step form, frontend-only prototype)
//
// Duplicate-membership check: this prototype uses the applicant's mobile
// number as the unique key (one membership per mobile number) instead of
// collecting any government ID number. This is a frontend-only demo —
// registered numbers are kept in this browser's local storage so the
// duplicate check has something to compare against. A real deployment
// would run this check against the Union's actual member database.
// ==========================================================================

(function () {
  var form = document.getElementById('registrationForm');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.form-step'));
  var progressSteps = Array.prototype.slice.call(document.querySelectorAll('.progress-steps .p-step'));
  var current = 0;

  var nextButtons = document.querySelectorAll('[data-action="next-step"]');
  var backButtons = document.querySelectorAll('[data-action="prev-step"]');
  var submitBtn = document.getElementById('submitApplicationBtn');

  var mobileInput = document.getElementById('mobile');
  var mobileErrorMsg = document.getElementById('mobileErrorMsg');

  // ------------------------------------------------------------------
  // Duplicate-mobile check (demo data lives in localStorage)
  // ------------------------------------------------------------------
  var REGISTERED_KEY = 'ku_registered_mobiles';
  var SEED_MOBILES = ['9876543210', '9988776655', '9123456780'];

  function loadRegisteredMobiles() {
    try {
      var raw = localStorage.getItem(REGISTERED_KEY);
      if (!raw) {
        localStorage.setItem(REGISTERED_KEY, JSON.stringify(SEED_MOBILES));
        return SEED_MOBILES.slice();
      }
      return JSON.parse(raw);
    } catch (err) {
      return SEED_MOBILES.slice();
    }
  }

  function isMobileAlreadyRegistered(mobile) {
    return loadRegisteredMobiles().indexOf(mobile) > -1;
  }

  function markMobileAsRegistered(mobile) {
    try {
      var list = loadRegisteredMobiles();
      if (list.indexOf(mobile) === -1) {
        list.push(mobile);
        localStorage.setItem(REGISTERED_KEY, JSON.stringify(list));
      }
    } catch (err) { /* localStorage unavailable — continue anyway */ }
  }

  function checkMobileField() {
    if (!mobileInput) return true;
    var field = mobileInput.closest('.field');
    var value = mobileInput.value.trim();
    var formatOk = /^[6-9]\d{9}$/.test(value);

    if (!formatOk) {
      field.classList.add('has-error');
      mobileErrorMsg.textContent = 'Please enter a valid 10-digit mobile number.';
      return false;
    }
    if (isMobileAlreadyRegistered(value)) {
      field.classList.add('has-error');
      mobileErrorMsg.innerHTML = 'A Kisan Union membership already exists for this mobile number. <a href="check-membership.html">Check your membership status</a> instead of registering again.';
      return false;
    }
    field.classList.remove('has-error');
    return true;
  }

  if (mobileInput) {
    mobileInput.addEventListener('blur', checkMobileField);
    mobileInput.addEventListener('input', function () {
      mobileInput.closest('.field').classList.remove('has-error');
    });
  }

  function showStep(index) {
    steps.forEach(function (step, i) {
      step.classList.toggle('active', i === index);
    });
    progressSteps.forEach(function (el, i) {
      el.classList.toggle('done', i < index);
      el.classList.toggle('active', i === index);
    });
    if (index === steps.length - 1) {
      buildSummary();
    }
    window.scrollTo({ top: form.offsetTop - 90, behavior: 'smooth' });
  }

  function requiredFieldsFor(stepEl) {
    return Array.prototype.slice.call(stepEl.querySelectorAll('[required]'));
  }

  function validateStep(stepEl) {
    var valid = true;
    requiredFieldsFor(stepEl).forEach(function (input) {
      var field = input.closest('.field') || input.closest('.field-row') || input.parentElement;
      var ok = true;

      if (input.type === 'radio') {
        var group = stepEl.querySelectorAll('[name="' + input.name + '"]');
        ok = Array.prototype.some.call(group, function (r) { return r.checked; });
        var wrap = stepEl.querySelector('[data-group="' + input.name + '"]');
        if (wrap) wrap.classList.toggle('has-error', !ok);
      } else if (input.type === 'checkbox') {
        ok = input.checked;
        var f = input.closest('.field');
        if (f) f.classList.toggle('has-error', !ok);
      } else if (input.id === 'mobile') {
        ok = checkMobileField();
      } else {
        ok = input.value.trim().length > 0;
        if (field && field.classList) {
          field.classList.toggle('has-error', !ok);
        }
      }
      if (!ok) valid = false;
    });
    return valid;
  }

  nextButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!validateStep(steps[current])) return;
      if (current < steps.length - 1) {
        current += 1;
        showStep(current);
      }
    });
  });

  backButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (current > 0) {
        current -= 1;
        showStep(current);
      }
    });
  });

  function val(name) {
    var field = form.querySelector('[name="' + name + '"]:checked, [name="' + name + '"]');
    return field ? field.value : '';
  }

  function buildSummary() {
    var map = {
      sum_fullName: 'fullName',
      sum_relativeName: 'relativeName',
      sum_dob: 'dob',
      sum_gender: 'gender',
      sum_mobile: 'mobile',
      sum_village: 'village',
      sum_tehsil: 'tehsil',
      sum_district: 'district',
      sum_state: 'state',
      sum_address: 'address'
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = val(map[id]) || '—';
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(steps[current])) return;

    // Final safety net: re-check the mobile number right before submitting,
    // in case someone jumped back to step 1 and changed it after step 4
    // was already validated.
    if (!checkMobileField()) {
      current = 0;
      showStep(current);
      return;
    }

    setButtonLoading(submitBtn, true);

    // Frontend-only prototype: simulate a submission and generate a dummy
    // application ID. No real data is stored or sent anywhere except the
    // mobile number, which is kept locally so the duplicate check works.
    setTimeout(function () {
      var id = 'KU-' + Math.floor(100000 + Math.random() * 899999);
      var mobile = val('mobile');
      markMobileAsRegistered(mobile);
      try {
        sessionStorage.setItem('ku_last_application_id', id);
        sessionStorage.setItem('ku_last_applicant_name', val('fullName'));
      } catch (err) { /* sessionStorage unavailable — continue anyway */ }
      window.location.href = 'submitted.html';
    }, 900);
  });

  showStep(0);
})();


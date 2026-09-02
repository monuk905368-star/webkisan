// ==========================================================================
// Kisan Union — admin dashboard, member management, application review
// Frontend prototype only — all data below is dummy/placeholder data.
// ==========================================================================

var KU_DUMMY_MEMBERS = [
  { id: 'KU-100231', name: 'Ramesh Kumar', village: 'Bhagta Bhai Ka', district: 'Bathinda', status: 'verified' },
  { id: 'KU-100230', name: 'Sukhwinder Singh', village: 'Maur Mandi', district: 'Bathinda', status: 'pending' },
  { id: 'KU-100229', name: 'Anita Devi', village: 'Rampura Phul', district: 'Bathinda', status: 'verified' },
  { id: 'KU-100228', name: 'Balwinder Kaur', village: 'Talwandi Sabo', district: 'Bathinda', status: 'rejected' },
  { id: 'KU-100227', name: 'Harpreet Singh', village: 'Nathana', district: 'Bathinda', status: 'pending' },
  { id: 'KU-100226', name: 'Suresh Chand', village: 'Goniana', district: 'Bathinda', status: 'suspended' },
  { id: 'KU-100225', name: 'Manjeet Kaur', village: 'Sangat', district: 'Bathinda', status: 'verified' }
];

// ---------------------------------------------------------------------
// Dashboard stats + login gate
//
// Frontend-only prototype: the credentials below are hardcoded in this
// file purely to demo the login flow. There is no real authentication
// server yet, so this is not secure — anyone who can view this file can
// see the password. A real deployment must replace this with a proper
// backend login before going live.
// ---------------------------------------------------------------------
var KU_ADMIN_USERNAME = 'kisan.union';
var KU_ADMIN_PASSWORD = 'kisan@123';
var KU_ADMIN_SESSION_KEY = 'ku_admin_logged_in';

(function () {
  var loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    var btn = document.getElementById('adminLoginBtn');
    var errorBox = document.getElementById('adminLoginError');

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var username = document.getElementById('adminUsername').value.trim();
      var password = document.getElementById('adminPassword').value;

      if (errorBox) errorBox.style.display = 'none';
      setButtonLoading(btn, true);

      setTimeout(function () {
        if (username === KU_ADMIN_USERNAME && password === KU_ADMIN_PASSWORD) {
          try { sessionStorage.setItem(KU_ADMIN_SESSION_KEY, 'true'); } catch (err) { /* continue anyway */ }
          window.location.href = 'admin-dashboard.html';
        } else {
          setButtonLoading(btn, false);
          if (errorBox) errorBox.style.display = 'block';
        }
      }, 700);
    });
  }
})();

// ---------------------------------------------------------------------
// Guard: keep the admin pages behind the login above. Anyone who opens
// admin-dashboard.html, members.html, or application-review.html
// directly without logging in first gets sent back to admin-login.html.
// ---------------------------------------------------------------------
(function () {
  if (!document.body.classList.contains('admin-shell')) return;
  if (document.getElementById('adminLoginForm')) return; // login page itself

  var loggedIn = false;
  try { loggedIn = sessionStorage.getItem(KU_ADMIN_SESSION_KEY) === 'true'; } catch (err) { /* assume false */ }

  if (!loggedIn) {
    window.location.href = 'admin-login.html';
  }
})();

// ---------------------------------------------------------------------
// Log out — clears the session flag set at login
// ---------------------------------------------------------------------
(function () {
  var logoutLinks = document.querySelectorAll('a.logout');
  logoutLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      try { sessionStorage.removeItem(KU_ADMIN_SESSION_KEY); } catch (err) { /* continue anyway */ }
    });
  });
})();

// ---------------------------------------------------------------------
// Members directory (search + filter)
// ---------------------------------------------------------------------
(function () {
  var list = document.getElementById('memberList');
  if (!list) return;

  var searchInput = document.getElementById('memberSearch');
  var chips = document.querySelectorAll('.filter-chip');
  var activeFilter = 'all';

  function initials(name) {
    return name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
  }

  function statusLabel(s) {
    return { verified: 'Verified', pending: 'Pending', rejected: 'Rejected', suspended: 'Suspended' }[s] || s;
  }

  function render() {
    var query = (searchInput.value || '').trim().toLowerCase();
    var rows = KU_DUMMY_MEMBERS.filter(function (m) {
      var matchesFilter = activeFilter === 'all' || m.status === activeFilter;
      var matchesQuery = !query ||
        m.name.toLowerCase().indexOf(query) > -1 ||
        m.id.toLowerCase().indexOf(query) > -1 ||
        m.village.toLowerCase().indexOf(query) > -1;
      return matchesFilter && matchesQuery;
    });

    if (rows.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>No members match your search. Try a different name, ID, or village.</p></div>';
      return;
    }

    list.innerHTML = rows.map(function (m) {
      return (
        '<div class="member-card">' +
        '<div class="who">' +
        '<div class="initials">' + initials(m.name) + '</div>' +
        '<div><div class="name">' + m.name + '</div>' +
        '<div class="meta">' + m.id + ' &middot; ' + m.village + ', ' + m.district + '</div></div>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:12px;">' +
        '<span class="status-badge ' + m.status + '">' + statusLabel(m.status) + '</span>' +
        '<a class="btn btn-outline" style="min-height:auto; padding:9px 16px;" href="application-review.html">View Details</a>' +
        '</div>' +
        '</div>'
      );
    }).join('');
  }

  searchInput.addEventListener('input', render);
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      activeFilter = chip.getAttribute('data-filter');
      render();
    });
  });

  render();
})();

// ---------------------------------------------------------------------
// Application review — approve / reject / request correction
// ---------------------------------------------------------------------
(function () {
  var approveBtn = document.getElementById('approveBtn');
  var rejectBtn = document.getElementById('rejectBtn');
  var correctionBtn = document.getElementById('correctionBtn');
  if (!approveBtn && !rejectBtn && !correctionBtn) return;

  var approveModal = document.getElementById('approveModal');
  var rejectModal = document.getElementById('rejectModal');

  function openModal(modal) { modal.classList.add('open'); }
  function closeModal(modal) { modal.classList.remove('open'); }

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal(btn.closest('.modal-overlay'));
    });
  });

  if (approveBtn) {
    approveBtn.addEventListener('click', function () { openModal(approveModal); });
  }
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () { openModal(rejectModal); });
  }
  if (correctionBtn) {
    correctionBtn.addEventListener('click', function () {
      correctionBtn.textContent = 'Correction requested';
      correctionBtn.disabled = true;
    });
  }

  var confirmApprove = document.getElementById('confirmApproveBtn');
  if (confirmApprove) {
    confirmApprove.addEventListener('click', function () {
      setButtonLoading(confirmApprove, true);
      setTimeout(function () {
        closeModal(approveModal);
        document.getElementById('reviewStatusNote').innerHTML =
          '<span class="status-badge verified">&#10003; Approved</span> Member has been verified.';
        setButtonLoading(confirmApprove, false);
      }, 600);
    });
  }

  var confirmReject = document.getElementById('confirmRejectBtn');
  if (confirmReject) {
    confirmReject.addEventListener('click', function () {
      var reasonChecked = document.querySelector('input[name="rejectReason"]:checked');
      var warn = document.getElementById('rejectReasonWarning');
      if (!reasonChecked) {
        warn.hidden = false;
        return;
      }
      warn.hidden = true;
      setButtonLoading(confirmReject, true);
      setTimeout(function () {
        closeModal(rejectModal);
        document.getElementById('reviewStatusNote').innerHTML =
          '<span class="status-badge rejected">Rejected</span> Reason: ' + reasonChecked.value;
        setButtonLoading(confirmReject, false);
      }, 600);
    });
  }
})();

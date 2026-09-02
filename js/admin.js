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
// ---------------------------------------------------------------------
(function () {
  var loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    var btn = document.getElementById('adminLoginBtn');
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      setButtonLoading(btn, true);
      // Frontend-only placeholder: real authentication is connected later.
      setTimeout(function () {
        window.location.href = 'admin-dashboard.html';
      }, 700);
    });
  }
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

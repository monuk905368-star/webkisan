// ==========================================================================
// Kisan Union — check membership (dummy data lookup, frontend prototype)
// ==========================================================================

(function () {
  var form = document.getElementById('checkMembershipForm');
  if (!form) return;

  var input = document.getElementById('membershipIdInput');
  var btn = document.getElementById('checkStatusBtn');
  var resultBox = document.getElementById('membershipResult');
  var skeleton = document.getElementById('membershipSkeleton');

  // Dummy directory used only to demonstrate each result state.
  var DUMMY_RECORDS = {
    'KU-100001': { status: 'verified', name: 'Verified Member', village: 'Sample Village', district: 'Sample District' },
    'KU-100002': { status: 'pending' },
    'KU-100003': { status: 'rejected' },
    'KU-100004': { status: 'suspended' }
  };

  var TEMPLATES = {
    verified: function (rec) {
      return (
        '<div class="result-state">' +
        checkIcon('good') +
        '<span class="status-badge verified">&#10003; VERIFIED</span>' +
        '<h3 style="margin-top:14px;">Verified Kisan Union Member</h3>' +
        '<div class="summary-grid" style="text-align:left; max-width:360px; margin:18px auto 0;">' +
        '<div class="summary-item"><div class="k">Member ID</div><div class="v">' + rec.id + '</div></div>' +
        '<div class="summary-item"><div class="k">Status</div><div class="v">Active</div></div>' +
        '</div>' +
        '<p style="margin-top:16px; font-size:0.85rem;">For member privacy, only membership status is shown here — not personal contact details.</p>' +
        '</div>'
      );
    },
    pending: function (rec) {
      return (
        '<div class="result-state">' +
        checkIcon('warn') +
        '<span class="status-badge pending">Pending Verification</span>' +
        '<h3 style="margin-top:14px;">Application under review</h3>' +
        '<p>This membership ID has been submitted and is waiting for review by an authorized Union representative.</p>' +
        '</div>'
      );
    },
    rejected: function (rec) {
      return (
        '<div class="result-state">' +
        checkIcon('bad') +
        '<span class="status-badge rejected">Rejected</span>' +
        '<h3 style="margin-top:14px;">Application was not approved</h3>' +
        '<p>Please contact the Head Union for details on next steps or to correct and resubmit your application.</p>' +
        '<a class="btn btn-outline" href="contact.html">Contact Head Union</a>' +
        '</div>'
      );
    },
    suspended: function (rec) {
      return (
        '<div class="result-state">' +
        checkIcon('brown') +
        '<span class="status-badge suspended">Suspended</span>' +
        '<h3 style="margin-top:14px;">Membership currently suspended</h3>' +
        '<p>Please contact the Head Union to learn how to restore this membership.</p>' +
        '<a class="btn btn-outline" href="contact.html">Contact Head Union</a>' +
        '</div>'
      );
    },
    'not-found': function () {
      return (
        '<div class="result-state">' +
        checkIcon('muted') +
        '<span class="status-badge not-found">Not Found</span>' +
        '<h3 style="margin-top:14px;">No membership found with that ID</h3>' +
        '<p>Please double-check the Membership ID and try again. It looks like <strong>KU-123456</strong>.</p>' +
        '</div>'
      );
    }
  };

  function checkIcon(kind) {
    var colors = { good: '#2E6B3E', warn: '#A15A06', bad: '#A23B2C', brown: '#6B4423', muted: '#8A8A78' };
    var c = colors[kind] || colors.muted;
    return (
      '<svg class="icon-lg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="32" cy="32" r="30" fill="' + c + '" fill-opacity="0.12"/>' +
      '<circle cx="32" cy="32" r="22" fill="' + c + '"/>' +
      '<path d="M22 32.5l7 7 13-14" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = input.value.trim().toUpperCase();

    if (!raw) {
      input.closest('.field').classList.add('has-error');
      return;
    }
    input.closest('.field').classList.remove('has-error');

    setButtonLoading(btn, true);
    resultBox.hidden = true;
    skeleton.hidden = false;

    setTimeout(function () {
      setButtonLoading(btn, false);
      skeleton.hidden = true;

      var record = DUMMY_RECORDS[raw];
      var html;
      if (record) {
        record.id = raw;
        html = TEMPLATES[record.status](record);
      } else {
        html = TEMPLATES['not-found']();
      }
      resultBox.innerHTML = html;
      resultBox.hidden = false;
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 700);
  });
})();

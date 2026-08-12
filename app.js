(function () {
  'use strict';

  // ─── Breakdown data for modal ───
  const BREAKDOWNS = {
    knowledge: '5 Books (₹400) • Drawing Pads (₹300) • Crayons & Stationery (₹300)',
    nutrition: 'Hot meals for 30 kids (₹1,800) • Fresh fruits (₹500) • Serving & logistics (₹200)',
    sports: 'Footballs (₹1,200) • Cricket bats (₹1,500) • Badminton sets (₹1,500) • Pumps & accessories (₹800)',
    'beach-football': 'Beach rental (₹2,000) • Jerseys (₹1,500) • Trophies (₹800) • Snacks (₹1,200) • Referee & photography (₹2,000)',
    cricket: 'Ground booking (₹2,500) • Full gear (₹2,000) • Refreshments (₹1,500) • Match awards (₹1,500) • Photography (₹1,000)',
    music: 'Instrument rental (₹2,000) • Instructor (₹1,500) • Open mic setup (₹1,000) • Food (₹1,500)',
    drama: 'Costumes & props (₹2,000) • Drama coach (₹2,000) • Stage setup (₹1,500) • Snacks (₹1,000)',
    standup: 'Professional performer (₹2,500) • Sound system (₹1,000) • Gift bags (₹1,000) • Venue & logistics (₹500)',
  };

  // ─── DOM refs ───
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');
  const checkoutModal = document.getElementById('checkout-modal');
  const certModal = document.getElementById('cert-modal');
  const checkoutForm = document.getElementById('checkout-form');
  const GOOGLE_SHEET_URL =
    'https://script.google.com/macros/s/AKfycbydWiCvJwR5lH-3sNXVSFvauN8ZEv0u1OQKZJmSvlrOzBFsPh40QIs1PGR4AxLJfT-0/exec';

  // ─── Header scroll effect ───
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─── Mobile menu ───
  menuToggle.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden', isOpen);
    iconOpen.classList.toggle('hidden', !isOpen);
    iconClose.classList.toggle('hidden', isOpen);
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ─── Smooth scrolling for anchor links ───
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ─── Event category filtering ───
  const filterTabs = document.querySelectorAll('.filter-tab');
  const eventCards = document.querySelectorAll('.event-card');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      eventCards.forEach((card) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;
        card.classList.toggle('hidden-by-filter', !show);
      });
    });
  });

  // ─── Checkout modal ───
  let currentSelection = null;

  function formatPrice(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
  }

  function openCheckoutModal(card) {
    const type = card.dataset.type;
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = card.dataset.price;
    const duration = card.dataset.duration || null;

    const attendCheckbox = card.querySelector('.attend-checkbox');
    const wantsAttend = attendCheckbox ? attendCheckbox.checked : false;

    currentSelection = { type, id, name, price, duration, wantsAttend };

    document.getElementById('modal-type-badge').textContent =
      type === 'pack' ? 'Micro-Donation Pack' : 'Event Sponsorship';
    document.getElementById('modal-title').textContent = name;
    document.getElementById('modal-subtitle').textContent =
      type === 'pack'
        ? 'Your pack will be delivered and documented with photo proof.'
        : duration
          ? `${duration} experience • Fully managed by our team`
          : 'Fully managed experience by our team';
    document.getElementById('modal-price').textContent = formatPrice(price);
    document.getElementById('modal-breakdown').textContent =
      BREAKDOWNS[id] || 'Transparent cost breakdown available upon request.';

    // Attendance options
    const attendLiveOption = document.getElementById('attend-live-option');
    const videoRadio = checkoutForm.querySelector('input[value="video"]');
    const liveRadio = checkoutForm.querySelector('input[value="live"]');

    if (type === 'pack') {
      attendLiveOption.classList.add('hidden');
      videoRadio.checked = true;
    } else {
      attendLiveOption.classList.remove('hidden');
      if (wantsAttend) {
        liveRadio.checked = true;
      } else {
        videoRadio.checked = true;
      }
    }

    checkoutModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('donor-name').focus();
  }

  function closeCheckoutModal() {
    checkoutModal.classList.add('hidden');
    document.body.style.overflow = '';
    currentSelection = null;
  }

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-type]');
      if (card) openCheckoutModal(card);
    });
  });

  checkoutModal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeCheckoutModal);
  });

  // ─── Certificate modal ───
  const certPreviewBtn = document.getElementById('cert-preview-btn');

  function openCertModal() {
    certModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCertModal() {
    certModal.classList.add('hidden');
    if (checkoutModal.classList.contains('hidden')) {
      document.body.style.overflow = '';
    }
  }

  certPreviewBtn.addEventListener('click', openCertModal);
  certModal.querySelectorAll('[data-close-cert]').forEach((el) => {
    el.addEventListener('click', closeCertModal);
  });

  // ─── Form submit to Google Sheets ───
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(checkoutForm);
    const name = formData.get('name');
    const selection = currentSelection ? { ...currentSelection } : {};
    const selectionName = selection.name || 'your enquiry';
    const submitButton = checkoutForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    const payload = {
      timestamp: new Date().toISOString(),
      type: selection.type || '',
      selectionId: selection.id || '',
      selectionName,
      price: selection.price ? formatPrice(selection.price) : '',
      name: name || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      dedication: formData.get('dedication') || '',
      attendance: formData.get('attendance') || 'video',
      status: 'New Lead',
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Sending enquiry...';

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      closeCheckoutModal();
      checkoutForm.reset();

      const msg = document.createElement('div');
      msg.className =
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-secondary text-white px-6 py-4 rounded-2xl shadow-card text-sm font-semibold max-w-sm text-center';
      msg.textContent = `Thank you, ${name}! We received your enquiry for ${selectionName}. Our team will call you soon.`;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 5000);
    } catch (error) {
      const msg = document.createElement('div');
      msg.className =
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-card text-sm font-semibold max-w-sm text-center';
      msg.textContent = 'Something went wrong. Please try again or contact us directly.';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 5000);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  // ─── Escape key closes modals ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!checkoutModal.classList.contains('hidden')) closeCheckoutModal();
      if (!certModal.classList.contains('hidden')) closeCertModal();
    }
  });

  // ─── Animated stat counters ───
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    const proofSection = document.getElementById('proof');
    const rect = proofSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.85) return;

    countersAnimated = true;

    statNumbers.forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1500;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();
})();

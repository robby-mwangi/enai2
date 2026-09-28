/* ==========================================================================
   ENAIBORR MEATS — SCRIPT
   Sections: Splash (video) · Mobile nav · Active nav link · Menu filters
             · Preview carousel · Footer year
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Splash intro (with video) ---------- */
  const splash = document.getElementById('splash');
  const video = document.getElementById('splashVideo');
  const skipBtn = document.getElementById('skipIntro');
  const playBtn = document.getElementById('playIntro');
  const soundBtn = document.getElementById('splashSound');
  const splashArrow = document.getElementById('splashArrow');

  const hideSplash = () => {
    if (!splash || splash.classList.contains('hidden')) return;
    if (video) video.pause();
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 600);
    try { sessionStorage.setItem('enaiborrIntroSeen', '1'); } catch (e) { /* storage unavailable */ }
  };

  if (splash) {
    let seen = false;
    try { seen = sessionStorage.getItem('enaiborrIntroSeen') === '1'; } catch (e) { /* ignore */ }

    // Skip the intro for returning visitors and for deep links (e.g. site.com/#menu-full)
    if (seen || window.location.hash) {
      splash.classList.add('hidden');
    } else {
      document.body.classList.add('no-scroll');

      // Discourage saving: no right-click menu on the splash
      splash.addEventListener('contextmenu', e => e.preventDefault());

      let videoFailed = false;
      if (video) {
        // The error event fires on the <source> children, so listen in the capture phase
        video.addEventListener('error', () => { videoFailed = true; }, true);
        video.addEventListener('ended', hideSplash);   // enter the site when the video finishes
      }

      // Play button: start the video with sound, or just enter the site if there's no video
      if (playBtn) {
        playBtn.addEventListener('click', async () => {
          if (!video || videoFailed) return hideSplash();
          try {
            video.muted = false;
            await video.play();
            splash.classList.add('playing');
            if (soundBtn) soundBtn.firstElementChild.className = 'fas fa-volume-up';
          } catch (err) {
            hideSplash();   // playback blocked or failed, so don't trap the visitor
          }
        });
      }

      // Sound toggle
      if (soundBtn && video) {
        soundBtn.addEventListener('click', () => {
          video.muted = !video.muted;
          soundBtn.firstElementChild.className = video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        });
      }

      // Skip and the down arrow both enter the site
      [skipBtn, splashArrow].forEach(el => { if (el) el.addEventListener('click', hideSplash); });
    }
  }

  /* ---------- 2. Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      mainNav.classList.toggle('open');
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mainNav.classList.remove('open');
      });
    });
  }

  /* ---------- 3. Highlight current section in nav ---------- */
  const navLinks = document.querySelectorAll('.main-nav a');
  const sectionMap = {
    'home': '#home',
    'menu-preview': '#menu-preview',
    'menu-full': '#menu-preview',   // full menu also lights up "Our Menu"
    'craft': '#craft',
    'experience': '#craft',
    'heritage': '#heritage',
    'visit': '#visit'
  };

  const setActiveLink = (href) => {
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === href));
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && sectionMap[entry.target.id]) {
          setActiveLink(sectionMap[entry.target.id]);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    Object.keys(sectionMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---------- 4. Menu filters (defined before the carousel, which uses it) ---------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');

  const applyFilter = (filter) => {
    filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    menuItems.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('hidden', !show);
    });
  };

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  /* ---------- 5. Menu preview carousel ---------- */
  const grid = document.getElementById('previewGrid');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('previewDots');

  if (grid) {
    const cards = Array.from(grid.querySelectorAll('.preview-card'));

    const cardStep = () => {
      const card = cards[0];
      return card ? card.getBoundingClientRect().width + 16 : 260; // card width + gap (1rem)
    };

    // Arrows
    if (prevBtn) prevBtn.addEventListener('click', () => grid.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => grid.scrollBy({ left: cardStep(), behavior: 'smooth' }));

    // Dots (one per card)
    if (dotsWrap) {
      cards.forEach((card, i) => {
        const dot = document.createElement('span');
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Go to item ${i + 1}`);
        dot.addEventListener('click', () => grid.scrollTo({ left: card.offsetLeft - grid.offsetLeft, behavior: 'smooth' }));
        dotsWrap.appendChild(dot);
      });

      const dots = Array.from(dotsWrap.children);
      const updateDots = () => {
        const maxScroll = grid.scrollWidth - grid.clientWidth;
        let index = 0;
        if (maxScroll > 0) {
          index = Math.round((grid.scrollLeft / maxScroll) * (cards.length - 1));
        }
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
      };

      grid.addEventListener('scroll', () => window.requestAnimationFrame(updateDots), { passive: true });
      window.addEventListener('resize', updateDots);
      updateDots();
    }

    // Clicking a preview card jumps to the full menu with that category selected
    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.filter) applyFilter(card.dataset.filter);
      });
    });
  }

  /* ---------- 6. Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
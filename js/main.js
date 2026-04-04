/* ═══════════════════════════════════════
   VITALII UZUN — PORTFOLIO
   main.js
═══════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     1. GSAP SETUP
  ───────────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance — label → stat → subtitle → name → buttons, 80ms apart
    var heroEls = ['.hero__label', '.hero__stat-wrap', '.hero__subtitle', '.hero__name', '.hero__buttons'];
    var heroTl = gsap.timeline({ delay: 0.1 });
    heroEls.forEach(function (sel, i) {
      heroTl.fromTo(
        sel,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        i * 0.08
      );
    });

    // Scroll reveal — visual hierarchy by element type
    gsap.utils.toArray('.reveal').forEach(function (el) {
      var tag = el.tagName;
      var isHeading = /^H[1-6]$/.test(tag);
      var isCaption = el.classList.contains('section-label') || tag === 'BLOCKQUOTE';
      var duration  = isHeading ? 0.5 : isCaption ? 0.9 : 0.8;
      var yDistance = isHeading ? 30  : isCaption ? 15  : 20;

      gsap.fromTo(
        el,
        { opacity: 0, y: yDistance },
        {
          opacity: 1,
          y: 0,
          duration: duration,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Staggered stat pills
    gsap.fromTo(
      '.stagger-item',
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.stagger-parent',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  } else {
    // Fallback: show everything if GSAP fails to load
    document.querySelectorAll('.reveal, .stagger-item, .hero__label, .hero__stat-wrap, .hero__subtitle, .hero__name, .hero__buttons').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ─────────────────────────────────────
     2. HERO COUNT-UP
  ───────────────────────────────────── */
  function countUp(el, target, duration) {
    duration = duration || 2400;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // Cubic ease-out
      var ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target).toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(step);
  }

  var heroStat = document.getElementById('heroStat');
  if (heroStat) {
    var target = parseInt(heroStat.getAttribute('data-target'), 10) || 1448212;
    var counted = false;

    if ('IntersectionObserver' in window) {
      var statObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !counted) {
          counted = true;
          countUp(heroStat, target);
          statObserver.disconnect();
        }
      }, { threshold: 0.5 });
      statObserver.observe(heroStat);
    } else {
      setTimeout(function () { countUp(heroStat, target); }, 400);
    }
  }

  /* ─────────────────────────────────────
     3. NAV — scroll state + active section
  ───────────────────────────────────── */
  var nav = document.getElementById('nav');
  var navLinks = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('section[id]');

  // Scroll class
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }, { passive: true });

  // Active link via scroll position (works for any section height)
  function updateActiveNav() {
    var scrollY = window.scrollY + 200;
    var current = '';
    sections.forEach(function (s) {
      if (s.offsetTop <= scrollY) {
        current = s.id;
      }
    });
    navLinks.forEach(function (link) {
      link.classList.remove('is-active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('is-active');
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ─────────────────────────────────────
     4. NAV — mobile burger
  ───────────────────────────────────── */
  var burger = document.getElementById('navBurger');
  var navLinksList = document.querySelector('.nav__links');

  if (burger && navLinksList) {
    burger.addEventListener('click', function () {
      var isOpen = navLinksList.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu on link click (mobile)
    navLinksList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinksList.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─────────────────────────────────────
     5. CASES — expandable cards
  ───────────────────────────────────── */
  document.querySelectorAll('[data-card]').forEach(function (card) {
    var toggle = card.querySelector('.card__toggle');
    var cardBody = card.querySelector('.card-body');
    if (!toggle || !cardBody) return;

    function openCard() {
      card.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      if (typeof gsap !== 'undefined') {
        gsap.to(cardBody, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' });
      }
    }

    function closeCard() {
      card.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (typeof gsap !== 'undefined') {
        gsap.to(cardBody, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
      }
    }

    function toggleCard() {
      if (card.classList.contains('is-open')) {
        closeCard();
      } else {
        openCard();
      }
    }

    // Click on card head (not inside card-body)
    card.querySelector('.card__head').addEventListener('click', toggleCard);

    // Keyboard support
    card.querySelector('.card__head').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard();
      }
    });
    card.querySelector('.card__head').setAttribute('tabindex', '0');
    card.querySelector('.card__head').setAttribute('role', 'button');
  });


  /* ─────────────────────────────────────
     6. POSTS — enhance tweet cards + filter
  ───────────────────────────────────── */

  // Enhance static tweet cards with interactive elements
  document.querySelectorAll('.tweet-card').forEach(function (card) {
    var xLink = card.querySelector('.tweet-card__x-link');
    var tweetUrl = xLink ? xLink.href : '';

    // Add "· Follow" link to header
    var handle = card.querySelector('.tweet-card__handle');
    if (handle && !handle.querySelector('.tweet-card__follow')) {
      var screenName = handle.textContent.trim().replace('@', '');
      var follow = document.createElement('a');
      follow.className = 'tweet-card__follow';
      follow.href = 'https://x.com/intent/follow?screen_name=' + screenName;
      follow.target = '_blank';
      follow.rel = 'noopener';
      follow.textContent = ' · Follow';
      handle.appendChild(follow);
    }

    // Add ⓘ icon to timestamp
    var date = card.querySelector('.tweet-card__date');
    if (date && !date.querySelector('.tweet-card__info')) {
      var info = document.createElement('span');
      info.className = 'tweet-card__info';
      info.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
      date.appendChild(info);
    }

    // Replace simple metrics with action buttons
    var footer = card.querySelector('.tweet-card__footer');
    var metrics = card.querySelector('.tweet-card__metrics');
    if (footer && metrics) {
      var likes = 0;
      var replies = 0;
      var spans = metrics.querySelectorAll('.tweet-card__metric');
      if (spans[0]) likes = parseInt(spans[0].textContent) || 0;
      if (spans[1]) replies = parseInt(spans[1].textContent) || 0;

      var actions = document.createElement('div');
      actions.className = 'tweet-card__actions';
      actions.innerHTML =
        '<a class="tweet-card__action tweet-card__action--like" href="' + tweetUrl + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z"/></svg>' +
          (likes > 0 ? ' ' + likes : '') +
        '</a>' +
        '<a class="tweet-card__action" href="' + tweetUrl + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.893 4.306-2.394 5.862l-6.675 7.69c-.616.71-1.712.71-2.328 0l-6.709-7.735C2.617 14.22 1.751 12.2 1.751 10zm8.005-6C6.502 4 3.751 6.733 3.751 10c0 1.77.724 3.39 2.068 4.94l6.182 7.128 6.119-7.05c1.245-1.29 1.999-2.97 1.999-4.89C20.12 6.4 17.369 4 13.877 4H9.756z"/></svg>' +
          ' Reply' +
        '</a>' +
        '<a class="tweet-card__action" href="' + tweetUrl + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>' +
          ' Copy link' +
        '</a>';

      metrics.replaceWith(actions);

      // Add "Read more on X" link
      if (!card.querySelector('.tweet-card__read-more')) {
        var readMore = document.createElement('a');
        readMore.className = 'tweet-card__read-more';
        readMore.href = tweetUrl;
        readMore.target = '_blank';
        readMore.rel = 'noopener';
        readMore.textContent = replies > 0 ? 'Read ' + replies + (replies === 1 ? ' reply' : ' replies') : 'Read more on X';
        footer.after(readMore);
      }
    }
  });

  var filterBtns = document.querySelectorAll('.filter-btn');
  var postItems = document.querySelectorAll('.post-item');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');

      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      postItems.forEach(function (item) {
        if (filter === 'all' || item.getAttribute('data-client') === filter) {
          item.classList.remove('is-hidden');
        } else {
          item.classList.add('is-hidden');
        }
      });

      // Recalculate scroll triggers after page height changes
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(function () { ScrollTrigger.refresh(); }, 100);
      }
    });
  });

  /* ─────────────────────────────────────
     9. CONTACT FORM — email toggle + submit
  ───────────────────────────────────── */
  var emailToggle      = document.getElementById('emailToggle');
  var emailToggleBadge = document.getElementById('emailToggleBadge');
  var formDrawer       = document.getElementById('contactFormDrawer');

  if (emailToggle && formDrawer) {
    emailToggle.addEventListener('click', function () {
      var isOpen = emailToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        emailToggle.setAttribute('aria-expanded', 'false');
        if (emailToggleBadge) emailToggleBadge.textContent = 'Write';
        if (typeof gsap !== 'undefined') {
          gsap.to(formDrawer, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
        }
      } else {
        emailToggle.setAttribute('aria-expanded', 'true');
        if (emailToggleBadge) emailToggleBadge.textContent = 'Close';
        if (typeof gsap !== 'undefined') {
          gsap.to(formDrawer, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' });
        }
      }
    });
  }

  var contactForm    = document.getElementById('contactForm');
  var contactSuccess = document.getElementById('contactSuccess');

  if (contactForm && contactSuccess) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameVal    = contactForm.querySelector('[name="name"]').value;
      var emailVal   = contactForm.querySelector('[name="email"]').value;
      var messageVal = contactForm.querySelector('[name="message"]').value;
      var action     = contactForm.getAttribute('action');
      var isPlaceholder = action.indexOf('YOUR_FORM') !== -1;

      function showSuccess() {
        contactForm.style.display = 'none';
        contactSuccess.classList.add('is-visible');
      }

      if (isPlaceholder) {
        // Mailto fallback
        var body = 'Name: ' + nameVal + '\nEmail: ' + emailVal + '\n\n' + messageVal;
        window.location.href = 'mailto:vitaliybsnss@gmail.com'
          + '?subject=' + encodeURIComponent('Portfolio contact from ' + nameVal)
          + '&body='    + encodeURIComponent(body);
      } else {
        // Formspree AJAX
        fetch(action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        }).then(function (res) {
          if (res.ok) {
            showSuccess();
          } else {
            contactForm.submit();
          }
        }).catch(function () {
          contactForm.submit();
        });
      }
    });
  }

  /* ─────────────────────────────────────
     10. PHOTO — fallback placeholder
  ───────────────────────────────────── */
  var aboutPhoto = document.querySelector('.about__photo');
  var photoPlaceholder = document.querySelector('.about__photo-placeholder');

  if (aboutPhoto && photoPlaceholder) {
    aboutPhoto.addEventListener('error', function () {
      aboutPhoto.style.display = 'none';
      photoPlaceholder.classList.add('is-visible');
    });

    // If already errored (cached)
    if (aboutPhoto.complete && aboutPhoto.naturalWidth === 0) {
      aboutPhoto.style.display = 'none';
      photoPlaceholder.classList.add('is-visible');
    }
  }

})();

/* ═══════════════════════════════════════
   VISUAL EFFECTS — cursor, spotlight, flow field
═══════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────────────────────────────────
     CUSTOM CURSOR + SPOTLIGHT (desktop only)
  ───────────────────────────────────── */
  if (window.matchMedia('(pointer: fine)').matches) {
    var cursorEl = document.querySelector('.cursor');
    var spotlightEl = document.querySelector('.spotlight');
    var mx = -100, my = -100;
    var cx = -100, cy = -100;

    var hoverTargets = 'a, button, .btn, .filter-btn, .card__head, .contact__email-toggle';

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;

      // Spotlight CSS custom properties
      if (spotlightEl) {
        spotlightEl.style.setProperty('--mx', mx + 'px');
        spotlightEl.style.setProperty('--my', my + 'px');
      }
    });

    // Hover state for cursor
    document.addEventListener('mouseover', function (e) {
      if (cursorEl && e.target.closest(hoverTargets)) {
        cursorEl.classList.add('cursor--hover');
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (cursorEl && e.target.closest(hoverTargets)) {
        cursorEl.classList.remove('cursor--hover');
      }
    });

    // Smooth cursor tracking via requestAnimationFrame
    function updateCursor() {
      cx = mx;
      cy = my;
      if (cursorEl) {
        var halfW = cursorEl.classList.contains('cursor--hover') ? 20 : 10;
        cursorEl.style.transform = 'translate(' + (cx - halfW) + 'px, ' + (cy - halfW) + 'px)';
      }
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);
  }

  /* ─────────────────────────────────────
     HERO FLOW FIELD
  ───────────────────────────────────── */
  var canvas = document.getElementById('flowCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var t = 0;
    var PARTICLE_COUNT = 80;

    function noise(x, y, tt) {
      return Math.sin(x * 0.01 + tt) * Math.cos(y * 0.013 + tt * 0.7) * Math.sin((x + y) * 0.007 + tt * 0.5);
    }

    function resizeCanvas() {
      var hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height
        });
      }
    }

    function animateFlow() {
      // Fade canvas slightly each frame
      ctx.fillStyle = 'rgba(0,0,0,0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.8;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var angle = noise(p.x, p.y, t) * Math.PI * 2;
        var nx = p.x + Math.cos(angle) * 0.5;
        var ny = p.y + Math.sin(angle) * 0.5;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;

        // Wrap at edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }

      t += 0.003;
      requestAnimationFrame(animateFlow);
    }

    resizeCanvas();
    initParticles();
    requestAnimationFrame(animateFlow);

    window.addEventListener('resize', function () {
      resizeCanvas();
      initParticles();
    });
  }



  /* ─────────────────────────────────────
     EFFECT 4: SCROLL PROGRESS BAR
  ───────────────────────────────────── */
  var scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      var docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        scrollProgress.style.width = (scrollY / docHeight * 100) + '%';
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────
     EFFECT 2: TEXT SCRAMBLE ON SCROLL
  ───────────────────────────────────── */
  var scrambleEls = document.querySelectorAll('.scramble-text');
  var scrambleChars = '!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  scrambleEls.forEach(function (el) {
    // Store original text (textContent flattens <br> — preserve innerHTML)
    el.setAttribute('data-original', el.innerHTML);
  });

  function scrambleText(el) {
    var original = el.getAttribute('data-original');
    // Parse out tags vs text
    var segments = [];
    var regex = /(<[^>]+>)|([^<]+)/g;
    var match;
    while ((match = regex.exec(original)) !== null) {
      if (match[1]) {
        segments.push({ type: 'tag', value: match[1] });
      } else {
        segments.push({ type: 'text', value: match[2] });
      }
    }
    // Flatten all text chars
    var allChars = [];
    segments.forEach(function (seg, si) {
      if (seg.type === 'text') {
        for (var ci = 0; ci < seg.value.length; ci++) {
          allChars.push({ segIndex: si, charIndex: ci, char: seg.value[ci] });
        }
      }
    });

    var totalChars = allChars.length;
    var duration = 1500; // ms
    var startTime = performance.now();
    var frameInterval = 30;

    function update() {
      var elapsed = performance.now() - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var revealedCount = Math.floor(progress * totalChars);

      // Build output segments
      var outputSegs = segments.map(function (seg) {
        return { type: seg.type, value: seg.type === 'tag' ? seg.value : '' };
      });

      allChars.forEach(function (info, i) {
        if (i < revealedCount) {
          outputSegs[info.segIndex].value += info.char;
        } else {
          if (info.char === ' ') {
            outputSegs[info.segIndex].value += ' ';
          } else {
            outputSegs[info.segIndex].value += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }
        }
      });

      el.innerHTML = outputSegs.map(function (s) { return s.value; }).join('');

      if (progress < 1) {
        setTimeout(function () { requestAnimationFrame(update); }, frameInterval);
      } else {
        el.innerHTML = original;
      }
    }
    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window) {
    var scrambleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.getAttribute('data-scrambled')) {
          entry.target.setAttribute('data-scrambled', 'true');
          scrambleText(entry.target);
          scrambleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    scrambleEls.forEach(function (el) { scrambleObserver.observe(el); });
  }

  /* ─────────────────────────────────────
     EFFECT 5: IMAGE TILT ON HOVER
  ───────────────────────────────────── */
  var tiltPhoto = document.querySelector('.about__photo');
  if (tiltPhoto) {
    tiltPhoto.addEventListener('mousemove', function (e) {
      var rect = tiltPhoto.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var rotateY = ((e.clientX - centerX) / rect.width) * 15;
      var rotateX = -((e.clientY - centerY) / rect.height) * 15;
      tiltPhoto.style.transform = 'perspective(600px) rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg) scale(1.03)';
    });

    tiltPhoto.addEventListener('mouseleave', function () {
      tiltPhoto.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)';
    });
  }

  /* ─────────────────────────────────────
     EFFECT 6: GLITCH FLICKER ON HERO NAME
  ───────────────────────────────────── */
  var heroName = document.querySelector('.hero__name');
  if (heroName) {
    function scheduleGlitch() {
      var delay = 5000 + Math.random() * 3000; // 5-8 seconds
      setTimeout(function () {
        heroName.classList.add('glitch-active');
        setTimeout(function () {
          heroName.classList.remove('glitch-active');
        }, 150);
        scheduleGlitch();
      }, delay);
    }
    scheduleGlitch();
  }

  /* ─────────────────────────────────────
     EFFECT 7: STAGGERED CHARACTER REVEAL ON HERO NAME
  ───────────────────────────────────── */
  if (heroName && typeof gsap !== 'undefined') {
    // Wait for hero entrance animation to complete (~0.6s per element * 5 stagger = ~1s)
    setTimeout(function () {
      var text = heroName.textContent;
      heroName.innerHTML = '';
      var chars = [];
      for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.className = 'char-span';
        span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        heroName.appendChild(span);
        chars.push(span);
      }
      gsap.from(chars, {
        opacity: 0,
        rotateX: -90,
        y: 20,
        duration: 0.6,
        stagger: 0.04,
        ease: 'back.out(1.7)'
      });
    }, 1200);
  }


  /* ─────────────────────────────────────
     GEOMETRIC PARTICLES
  ───────────────────────────────────── */
  document.querySelectorAll('.geo-particles').forEach(function (container) {
    var shapes = ['square', 'cross', 'dot', 'dot', 'line', 'dot'];
    var count = 12;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      var shape = shapes[Math.floor(Math.random() * shapes.length)];
      el.className = 'geo-particle geo-particle--' + shape;
      el.style.left = Math.random() * 100 + '%';
      el.style.top = Math.random() * 100 + '%';
      var duration = 20 + Math.random() * 40;
      var delay = -(Math.random() * duration);
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = delay + 's';
      if (shape === 'line') {
        el.style.transform = 'rotate(' + (Math.random() * 90 - 45) + 'deg)';
      }
      container.appendChild(el);
    }
  });

  /* ─────────────────────────────────────
     EFFECT 10: SECTION WIPE TRANSITIONS
  ───────────────────────────────────── */
  var wipeSections = document.querySelectorAll('.about, .timeline, .cases, .posts, .contact');
  wipeSections.forEach(function (section) {
    section.classList.add('section-wipe');
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.utils.toArray('.section-wipe').forEach(function (section) {
      gsap.fromTo(section, { '--wipe-progress': 1 }, {
        '--wipe-progress': 0,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 0.5
        }
      });
    });
  }

  /* ─────────────────────────────────────
     DESKTOP-ONLY EFFECTS (pointer: fine)
  ───────────────────────────────────── */
  if (window.matchMedia('(pointer: fine)').matches) {

    /* EFFECT 1: MAGNETIC BUTTONS */
    var magneticEls = document.querySelectorAll('a.btn, button.btn, .filter-btn');
    magneticEls.forEach(function (el) {
      el.classList.add('magnetic');

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var distX = e.clientX - centerX;
        var distY = e.clientY - centerY;
        var distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < 80) {
          var offsetX = distX * 0.3;
          var offsetY = distY * 0.3;
          el.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
        }
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0, 0)';
      });
    });

    /* EFFECT 9: CURSOR TRAIL */
    var TRAIL_COUNT = 6;
    var trailDots = [];
    var trailPositions = [];
    var trailOpacities = [0.5, 0.4, 0.3, 0.2, 0.15, 0.1];

    for (var t = 0; t < TRAIL_COUNT; t++) {
      var dot = document.createElement('div');
      dot.className = 'cursor-trail';
      dot.style.opacity = trailOpacities[t];
      document.body.appendChild(dot);
      trailDots.push(dot);
      trailPositions.push({ x: -100, y: -100 });
    }

    var trailMx = -100, trailMy = -100;

    document.addEventListener('mousemove', function (e) {
      trailMx = e.clientX;
      trailMy = e.clientY;
    });

    function updateTrail() {
      // First dot tracks cursor directly
      trailPositions[0].x += (trailMx - trailPositions[0].x) * 0.3;
      trailPositions[0].y += (trailMy - trailPositions[0].y) * 0.3;

      // Subsequent dots follow the one before with lerp
      for (var i = 1; i < TRAIL_COUNT; i++) {
        trailPositions[i].x += (trailPositions[i - 1].x - trailPositions[i].x) * 0.25;
        trailPositions[i].y += (trailPositions[i - 1].y - trailPositions[i].y) * 0.25;
      }

      for (var j = 0; j < TRAIL_COUNT; j++) {
        trailDots[j].style.transform = 'translate(' + (trailPositions[j].x - 2) + 'px, ' + (trailPositions[j].y - 2) + 'px)';
      }

      requestAnimationFrame(updateTrail);
    }
    requestAnimationFrame(updateTrail);

  } /* end pointer: fine */

})();

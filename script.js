

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════
     1. STICKY HEADER
  
  ══════════════════════════════════════════════ */
  const stickyHeader = document.getElementById('stickyHeader');
  const mainNav = document.getElementById('mainNav');

  let lastScrollY = 0;
  let ticking = false;

  function handleScroll() {
    const scrollY = window.scrollY;
    const foldHeight = window.innerHeight; // first fold = one viewport height

    if (!ticking) {
      requestAnimationFrame(() => {
        if (scrollY > foldHeight) {
          // Past the first fold — show sticky header
          stickyHeader.classList.add('visible');
          stickyHeader.setAttribute('aria-hidden', 'false');
        } else {
          // Back in first fold — hide sticky header
          stickyHeader.classList.remove('visible');
          stickyHeader.setAttribute('aria-hidden', 'true');
        }

        lastScrollY = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });


  /* ══════════════════════════════════════════════
     2. PRODUCT IMAGE CAROUSEL with ZOOM
  ══════════════════════════════════════════════ */
  const carouselImages = [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=700&q=80',
    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=700&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=60',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=60',
  ];

  const mainImg = document.getElementById('mainImg');
  const carouselMain = document.getElementById('carouselMain');
  const carouselWrap = document.getElementById('carouselWrap');
  const zoomLens = document.getElementById('zoomLens');
  const zoomResult = document.getElementById('zoomResult');
  const thumbs = document.querySelectorAll('.carousel__thumb');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentIndex = 0;
  const ZOOM_FACTOR = 3; // 3× zoom

  // Switch carousel image
  function goToImage(index) {
    currentIndex = (index + carouselImages.length) % carouselImages.length;
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = carouselImages[currentIndex];
      mainImg.style.opacity = '1';
      // Update zoom result bg
      zoomResult.style.backgroundImage = `url(${carouselImages[currentIndex]})`;
    }, 160);

    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === currentIndex);
      t.setAttribute('aria-selected', i === currentIndex);
    });
  }

  mainImg.style.transition = 'opacity 0.16s ease';

  // Thumbnail click
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      goToImage(parseInt(thumb.dataset.index, 10));
    });
  });

  // Prev / Next buttons
  prevBtn.addEventListener('click', () => goToImage(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToImage(currentIndex + 1));

  // Keyboard support for carousel
  carouselWrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToImage(currentIndex - 1);
    if (e.key === 'ArrowRight') goToImage(currentIndex + 1);
  });

  /* ──── ZOOM ON HOVER ──── */
  // Initialize zoom result bg
  zoomResult.style.backgroundImage = `url(${carouselImages[0]})`;
  zoomResult.style.backgroundRepeat = 'no-repeat';

  carouselMain.addEventListener('mousemove', handleZoom);
  carouselMain.addEventListener('mouseleave', () => {
    zoomLens.style.display = 'none';
    zoomResult.style.display = 'none';
  });
  carouselMain.addEventListener('mouseenter', () => {
    zoomLens.style.display = 'block';
    zoomResult.style.display = 'block';
    zoomResult.style.backgroundImage = `url(${carouselImages[currentIndex]})`;
  });

  function handleZoom(e) {
    const rect = carouselMain.getBoundingClientRect();
    const lensW = zoomLens.offsetWidth;
    const lensH = zoomLens.offsetHeight;

    // Mouse position relative to image
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp lens within image boundaries
    let lensX = x - lensW / 2;
    let lensY = y - lensH / 2;
    lensX = Math.max(0, Math.min(lensX, rect.width - lensW));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensH));

    zoomLens.style.left = lensX + 'px';
    zoomLens.style.top  = lensY + 'px';

    // Calculate background position for zoom result
    const resultW = zoomResult.offsetWidth;
    const resultH = zoomResult.offsetHeight;
    const bgSizeX = rect.width  * ZOOM_FACTOR;
    const bgSizeY = rect.height * ZOOM_FACTOR;

    // Ratio of lens position on the image
    const ratioX = lensX / (rect.width  - lensW);
    const ratioY = lensY / (rect.height - lensH);

    const bgX = -ratioX * (bgSizeX - resultW);
    const bgY = -ratioY * (bgSizeY - resultH);

    zoomResult.style.backgroundSize     = `${bgSizeX}px ${bgSizeY}px`;
    zoomResult.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }


  /* ══════════════════════════════════════════════
     3. APPLICATIONS CAROUSEL (drag + buttons)
  ══════════════════════════════════════════════ */
  const appsTrack = document.getElementById('appsTrack');
  const appsPrev  = document.getElementById('appsPrev');
  const appsNext  = document.getElementById('appsNext');

  let appsOffset = 0;
  const CARD_WIDTH = 360 + 20; // card width + gap

  function getAppsMaxOffset() {
    return -(appsTrack.scrollWidth - appsTrack.parentElement.offsetWidth - 24);
  }

  function moveApps(dir) {
    appsOffset += dir * -CARD_WIDTH;
    const max = getAppsMaxOffset();
    appsOffset = Math.max(max, Math.min(0, appsOffset));
    appsTrack.style.transform = `translateX(${appsOffset}px)`;
  }

  appsPrev.addEventListener('click', () => moveApps(-1));
  appsNext.addEventListener('click', () => moveApps(1));

  // Drag support
  setupDrag(appsTrack.parentElement, appsTrack, () => appsOffset, (v) => { appsOffset = v; }, getAppsMaxOffset);


  /* ══════════════════════════════════════════════
     4. TESTIMONIALS CAROUSEL (drag)
  ══════════════════════════════════════════════ */
  const testimonialsTrack = document.getElementById('testimonialsTrack');
  let testimonialOffset = 0;

  function getTestimonialsMaxOffset() {
    return -(testimonialsTrack.scrollWidth - testimonialsTrack.parentElement.offsetWidth);
  }

  setupDrag(
    testimonialsTrack.parentElement,
    testimonialsTrack,
    () => testimonialOffset,
    (v) => { testimonialOffset = v; },
    getTestimonialsMaxOffset
  );


  /* ══════════════════════════════════════════════
     5. DRAG UTILITY for horizontal carousels
     Handles mouse drag and touch swipe
  ══════════════════════════════════════════════ */
  function setupDrag(container, track, getOffset, setOffset, getMax) {
    let isDragging = false;
    let startX = 0;
    let startOffset = 0;
    const VELOCITY_MULTIPLIER = 1.5;

    function onDragStart(clientX) {
      isDragging = true;
      startX = clientX;
      startOffset = getOffset();
      track.style.transition = 'none';
      container.style.cursor = 'grabbing';
    }

    function onDragMove(clientX) {
      if (!isDragging) return;
      const delta = (clientX - startX) * VELOCITY_MULTIPLIER;
      let newOffset = startOffset + delta;
      const max = getMax();
      newOffset = Math.max(max - 40, Math.min(40, newOffset)); // rubber-band
      track.style.transform = `translateX(${newOffset}px)`;
      setOffset(newOffset);
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = 'grab';
      track.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';

      // Snap to bounds
      let current = getOffset();
      const max = getMax();
      current = Math.max(max, Math.min(0, current));
      track.style.transform = `translateX(${current}px)`;
      setOffset(current);
    }

    // Mouse events
    container.addEventListener('mousedown',  (e) => onDragStart(e.clientX));
    window.addEventListener('mousemove',     (e) => onDragMove(e.clientX));
    window.addEventListener('mouseup',       onDragEnd);

    // Touch events
    container.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
    container.addEventListener('touchmove',  (e) => onDragMove(e.touches[0].clientX),  { passive: true });
    container.addEventListener('touchend',   onDragEnd);

    // Prevent clicking links while dragging
    container.addEventListener('click', (e) => {
      if (Math.abs(getOffset() - startOffset) > 5) e.preventDefault();
    });
  }


  /* ══════════════════════════════════════════════
     6. MANUFACTURING PROCESS TABS
  ══════════════════════════════════════════════ */
  const processTabs   = document.querySelectorAll('.process-tab');
  const processPanels = document.querySelectorAll('.process-panel');

  processTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = parseInt(tab.dataset.tab, 10);

      // Update tab states
      processTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panel visibility
      processPanels.forEach(p => {
        p.classList.remove('active');
      });
      const targetPanel = document.querySelector(`.process-panel[data-panel="${target}"]`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });


  /* ══════════════════════════════════════════════
     7. FAQ ACCORDION
  ══════════════════════════════════════════════ */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon   = btn.querySelector('.faq-icon');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-item--open');

      // Close all
      faqItems.forEach(fi => {
        fi.classList.remove('faq-item--open');
        const fiBtn    = fi.querySelector('.faq-question');
        const fiAnswer = fi.querySelector('.faq-answer');
        const fiIcon   = fiBtn.querySelector('.faq-icon');
        fiBtn.setAttribute('aria-expanded', 'false');
        fiAnswer.style.maxHeight = '0';
        fiAnswer.style.padding   = '0 20px';
        if (fiIcon) fiIcon.textContent = '⌄';
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('faq-item--open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.padding   = '0 20px 18px';
        if (icon) icon.textContent = '⌃';
      }
    });
  });

  // Open first FAQ item by default
  const firstFaq    = faqItems[0];
  const firstAnswer = firstFaq?.querySelector('.faq-answer');
  if (firstAnswer) {
    firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 40 + 'px';
    firstAnswer.style.padding   = '0 20px 18px';
  }


  /* ══════════════════════════════════════════════
     8. MOBILE HAMBURGER MENU
  ══════════════════════════════════════════════ */
  const hamburgerMain   = document.getElementById('hamburgerMain');
  const hamburgerSticky = document.getElementById('hamburgerSticky');
  const mobileMenu      = document.getElementById('mobileMenu');

  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    if (hamburgerMain) hamburgerMain.setAttribute('aria-expanded', isOpen);
    if (hamburgerSticky) hamburgerSticky.setAttribute('aria-expanded', isOpen);
  }

  hamburgerMain?.addEventListener('click', toggleMenu);
  hamburgerSticky?.addEventListener('click', toggleMenu);

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !stickyHeader.contains(e.target)) {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });


  /* ══════════════════════════════════════════════
     9. SMOOTH SCROLL for anchor links
  ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = stickyHeader.classList.contains('visible') ? 80 : 0;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset - 16,
          behavior: 'smooth'
        });
      }
    });
  });


  /* ══════════════════════════════════════════════
     10. INTERSECTION OBSERVER — Animate on scroll
  ══════════════════════════════════════════════ */
  const animatables = document.querySelectorAll(
    '.feature-card, .portfolio-card, .testimonial-card, .resource-item, .faq-item'
  );

  // Add initial hidden state
  animatables.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${(i % 4) * 0.08}s, transform 0.5s ease ${(i % 4) * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  animatables.forEach(el => observer.observe(el));

});

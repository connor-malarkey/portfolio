/**
 * Connor Malarkey Portfolio — Main JS
 * Nav scroll, section spy, contact modal, reveal, Bento CTA
 */
(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const navOverlay = document.querySelector('.nav-overlay');
  const navToggle = document.querySelector('.nav-toggle');
  const heroScrollIndicator = document.getElementById('heroScrollIndicator');
  const portraitTilt = document.getElementById('portraitTilt');
  const contactModal = document.getElementById('contactModal');
  const navContactBtn = document.getElementById('navContactBtn');
  const contactSectionCta = document.getElementById('contactSectionCta');
  const contactForm = document.getElementById('contactForm');
  const contactFormStatus = document.getElementById('contactFormStatus');
  const contactFormSubmit = document.getElementById('contactFormSubmit');
  const contactModalClose = document.getElementById('contactModalClose');

  const sections = [
    { id: 'hero', label: 'Hero' },
    { id: 'projects', label: 'Projects' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'experience', label: 'Experience' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  // ——— Scroll: nav background + section spy ———
  let ticking = false;
  let lastScrollY = 0;

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(function () {
        if (nav) {
          if (lastScrollY > 60) nav.classList.add('scrolled');
          else nav.classList.remove('scrolled');
        }
        if (heroScrollIndicator) {
          if (lastScrollY > 120) heroScrollIndicator.classList.add('hidden');
          else heroScrollIndicator.classList.remove('hidden');
        }
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  }

  function updateActiveSection() {
    const viewportMid = lastScrollY + window.innerHeight / 2;
    let activeId = 'hero';
    sections.forEach(function (s) {
      const el = document.getElementById(s.id);
      if (!el) return;
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (viewportMid >= top && viewportMid < top + height) activeId = s.id;
    });
    navLinks.forEach(function (link) {
      const section = link.getAttribute('data-section');
      if (section === activeId) link.classList.add('active');
      else link.classList.remove('active');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ——— Nav link click: scroll to section ———
  function scrollToSection(sectionId) {
    var el = document.getElementById(sectionId);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var sectionId = link.getAttribute('data-section');
      if (sectionId) {
        e.preventDefault();
        scrollToSection(sectionId);
      }
    });
  });
  if (navOverlay) {
    navOverlay.querySelectorAll('.nav-overlay-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var sectionId = link.getAttribute('data-section');
        if (sectionId) {
          e.preventDefault();
          scrollToSection(sectionId);
          setNavOpen(false);
        }
      });
    });
  }

  // ——— Portrait 3D tilt (mouse) ———
  if (portraitTilt) {
    portraitTilt.addEventListener('mousemove', function (e) {
      const rect = portraitTilt.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = -y * 12;
      const tiltY = x * 12;
      portraitTilt.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
    });
    portraitTilt.addEventListener('mouseleave', function () {
      portraitTilt.style.transform = '';
    });
  }

  // ——— Hero badge: rotate through titles ———
  const heroBadge = document.getElementById('heroBadge');
  const heroBadgeText = document.getElementById('heroBadgeText');
  const heroBadgeTitles = [
    'Senior Manager',
    'Team Manager',
    'AI Architect',
    'Systems Builder',
    'Media Editor',
    'Content Creator'
  ];
  if (heroBadge && heroBadgeText && heroBadgeTitles.length) {
    var heroBadgeIndex = 0;
    var heroBadgeInterval = setInterval(function () {
      heroBadge.classList.add('swapping');
      setTimeout(function () {
        heroBadgeIndex = (heroBadgeIndex + 1) % heroBadgeTitles.length;
        heroBadgeText.textContent = heroBadgeTitles[heroBadgeIndex];
        heroBadge.classList.remove('swapping');
      }, 250);
    }, 2800);
  }

  // ——— History timeline: line fill + item reveal ———
  const timeline = document.getElementById('historyTimeline');
  const timelineLine = document.getElementById('timelineLine');
  const timelineItems = document.querySelectorAll('.timeline-item');

  if (timeline && timelineLine) {
    const timelineObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            timelineLine.classList.add('animated');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px' }
    );
    timelineObserver.observe(timeline);
  }

  timelineItems.forEach(function (item) {
    const itemObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -30px 0px' }
    );
    itemObserver.observe(item);
  });

  // ——— Reveal on scroll ———
  const revealEls = document.querySelectorAll('.about-intro, .about-bio-block, .bento-card, .experience-card, .magic-behind, .gallery-card, .contact-inner > *');
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(function (el) {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // ——— Projects "See more" dropdown ———
  var projectsMoreBtn = document.getElementById('projectsMoreBtn');
  var projectsMoreList = document.getElementById('projectsMoreList');
  var projectsMoreWrap = document.querySelector('.projects-more-wrap');
  function setProjectsMoreOpen(open) {
    if (!projectsMoreWrap) return;
    projectsMoreWrap.setAttribute('data-open', open ? 'true' : 'false');
    if (projectsMoreBtn) projectsMoreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (projectsMoreList) {
      if (open) projectsMoreList.removeAttribute('hidden');
      else projectsMoreList.setAttribute('hidden', '');
    }
  }
  if (projectsMoreBtn && projectsMoreList && projectsMoreWrap) {
    projectsMoreBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = projectsMoreWrap.getAttribute('data-open') === 'true';
      setProjectsMoreOpen(!isOpen);
    });
    document.addEventListener('click', function () {
      setProjectsMoreOpen(false);
    });
    projectsMoreWrap.querySelector('.projects-more-dropdown-wrap').addEventListener('click', function (e) {
      e.stopPropagation();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setProjectsMoreOpen(false);
    });
  }

  // ——— Bento CTA: copy email ———
  var bentoEmailCopy = document.getElementById('bentoEmailCopy');
  if (bentoEmailCopy) {
    bentoEmailCopy.addEventListener('click', function () {
      var email = 'connormalarkeymedia@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          var orig = bentoEmailCopy.textContent;
          bentoEmailCopy.textContent = 'Copied!';
          setTimeout(function () { bentoEmailCopy.textContent = orig; }, 2000);
        });
      } else {
        window.prompt('Copy this email:', email);
      }
    });
  }

  // ——— Contact modal ———
  function openContactModal() {
    if (!contactModal) return;
    document.body.classList.add('modal-open');
    contactModal.showModal();
    if (contactForm) contactForm.reset();
    if (contactFormStatus) contactFormStatus.textContent = '';
    if (contactFormStatus) contactFormStatus.className = 'contact-form-status';
  }

  function closeContactModal() {
    if (contactModal) contactModal.close();
    document.body.classList.remove('modal-open');
  }

  var heroCtaConnect = document.getElementById('heroCtaConnect');
  var heroCtaEmail = document.getElementById('heroCtaEmail');
  function setContactTriggers() {
    if (navContactBtn) navContactBtn.addEventListener('click', openContactModal);
    if (contactSectionCta) contactSectionCta.addEventListener('click', openContactModal);
    if (heroCtaConnect) heroCtaConnect.addEventListener('click', openContactModal);
    var overlayContact = document.querySelector('.nav-overlay-contact');
    if (overlayContact) {
      overlayContact.addEventListener('click', function () {
        setNavOpen(false);
        openContactModal();
      });
    }
  }
  setContactTriggers();

  if (heroCtaEmail) {
    heroCtaEmail.addEventListener('click', function () {
      var email = 'connormalarkeymedia@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          var label = heroCtaEmail.querySelector('.hero-cta-email-text');
          if (label) {
            var orig = label.textContent;
            label.textContent = 'Copied!';
            setTimeout(function () { label.textContent = orig; }, 2000);
          }
        });
      } else {
        window.prompt('Copy this email:', email);
      }
    });
  }

  if (contactModalClose) contactModalClose.addEventListener('click', closeContactModal);
  if (contactModal) {
    contactModal.addEventListener('click', function (e) {
      if (e.target === contactModal) closeContactModal();
    });
    contactModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeContactModal();
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var action = contactForm.getAttribute('action');
      if (!action || action.indexOf('YOUR_FORM_ID') !== -1) {
        if (contactFormStatus) {
          contactFormStatus.textContent = 'Form is not configured. Replace YOUR_FORM_ID in the form action with your Formspree form ID.';
          contactFormStatus.className = 'contact-form-status error';
        }
        return;
      }
      contactFormSubmit.disabled = true;
      if (contactFormStatus) {
        contactFormStatus.textContent = 'Sending…';
        contactFormStatus.className = 'contact-form-status';
      }
      var formData = new FormData(contactForm);
      fetch(action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            if (contactFormStatus) {
              contactFormStatus.textContent = "Thanks—I'll get back to you soon.";
              contactFormStatus.className = 'contact-form-status success';
            }
            contactForm.reset();
            setTimeout(closeContactModal, 2000);
          } else {
            if (contactFormStatus) {
              contactFormStatus.textContent = 'Something went wrong. Please try again or email directly.';
              contactFormStatus.className = 'contact-form-status error';
            }
          }
        })
        .catch(function () {
          if (contactFormStatus) {
            contactFormStatus.textContent = 'Something went wrong. Please try again or email directly.';
            contactFormStatus.className = 'contact-form-status error';
          }
        })
        .finally(function () {
          contactFormSubmit.disabled = false;
        });
    });
  }

  // ——— Personal projects modal ———
  var personalProjectsModal = document.getElementById('personalProjectsModal');
  var personalProjectsModalClose = document.getElementById('personalProjectsModalClose');
  if (personalProjectsModalClose) {
    personalProjectsModalClose.addEventListener('click', function () {
      personalProjectsModal.close();
      document.body.classList.remove('modal-open');
    });
  }
  if (personalProjectsModal) {
    personalProjectsModal.addEventListener('click', function (e) {
      if (e.target === personalProjectsModal) {
        personalProjectsModal.close();
        document.body.classList.remove('modal-open');
      }
    });
    personalProjectsModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        personalProjectsModal.close();
        document.body.classList.remove('modal-open');
      }
    });
  }

  // ——— Immersive Tours carousel ———
  (function () {
    var track = document.getElementById('toursCarouselTrack');
    var prevBtn = document.getElementById('toursCarouselPrev');
    var nextBtn = document.getElementById('toursCarouselNext');
    var dotsEl = document.getElementById('toursCarouselDots');
    if (!track || !prevBtn || !nextBtn) return;
    var totalPages = 3;
    var currentPage = 0;
    function goTo(page) {
      currentPage = Math.max(0, Math.min(page, totalPages - 1));
      track.style.transform = 'translateX(' + (currentPage * -33.333) + '%)';
      if (dotsEl) {
        var dots = dotsEl.querySelectorAll('.gallery-carousel-dot');
        dots.forEach(function (d, i) {
          d.classList.toggle('is-active', i === currentPage);
        });
      }
    }
    if (dotsEl) {
      for (var i = 0; i < totalPages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-carousel-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', function () {
          goTo(Number(this.getAttribute('data-page')));
        });
        dot.setAttribute('data-page', String(i));
        dotsEl.appendChild(dot);
      }
    }
    prevBtn.addEventListener('click', function () {
      goTo(currentPage - 1);
    });
    nextBtn.addEventListener('click', function () {
      goTo(currentPage + 1);
    });
  })();

  // ——— Mobile nav ———
  function setNavOpen(open) {
    if (!nav || !navOverlay) return;
    nav.classList.toggle('open', open);
    navOverlay.classList.toggle('open', open);
    if (navToggle) navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  }
  if (navToggle && navOverlay) {
    navToggle.addEventListener('click', function () {
      setNavOpen(!nav.classList.contains('open'));
    });
  }

})();

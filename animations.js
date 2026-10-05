/**
 * ADINATH ENTERPRISES - ANIMATION ENGINE
 * High-performance, lightweight (vanilla JS), 60fps animations
 * - Reading scroll progress bar
 * - Scroll-triggered element reveals via IntersectionObserver
 * - Eased animated number counters (1.2+ MW, ₹78,000, 25 Years, 4.8★)
 * - Back-to-top button with smooth scroll
 * - Calculator micro-interaction pulse
 * - FAQ accordion animations
 */

(function () {
  'use strict';

  // 1. INJECT READING PROGRESS BAR IF NOT PRESENT
  function initProgressBar() {
    let bar = document.getElementById('reading-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'reading-progress';
      document.body.prepend(bar);
    }

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = scrollPercent + '%';
    }, { passive: true });
  }

  // 2. SCROLL REVEAL OBSERVER
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback for older browsers
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  // 3. EASED NUMBER COUNTERS
  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter-target'));
    if (isNaN(target)) return;

    const prefix = el.getAttribute('data-counter-prefix') || '';
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
    const duration = parseInt(el.getAttribute('data-counter-duration') || '1600', 10);
    const startTime = performance.now();

    function updateNumber(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = easedProgress * target;

      const formattedNumber = decimals > 0 
        ? current.toFixed(decimals) 
        : Math.round(current).toLocaleString('en-IN');

      el.textContent = `${prefix}${formattedNumber}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        const finalFormatted = decimals > 0 
          ? target.toFixed(decimals) 
          : Math.round(target).toLocaleString('en-IN');
        el.textContent = `${prefix}${finalFormatted}${suffix}`;
        el.classList.add('pop-highlight');
        setTimeout(() => el.classList.remove('pop-highlight'), 300);
      }
    }

    requestAnimationFrame(updateNumber);
  }

  function initNumberCounters() {
    const counters = document.querySelectorAll('[data-counter-target]');
    if (!counters.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.3
      });

      counters.forEach(counter => observer.observe(counter));
    } else {
      counters.forEach(counter => animateCounter(counter));
    }
  }

  // 4. BACK TO TOP BUTTON
  function initBackToTop() {
    let btn = document.getElementById('back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.setAttribute('aria-label', 'Scroll back to top');
      btn.className = 'w-10 h-10 bg-brand-navy border border-slate-700 text-white rounded-sm shadow-xl flex items-center justify-center hover:bg-slate-800 hover:text-brand-amber transition-colors';
      btn.innerHTML = '<span class="material-symbols-outlined text-xl">arrow_upward</span>';
      document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 5. CALCULATOR VALUE PULSE FEEDBACK
  function initCalculatorPulse() {
    const slider = document.getElementById('bill-slider');
    if (!slider) return;

    const resultCards = document.querySelectorAll('#system-size, #subsidy-amount, #monthly-gen, #payback-period, #net-cost');

    slider.addEventListener('input', () => {
      resultCards.forEach(card => {
        card.classList.remove('pop-highlight');
        // Force reflow
        void card.offsetWidth;
        card.classList.add('pop-highlight');
      });
    });
  }

  // 6. ENHANCE FAQ ACCORDIONS WITH ROTATING CHEVRON
  function initFaqAnimations() {
    const faqButtons = document.querySelectorAll('button[onclick*="toggleFaq"]');
    faqButtons.forEach(button => {
      const icon = button.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.classList.add('faq-chevron');
      }
    });

    // Override toggleFaq if already declared or wrap it
    const originalToggleFaq = window.toggleFaq;
    window.toggleFaq = function (id) {
      if (typeof originalToggleFaq === 'function') {
        originalToggleFaq(id);
      } else {
        const item = document.getElementById(id);
        if (item) {
          item.classList.toggle('hidden');
        }
      }

      // Rotate chevron
      const btn = document.querySelector(`button[onclick*="${id}"]`);
      if (btn) {
        const chevron = btn.querySelector('.material-symbols-outlined');
        const target = document.getElementById(id);
        if (chevron && target) {
          if (!target.classList.contains('hidden')) {
            chevron.style.transform = 'rotate(180deg)';
          } else {
            chevron.style.transform = 'rotate(0deg)';
          }
        }
      }
    };
  }

  // 7. SMOOTH INTERNAL ANCHOR NAVIGATION WITH HEADER OFFSET
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          const headerOffset = 90;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // INITIALIZE ON DOM READY
  document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initScrollReveal();
    initNumberCounters();
    initBackToTop();
    initCalculatorPulse();
    initFaqAnimations();
    initSmoothAnchors();
  });

  // Re-run init if DOMContentLoaded already fired
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initProgressBar();
    initScrollReveal();
    initNumberCounters();
    initBackToTop();
    initCalculatorPulse();
    initFaqAnimations();
    initSmoothAnchors();
  }
})();

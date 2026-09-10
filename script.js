/**
 * Paritosh Tiwari - Clean Modern Portfolio Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initContactForm();
  initCopyEmail();
  initSpotlightEffect();
  if (window.lucide) {
    lucide.createIcons();
  }
});

/* ==========================================================================
   1. Theme Management (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('pt_theme');
  if (savedTheme === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
    if (sunIcon && moonIcon) {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  } else {
    html.classList.add('dark');
    html.classList.remove('light');
    if (sunIcon && moonIcon) {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = html.classList.contains('dark');
      if (isDark) {
        html.classList.remove('dark');
        html.classList.add('light');
        localStorage.setItem('pt_theme', 'light');
        if (sunIcon && moonIcon) {
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
        }
      } else {
        html.classList.add('dark');
        html.classList.remove('light');
        localStorage.setItem('pt_theme', 'dark');
        if (sunIcon && moonIcon) {
          sunIcon.classList.add('hidden');
          moonIcon.classList.remove('hidden');
        }
      }
      if (window.lucide) lucide.createIcons();
    });
  }
}

/* ==========================================================================
   2. Mobile Navigation Toggle
   ========================================================================== */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

/* ==========================================================================
   3. Contact Form Submission
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const toast = document.getElementById('formSuccessToast');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin"></span>
      <span>Sending...</span>
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => {
          toast.classList.add('hidden');
        }, 5000);
      }
      if (window.lucide) lucide.createIcons();
    }, 1000);
  });
}

/* ==========================================================================
   4. Copy Email Utility
   ========================================================================== */
function initCopyEmail() {
  window.copyEmail = function() {
    const email = 'paritosh.tiwari@jecrcu.edu.in';
    const textEl = document.getElementById('copyEmailText');

    navigator.clipboard.writeText(email).then(() => {
      if (textEl) {
        const prev = textEl.textContent;
        textEl.textContent = 'Copied!';
        setTimeout(() => {
          textEl.textContent = prev;
        }, 2000);
      }
    }).catch(() => {
      prompt('Copy email manually:', email);
    });
  };
}

/* ==========================================================================
   5. Subtle Card Hover Lighting
   ========================================================================== */
function initSpotlightEffect() {
  document.querySelectorAll('.modern-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

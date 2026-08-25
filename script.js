const GA_MEASUREMENT_ID = 'G-C4QCK07N6P';

const SUPABASE_URL = 'https://pzkueizrfuvhogwbhqhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TdozvjZ7LI8IVN2VKsKHnA_C9zmfJ4N';

function loadGoogleAnalytics() {
  if (window.gaLoaded) return;
  window.gaLoaded = true;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
}

function initCookieConsent() {
  const consent = localStorage.getItem('uitgesproken_cookie_consent');

  if (consent === 'accepted') {
    loadGoogleAnalytics();
    return;
  }
  if (consent === 'declined') return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <p>We gebruiken cookies (Google Analytics) om te zien hoe de site gebruikt wordt. Lees ons <a href="privacybeleid.html">privacybeleid</a>.</p>
    <div class="cookie-actions">
      <button type="button" class="cookie-decline">Weigeren</button>
      <button type="button" class="cookie-accept">Accepteren</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.querySelector('.cookie-accept').addEventListener('click', () => {
    localStorage.setItem('uitgesproken_cookie_consent', 'accepted');
    loadGoogleAnalytics();
    banner.remove();
  });

  banner.querySelector('.cookie-decline').addEventListener('click', () => {
    localStorage.setItem('uitgesproken_cookie_consent', 'declined');
    banner.remove();
  });
}

function initLogoAnimation() {
  const logo = document.querySelector('.logo');
  if (!logo) return;

  const text = logo.textContent;
  logo.setAttribute('aria-label', text);
  logo.innerHTML = '';

  const wrap = document.createElement('span');
  wrap.setAttribute('aria-hidden', 'true');

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'logo-letter';
    span.textContent = char;
    span.style.animationDelay = `${i * 40}ms`;
    wrap.appendChild(span);
  });

  logo.appendChild(wrap);
}

function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const wrapper = form.parentElement;
    const email = form.querySelector('input[type="email"]').value;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (response.ok || response.status === 409) {
          wrapper.innerHTML = '<p class="newsletter-success">Bedankt! We laten je weten zodra Uitgesproken live is.</p>';
        } else {
          throw new Error('Aanmelding mislukt');
        }
      })
      .catch(() => {
        submitButton.disabled = false;
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCookieConsent();
  initLogoAnimation();
  initNewsletterForm();
});

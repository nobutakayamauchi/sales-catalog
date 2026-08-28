(() => {
  'use strict';

  const script = document.currentScript;
  if (!script) return;

  if (!document.querySelector('script[data-sales-contact-hub]')) {
    const contact = document.createElement('script');
    contact.src = new URL('contact-hub.js', script.src).href;
    contact.defer = true;
    contact.dataset.salesContactHub = '1';
    document.head.appendChild(contact);
  }

  const endpoint = (script.dataset.endpoint || '').trim();
  const product = (script.dataset.product || '').trim();
  if (!endpoint || !product) return;

  const DEVICE_KEY = 'wab_funnel_device_id_v1';
  const SESSION_KEY = 'wab_funnel_session_id_v1';
  const PAGE_SENT_PREFIX = 'catalog_funnel_page_sent_v1:';

  function randomId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();
    return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  }

  function getOrCreate(storage, key) {
    try {
      let value = storage.getItem(key);
      if (!value) {
        value = randomId();
        storage.setItem(key, value);
      }
      return value;
    } catch (_) {
      return randomId();
    }
  }

  const deviceId = getOrCreate(localStorage, DEVICE_KEY);
  const sessionId = getOrCreate(sessionStorage, SESSION_KEY);
  const params = new URLSearchParams(location.search);

  function sourceHost() {
    try { return document.referrer ? new URL(document.referrer).hostname : ''; } catch (_) { return ''; }
  }

  function payload(eventName) {
    return {
      event_id: randomId(),
      event: eventName,
      product,
      device_id: deviceId,
      session_id: sessionId,
      path: location.pathname,
      source: sourceHost(),
      twclid: params.get('twclid') || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      campaign_id: params.get('campaign_id') || '',
      line_item_id: params.get('line_item_id') || '',
    };
  }

  function send(eventName) {
    const body = JSON.stringify(payload(eventName));
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'text/plain;charset=UTF-8' });
        if (navigator.sendBeacon(endpoint, blob)) return;
      }
    } catch (_) {}
    try {
      fetch(endpoint, {
        method: 'POST', mode: 'cors', keepalive: true,
        headers: { 'content-type': 'text/plain;charset=UTF-8' }, body,
      }).catch(() => {});
    } catch (_) {}
  }

  function sendOnce(eventName) {
    const key = `${PAGE_SENT_PREFIX}${sessionId}:${location.pathname}:${eventName}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch (_) {}
    send(eventName);
  }

  sendOnce('lp_view');

  const marks = [25, 50, 75, 90];
  let ticking = false;
  function checkScroll() {
    ticking = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const percent = Math.min(100, Math.round((scrollY / max) * 100));
    for (const mark of marks) if (percent >= mark) sendOnce(`scroll_${mark}`);
  }
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(checkScroll);
  }, { passive: true });
  checkScroll();

  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[data-funnel-event]');
    if (!link) return;
    const eventName = (link.dataset.funnelEvent || '').trim();
    if (eventName) send(eventName);
  }, { capture: true });

  if ('IntersectionObserver' in globalThis) {
    const seen = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const eventName = (entry.target.dataset.funnelEvent || '').trim();
        if (!eventName || seen.has(eventName)) continue;
        seen.add(eventName);
        sendOnce(`${eventName}_view`);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.6 });
    document.querySelectorAll('a[data-funnel-event]').forEach(link => observer.observe(link));
  }
})();

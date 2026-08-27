(() => {
  'use strict';

  const script = document.currentScript;
  if (!script) return;

  const endpoint = (script.dataset.endpoint || '').trim();
  const product = (script.dataset.product || 'webai-bridge').trim();
  if (!endpoint || !product) return;

  const DEVICE_KEY = 'wab_funnel_device_id_v1';
  const SESSION_KEY = 'wab_funnel_session_id_v1';
  const PAGE_SENT_PREFIX = 'wab_funnel_page_sent_v1:';
  const CONSULT_URL = 'https://book.stripe.com/3cI28t3DqaTz6620Rt3Nm0n';
  const PURCHASE_URL = 'https://buy.stripe.com/4gMcN71vi1iZ2TQ7fR3Nm0m';

  function randomId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
    const a = new Uint8Array(16);
    if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
      globalThis.crypto.getRandomValues(a);
      return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
    }
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

  function referrerHost() {
    try {
      return document.referrer ? new URL(document.referrer).hostname : '';
    } catch (_) {
      return '';
    }
  }

  function basePayload(eventName) {
    return {
      event_id: randomId(),
      event: eventName,
      product,
      device_id: deviceId,
      session_id: sessionId,
      path: location.pathname,
      source: referrerHost(),
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
    const body = JSON.stringify(basePayload(eventName));
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'text/plain;charset=UTF-8' });
        if (navigator.sendBeacon(endpoint, blob)) return;
      }
    } catch (_) {}

    try {
      fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        keepalive: true,
        headers: { 'content-type': 'text/plain;charset=UTF-8' },
        body,
      }).catch(() => {});
    } catch (_) {}
  }

  function sendPageOnce(eventName) {
    const key = `${PAGE_SENT_PREFIX}${sessionId}:${location.pathname}:${eventName}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch (_) {}
    send(eventName);
  }

  const path = location.pathname;
  if (path.endsWith('/contact-complete.html')) {
    sendPageOnce('contact_complete');
  } else if (path.endsWith('/purchase-complete.html')) {
    // This is diagnostic only. Stripe remains purchase authority.
    sendPageOnce('purchase_complete_client');
  } else if (path.endsWith('/sales.html') || path.endsWith('/webai-bridge/')) {
    sendPageOnce('lp_view');
  }

  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    const href = link.href;
    if (href === CONSULT_URL) send('consult_click');
    if (href === PURCHASE_URL) send('purchase_click');
  }, { capture: true });

  // Used only by the local operator enrollment page. Never transmit automatically.
  globalThis.__WAB_FUNNEL_DEVICE_ID__ = deviceId;
})();

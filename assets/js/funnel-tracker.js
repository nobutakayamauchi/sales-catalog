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
  const INTENT_KEY = 'wab_funnel_checkout_intent_v1';
  const CLIENT_REFERENCE_PREFIX = 'wab_';
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
  const clientReferenceId = `${CLIENT_REFERENCE_PREFIX}${sessionId}`;
  const params = new URLSearchParams(location.search);

  function sameCheckoutBase(href, base) {
    try {
      const a = new URL(href, location.href);
      const b = new URL(base);
      return a.origin === b.origin && a.pathname === b.pathname;
    } catch (_) {
      return false;
    }
  }

  function checkoutKind(href) {
    if (sameCheckoutBase(href, CONSULT_URL)) return 'consult';
    if (sameCheckoutBase(href, PURCHASE_URL)) return 'purchase';
    return '';
  }

  function decorateCheckoutHref(href) {
    try {
      const url = new URL(href, location.href);
      url.searchParams.set('client_reference_id', clientReferenceId);
      return url.toString();
    } catch (_) {
      return href;
    }
  }

  function decorateCheckoutLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      if (!checkoutKind(link.href)) return;
      link.href = decorateCheckoutHref(link.href);
    });
  }

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

  function setCheckoutIntent(kind) {
    try {
      sessionStorage.setItem(INTENT_KEY, JSON.stringify({ kind, at: Date.now() }));
    } catch (_) {}
  }

  function readCheckoutIntent() {
    try {
      const raw = sessionStorage.getItem(INTENT_KEY);
      if (!raw) return null;
      const value = JSON.parse(raw);
      if (!value || !['consult', 'purchase'].includes(value.kind)) return null;
      if (!Number.isFinite(value.at) || Date.now() - value.at > 60 * 60 * 1000) {
        sessionStorage.removeItem(INTENT_KEY);
        return null;
      }
      return value;
    } catch (_) {
      return null;
    }
  }

  function clearCheckoutIntent(kind) {
    try {
      const value = readCheckoutIntent();
      if (!value || !kind || value.kind === kind) sessionStorage.removeItem(INTENT_KEY);
    } catch (_) {}
  }

  const path = location.pathname;
  const isSalesPage = path.endsWith('/sales.html') || path.endsWith('/webai-bridge/');

  if (path.endsWith('/contact-complete.html')) {
    sendPageOnce('contact_complete');
    clearCheckoutIntent('consult');
  } else if (path.endsWith('/purchase-complete.html')) {
    // Diagnostic only. Stripe remains purchase authority.
    sendPageOnce('purchase_complete_client');
    clearCheckoutIntent('purchase');
  } else if (isSalesPage) {
    sendPageOnce('lp_view');
  }

  function detectCheckoutReturn() {
    if (!isSalesPage) return;
    const intent = readCheckoutIntent();
    if (!intent) return;

    let navType = '';
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      navType = nav && nav.type ? nav.type : '';
    } catch (_) {}

    const ref = referrerHost();
    const stripeRef = ref === 'checkout.stripe.com' || ref === 'buy.stripe.com' || ref.endsWith('.stripe.com');
    if (stripeRef || navType === 'back_forward') {
      sendPageOnce(intent.kind === 'consult' ? 'consult_checkout_return' : 'purchase_checkout_return');
      clearCheckoutIntent(intent.kind);
    }
  }

  function trackScrollDepth() {
    if (!isSalesPage) return;
    const marks = [25, 50, 75, 90];
    let ticking = false;

    function check() {
      ticking = false;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - innerHeight);
      const percent = Math.min(100, Math.round((scrollY / max) * 100));
      for (const mark of marks) {
        if (percent >= mark) sendPageOnce(`scroll_${mark}`);
      }
    }

    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }, { passive: true });
    check();
  }

  function trackCtaExposure() {
    if (!isSalesPage || !('IntersectionObserver' in globalThis)) return;
    const seen = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const link = entry.target;
        const kind = checkoutKind(link.href);
        if (!kind || seen.has(kind)) continue;
        seen.add(kind);
        sendPageOnce(`${kind}_cta_view`);
        observer.unobserve(link);
      }
    }, { threshold: 0.6 });

    document.querySelectorAll('a[href]').forEach(link => {
      if (checkoutKind(link.href)) observer.observe(link);
    });
  }

  function installConversionGuard() {
    if (!isSalesPage || document.querySelector('[data-wab-conversion-guard]')) return;

    const style = document.createElement('style');
    style.textContent = `
      .wab-conversion-guard{margin:24px 0 8px;padding:22px;border:1px solid #c9d5ff;border-radius:20px;background:linear-gradient(145deg,#f6f8ff,#fff);color:#1d2939}
      .wab-conversion-guard h3{margin:0 0 12px;font-size:20px;letter-spacing:-.03em}
      .wab-conversion-guard p{margin:8px 0;color:#475467;font-size:13px}
      .wab-conversion-guard strong{color:#101828}
      .wab-conversion-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
      .wab-conversion-cell{padding:14px;border:1px solid #e0e7ff;border-radius:14px;background:#fff}
      .wab-conversion-cell b{display:block;margin-bottom:5px;font-size:13px}
      .wab-conversion-cell span{display:block;color:#667085;font-size:12px;line-height:1.6}
      .wab-consult-microcopy{margin:8px 0 0!important;color:#667085!important;font-size:11px!important}
      .wab-conversion-dock{display:none}
      @media(max-width:760px){
        body.wab-sales{padding-bottom:78px}
        .wab-conversion-grid{grid-template-columns:1fr}
        .wab-conversion-dock{position:fixed;left:10px;right:10px;bottom:max(10px,env(safe-area-inset-bottom));z-index:80;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px;border:1px solid rgba(16,24,40,.12);border-radius:18px;background:rgba(255,255,255,.94);box-shadow:0 16px 42px rgba(16,24,40,.18);backdrop-filter:blur(16px);transform:translateY(130%);transition:transform .22s ease}
        .wab-conversion-dock.is-visible{transform:translateY(0)}
        .wab-conversion-dock a{display:flex;min-height:48px;align-items:center;justify-content:center;border-radius:12px;text-decoration:none;font-size:12px;font-weight:950;text-align:center}
        .wab-conversion-dock .consult{border:1px solid #cbd5e1;background:#fff;color:#1d2939}
        .wab-conversion-dock .purchase{border:1px solid transparent;background:linear-gradient(105deg,#315fff,#16a8d0);color:#fff}
      }
    `;
    document.head.appendChild(style);

    const offerActions = document.querySelector('#offer .actions');
    if (offerActions) {
      const guard = document.createElement('div');
      guard.className = 'wab-conversion-guard';
      guard.dataset.wabConversionGuard = '1';
      guard.innerHTML = `
        <h3>Stripeへ進む前の最終チェック</h3>
        <p><strong>WebAI Bridge本体は ¥98,000 の1回払い。</strong> 3本以上のAIを継続してWeb販売したい方向けです。1本だけなら、まず35,000円の限定代行の方が安く始められます。</p>
        <div class="wab-conversion-grid">
          <div class="wab-conversion-cell"><b>購入後</b><span>Stripeに登録したメールアドレスを基準に購入確認し、導入案内へ進みます。</span></div>
          <div class="wab-conversion-cell"><b>標準構成</b><span>Linux / Ubuntu系サーバー推奨。利用者側は一般的なWebブラウザ、推論費は標準BYOK方式です。</span></div>
          <div class="wab-conversion-cell"><b>向いている人</b><span>Knowledgeを相手へ渡さず、複数のAI商品を自分側の基盤で追加・販売したい人。</span></div>
          <div class="wab-conversion-cell"><b>まだ迷う人</b><span>0円相談はカード入力・決済なし。相談しただけで購入する必要もありません。</span></div>
        </div>`;
      offerActions.parentNode.insertBefore(guard, offerActions);
    }

    document.querySelectorAll(`a[href="${CONSULT_URL}"]`).forEach(link => {
      link.title = '0円・カード入力なし・決済なし。相談しただけで購入する必要はありません。';
      const actions = link.closest('.hero-actions, .actions');
      if (actions && !actions.querySelector('.wab-consult-microcopy')) {
        const note = document.createElement('p');
        note.className = 'wab-consult-microcopy';
        note.textContent = '0円相談はカード入力なし・決済なし。氏名・メール・相談内容だけで送信できます。';
        actions.insertAdjacentElement('afterend', note);
      }
    });

    const dock = document.createElement('div');
    dock.className = 'wab-conversion-dock';
    dock.setAttribute('aria-label', '購入・相談ショートカット');
    dock.innerHTML = `<a class="consult" href="${CONSULT_URL}">カード不要<br>0円相談</a><a class="purchase" href="${PURCHASE_URL}">Stripeで購入<br>¥98,000</a>`;
    document.body.appendChild(dock);

    const toggleDock = () => {
      const threshold = Math.max(360, innerHeight * 0.65);
      dock.classList.toggle('is-visible', scrollY > threshold);
    };
    addEventListener('scroll', toggleDock, { passive: true });
    toggleDock();
  }

  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    const kind = checkoutKind(link.href);
    if (!kind) return;
    link.href = decorateCheckoutHref(link.href);
    if (kind === 'consult') {
      setCheckoutIntent('consult');
      send('consult_click');
      send('consult_checkout_start');
    }
    if (kind === 'purchase') {
      setCheckoutIntent('purchase');
      send('purchase_click');
      send('purchase_checkout_start');
    }
  }, { capture: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      installConversionGuard();
      decorateCheckoutLinks();
      trackCtaExposure();
      trackScrollDepth();
      detectCheckoutReturn();
    }, { once: true });
  } else {
    installConversionGuard();
    decorateCheckoutLinks();
    trackCtaExposure();
    trackScrollDepth();
    detectCheckoutReturn();
  }

  // Used only by the local operator enrollment page. Never transmit automatically.
  globalThis.__WAB_FUNNEL_DEVICE_ID__ = deviceId;
})();

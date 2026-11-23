// Dependency-free analytics contracts. All transport is captured locally.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const endpoint = 'https://webai.140-238-62-74.sslip.io/funnel/v1/events';
const consult = 'https://book.stripe.com/3cI28t3DqaTz6620Rt3Nm0n';
const purchase = 'https://buy.stripe.com/4gMcN71vi1iZ2TQ7fR3Nm0m';
const intentKey = 'wab_funnel_checkout_intent_v1';

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

function attributes(html) {
  return Object.fromEntries([...html.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
}

function harness({ product = 'webai-bridge', page = 'sales.html',
  session = storage(), transport = 'beacon', ready = 'complete',
  observer = true, extra = '' } = {}) {
  const html = read(`products/${product}/${page}`);
  const tracker = product === 'webai-bridge' ? 'funnel-tracker.js' : 'catalog-funnel.js';
  const tags = [...html.matchAll(/<script\b[^>]*>/g)].map(m => attributes(m[0]));
  const config = tags.filter(tag => tag.src?.endsWith(`/${tracker}`));
  assert.equal(config.length, 1, `${product}/${page} must load ${tracker} exactly once`);
  assert.equal(config[0]['data-endpoint'], endpoint);
  assert.equal(config[0]['data-product'], product);
  const url = new URL(`https://example.invalid/sales-catalog/products/${product}/${page}?utm_source=regression&utm_campaign=consultation&twclid=test`);
  const links = [];
  function addLinks(markup) {
    for (const match of markup.matchAll(/<a\b[^>]*>/g)) {
      const attr = attributes(match[0]);
      if (!attr.href) continue;
      const link = {
        href: new URL(attr.href.replaceAll('&amp;', '&'), url).href,
        dataset: Object.fromEntries(Object.entries(attr).filter(([k]) => k.startsWith('data-'))
          .map(([k, v]) => [k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v])),
        closest: () => null,
        get protocol() { return new URL(this.href).protocol; },
      };
      links.push(link);
    }
  }
  addLinks(html + extra);
  const docHandlers = {}, windowHandlers = {}, observations = [];
  const deliveries = [], fetches = [], frames = [];
  const document = {
    currentScript: { src: new URL(config[0].src, url).href,
      dataset: { endpoint: config[0]['data-endpoint'], product: config[0]['data-product'] } },
    readyState: ready, referrer: 'https://referrer.invalid/source',
    documentElement: { scrollHeight: 1800 },
    head: { appendChild() {} }, body: { appendChild() {} },
    createElement() {
      return { dataset: {}, classList: { toggle() {} }, setAttribute() {},
        set innerHTML(markup) { addLinks(markup); } };
    },
    querySelector(selector) {
      if (selector.startsWith('script[')) return tags.find(tag => tag.src?.endsWith('/contact-hub.js')) || null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'a[href]') return links;
      if (selector === 'a[data-funnel-event]') return links.filter(link => link.dataset.funnelEvent);
      return [];
    },
    addEventListener(type, fn) { (docHandlers[type] ||= []).push(fn); },
  };
  const context = {
    document, location: url, URL, URLSearchParams, Blob, Uint8Array,
    localStorage: storage({ wab_funnel_device_id_v1: 'device-fixture' }), sessionStorage: session,
    innerHeight: 800, scrollY: 0, performance: { getEntriesByType: () => [] },
    navigator: {}, fetch: (target, options) => {
      fetches.push({ target, options }); deliveries.push({ target, body: options.body });
      return Promise.resolve({ ok: true });
    },
    addEventListener(type, fn) { (windowHandlers[type] ||= []).push(fn); },
    requestAnimationFrame: fn => frames.push(fn),
  };
  if (transport !== 'missing') context.navigator.sendBeacon = (target, body) => {
    if (transport === 'throws') throw new Error('blocked beacon');
    if (transport === 'false') return false;
    deliveries.push({ target, body }); return true;
  };
  if (observer) context.IntersectionObserver = class {
    constructor(callback, options) {
      this.callback = callback; this.options = options; this.targets = new Set(); observations.push(this);
    }
    observe(link) { this.targets.add(link); }
    unobserve(link) { this.targets.delete(link); }
  };
  vm.runInNewContext(read(`assets/js/${tracker}`), context);
  return {
    links, session, fetches, observations,
    ready() { for (const fn of docHandlers.DOMContentLoaded || []) fn(); },
    click(link) {
      // A nested child resolves to its anchor, as a real delegated click does.
      const event = { target: { closest: selector => selector === 'a[data-funnel-event]' && !link.dataset.funnelEvent ? null : link } };
      for (const fn of docHandlers.click || []) fn(event);
    },
    expose() {
      for (const obs of observations) obs.callback([...obs.targets].map(target => ({ target, isIntersecting: true })));
    },
    scroll(percent) {
      context.scrollY = percent * 10;
      for (const fn of windowHandlers.scroll || []) fn();
      while (frames.length) frames.shift()();
    },
    async events() {
      return Promise.all(deliveries.map(async ({ target, body }) => {
        assert.equal(target, endpoint);
        return JSON.parse(typeof body === 'string' ? body : await body.text());
      }));
    },
  };
}

const names = async h => (await h.events()).map(event => event.event);

test('WebAI email CTAs and generated mobile dock: views/clicks, no checkout side effects', async () => {
  const h = harness({ ready: 'loading', extra: '<a href="mailto:support@example.invalid" data-contact-hub-open="support">Support</a><a href="mailto:other@example.invalid">Other</a>' });
  h.ready();
  const consultations = h.links.filter(link => link.protocol === 'mailto:' && link.dataset.contactHubOpen === 'info');
  assert.equal(consultations.length, 5, 'four static CTAs plus generated mobile dock');
  assert.equal(h.observations[0].options.threshold, 0.6);
  const hrefs = consultations.map(link => link.href);
  h.expose(); h.expose();
  for (const link of consultations) h.click(link);
  h.click(consultations[0]); // Click events remain per action, not per session.
  for (const link of h.links.filter(link => !consultations.includes(link))) h.click(link);
  assert.deepEqual(await names(h), ['lp_view', 'consult_cta_view', ...Array(6).fill('consult_click')]);
  assert.deepEqual(consultations.map(link => link.href), hrefs, 'no client_reference_id on mailto');
  assert.equal(h.session.getItem(intentKey), null);
  const reloaded = harness({ session: h.session });
  reloaded.expose();
  assert.deepEqual(await names(reloaded), [], 'views retain per-session/page deduplication');
});

test('Email consultation does not overwrite an existing Stripe purchase intent', async () => {
  const intent = JSON.stringify({ kind: 'purchase', at: Date.now() });
  const h = harness({ session: storage({ [intentKey]: intent }) });
  h.click(h.links.find(link => link.dataset.contactHubOpen === 'info'));
  assert.equal(h.session.getItem(intentKey), intent);
  assert.deepEqual(await names(h), ['lp_view', 'consult_click']);
});

test('Existing Stripe events, intent and query attribution remain compatible', async () => {
  const h = harness({ extra: `<a href="${consult}?utm_source=old">Legacy consult</a><a href="${purchase}?utm_source=old">Purchase</a><a href="https://buy.stripe.com/unknown">Unknown</a><a href="https://buy.stripe.com.evil.invalid/4gMcN71vi1iZ2TQ7fR3Nm0m">Lookalike</a>` });
  h.expose();
  for (const [base, kind] of [[consult, 'consult'], [purchase, 'purchase']]) {
    const link = h.links.find(link => link.href.startsWith(base));
    const target = new URL(link.href);
    assert.equal(target.searchParams.get('utm_source'), 'old');
    assert.equal(target.searchParams.get('client_reference_id'), `wab_${h.session.getItem('wab_funnel_session_id_v1')}`);
    h.click(link);
    assert.equal(JSON.parse(h.session.getItem(intentKey)).kind, kind);
  }
  h.click(h.links.find(link => link.href.includes('/unknown')));
  h.click(h.links.find(link => link.href.includes('.evil.invalid')));
  assert.deepEqual(await names(h), ['lp_view', 'consult_cta_view', 'purchase_cta_view',
    'consult_click', 'consult_checkout_start', 'purchase_click', 'purchase_checkout_start']);
});

for (const product of ['webai-bridge', 'invoice-payment-ops']) {
  test(`${product}: page view, scroll thresholds and unchanged payload schema`, async () => {
    const h = harness({ product });
    for (const percent of [24, 25, 49, 50, 74, 75, 89, 90, 100, 0, 100]) h.scroll(percent);
    assert.deepEqual(await names(h), ['lp_view', 'scroll_25', 'scroll_50', 'scroll_75', 'scroll_90']);
    for (const event of await h.events()) {
      assert.deepEqual(Object.keys(event).sort(), ['event_id', 'event', 'product', 'device_id', 'session_id', 'path', 'source',
        'twclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'campaign_id', 'line_item_id'].sort());
      assert.equal(event.product, product);
      assert.equal(event.path, `/sales-catalog/products/${product}/sales.html`);
      assert.equal(event.device_id, 'device-fixture');
      assert.equal(event.session_id, h.session.getItem('wab_funnel_session_id_v1'));
      assert.equal(event.utm_source, 'regression');
      assert.equal(event.utm_campaign, 'consultation');
      assert.equal(event.twclid, 'test');
      assert.equal(event.source, 'referrer.invalid');
      assert.ok(event.event_id);
    }
    const reloaded = harness({ product, session: h.session });
    reloaded.scroll(100);
    assert.deepEqual(await names(reloaded), []);
  });
}

test('Invoice consultation leaves payment tracking untouched', async () => {
  const h = harness({ product: 'invoice-payment-ops' });
  const link = h.links.find(link => link.dataset.contactHubOpen === 'info');
  const original = link.href;
  h.expose(); h.expose(); h.click(link);
  assert.deepEqual(await names(h), ['lp_view']);
  assert.equal(link.href, original);
  assert.equal(h.session.getItem(intentKey), null);
});

for (const transport of ['false', 'throws', 'missing']) {
  test(`Fetch fallback when sendBeacon is ${transport}`, async () => {
    const h = harness({ transport });
    assert.deepEqual(await names(h), ['lp_view']);
    assert.equal(h.fetches.length, 1);
    assert.equal(h.fetches[0].options.keepalive, true);
    assert.equal(h.fetches[0].options.headers['content-type'], 'text/plain;charset=UTF-8');
  });
}

test('Without IntersectionObserver, page/scroll/click still work without invented views', async () => {
  const h = harness({ observer: false });
  h.click(h.links.find(link => link.dataset.contactHubOpen === 'info'));
  h.scroll(25);
  assert.deepEqual(await names(h), ['lp_view', 'consult_click', 'scroll_25']);
});

test('Completion page diagnostics remain unchanged', async () => {
  for (const [page, event, kind] of [
    ['contact-complete.html', 'contact_complete', 'consult'],
    ['purchase-complete.html', 'purchase_complete_client', 'purchase'],
  ]) {
    const h = harness({ page, session: storage({ [intentKey]: JSON.stringify({ kind, at: Date.now() }) }) });
    h.scroll(100); h.expose();
    assert.deepEqual(await names(h), [event]);
    assert.equal(h.session.getItem(intentKey), null);
  }
});

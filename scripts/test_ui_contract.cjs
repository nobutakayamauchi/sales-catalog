// Dependency-free regression checks for catalog readiness and email handoff.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

async function checkCatalog() {
  const products = JSON.parse(read('data/products.json'));
  const element = { dataset: { catalog: 'data/products.json' }, innerHTML: '' };
  vm.runInNewContext(read('assets/js/catalog.js'), {
    document: { querySelector: () => element },
    fetch: async () => ({ ok: true, json: async () => products })
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal((element.innerHTML.match(/product-card/g) || []).length, 6);
  for (const [name, label] of [
    ['AXIS', '販売中'], ['WebAI Bridge', '購入前相談'],
    ['Invoice Payment Ops', '導入相談・検証中'], ['AI CM Render', '購入前相談'],
    ['Sales Distribution Network (SDN)', '導入相談・検証中']
  ]) {
    const card = element.innerHTML.split('<article').find(s => s.includes(`<h3>${name}</h3>`));
    assert.ok(card?.includes(`<span class="badge">${label}</span>`), name);
  }
}

function contactContext(slug, clipboardMode) {
  const nodes = new Map();
  function node(key) {
    if (nodes.has(key)) return nodes.get(key);
    const n = {
      value: '', hidden: false, textContent: '', options: [], handlers: {},
      classList: { add() {}, remove() {}, toggle() {}, contains() { return true; } },
      setAttribute() {}, focus() {},
      addEventListener(event, fn) { this.handlers[event] = fn; },
      querySelector: sel => node(sel), querySelectorAll: () => []
    };
    Object.defineProperty(n, 'innerHTML', { set(html) {
      node('#sch-product').options = [...html.matchAll(/<option>([^<]+)<\/option>/g)]
        .map(m => ({ value: m[1], text: m[1] }));
    } });
    nodes.set(key, n);
    return n;
  }
  let appended = 0;
  const location = { pathname: `/products/${slug}/sales.html`, href: `https://example.invalid/products/${slug}/sales.html` };
  const context = {
    window: { location }, location, URL,
    setTimeout: fn => fn(),
    navigator: clipboardMode === 'unavailable' ? {} : { clipboard: { writeText: async value => {
      if (clipboardMode === 'denied') throw new Error('permission denied');
      context.copied = value;
    } } },
    document: {
      head: { appendChild() {} }, body: { appendChild() { appended++; } },
      documentElement: { style: {} }, createElement: tag => node(`${tag}-${appended}`),
      addEventListener() {}
    }
  };
  vm.createContext(context);
  vm.runInContext(read('assets/js/contact-hub.js'), context);
  return { context, node, count: () => appended };
}

async function checkContact() {
  for (const [slug, name] of [
    ['axis', 'AXIS'], ['bridgepatch', 'BridgePatch'], ['webai-bridge', 'WebAI Bridge'],
    ['invoice-payment-ops', 'Invoice Payment Ops'], ['ai-cm-render', 'AI CM Render'],
    ['sdn', 'Sales Distribution Network (SDN)']
  ]) {
    const { context, node, count } = contactContext(slug, 'unavailable');
    context.window.SalesContactHub.open('info');
    assert.equal(node('#sch-product').value, name);
    vm.runInContext(read('assets/js/contact-hub.js'), context);
    assert.equal(count(), 2, 'reloading must not duplicate the launcher/modal');
  }
  for (const mode of ['success', 'denied', 'unavailable']) {
    const { context, node } = contactContext('ai-cm-render', mode);
    context.window.SalesContactHub.open('support');
    node('#sch-email').value = 'local-test@example.invalid';
    node('#sch-message').value = 'A & B? 日本語';
    node('#sch-order').value = 'TEST-NO-PAYMENT';
    await node('.sch-form').handlers.submit({ preventDefault() {} });
    const target = new URL(context.location.href);
    assert.equal(target.protocol, 'mailto:');
    assert.equal(target.pathname, 'yamauchi.rts.office@gmail.com');
    assert.ok(target.searchParams.get('body').includes('A & B? 日本語'));
    assert.ok(target.searchParams.get('body').includes('Order hint: TEST-NO-PAYMENT'));
    assert.equal(node('#sch-fallback-wrap').hidden, false);
    assert.ok(node('#sch-fallback').value.includes('Subject:'));
    const status = node('.sch-status').textContent;
    if (mode === 'success') {
      assert.ok(status.includes('コピーしました'));
      assert.equal(context.copied, node('#sch-fallback').value);
    } else {
      assert.ok(!status.includes('コピーしました'));
      assert.ok(status.includes('送信されていません'));
    }
  }
}

(async () => {
  await checkCatalog();
  await checkContact();
  console.log('UI contracts passed: readiness labels, six product selections, clipboard success/denial/unavailable, email encoding, manual fallback, duplicate initialization.');
})().catch(error => { console.error(error); process.exitCode = 1; });

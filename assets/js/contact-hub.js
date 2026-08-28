(() => {
  const TARGET_EMAIL = 'yamauchi.rts.office@gmail.com';

  const productFromPath = () => {
    const p = location.pathname.toLowerCase();
    if (p.includes('/products/axis/')) return 'AXIS';
    if (p.includes('/products/bridgepatch/')) return 'BridgePatch';
    if (p.includes('/products/webai-bridge/')) return 'WebAI Bridge';
    if (p.includes('/products/sdn/')) return 'Sales Distribution Network (SDN)';
    return 'Sales Catalog / Other';
  };

  const categories = {
    info: {
      label: '商品について知りたい',
      eyebrow: 'CONTACT / PRODUCT INFO',
      tag: 'PRODUCT-INFO',
      placeholder: '気になっている商品、分からない点、使いたい場面などを書いてください。'
    },
    need: {
      label: '「欲しい」を言ってみる',
      eyebrow: 'WE NEED',
      tag: 'WE-NEED',
      placeholder: '「これができたら欲しい」「この決済にも対応してほしい」など、そのまま書いてください。'
    },
    support: {
      label: '買ったあとのサポート',
      eyebrow: 'SUPPORT',
      tag: 'SUPPORT',
      placeholder: '購入した商品、困っていること、エラー内容、いつ頃から起きているかを書いてください。秘密情報・APIキー・パスワードは送らないでください。'
    },
    other: {
      label: 'その他のお問い合わせ',
      eyebrow: 'CONTACT',
      tag: 'INQUIRY',
      placeholder: 'お問い合わせ内容を書いてください。'
    }
  };

  const css = `
    .sch-launcher{position:fixed;right:18px;bottom:22px;z-index:9997;display:grid;gap:7px;width:156px}
    .sch-launcher button{appearance:none;border:1px solid rgba(255,255,255,.2);border-radius:14px;background:#07152f;color:#fff;padding:11px 12px;box-shadow:0 14px 40px rgba(7,21,47,.22);font:900 11px/1.15 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic UI",sans-serif;cursor:pointer;text-align:left}
    .sch-launcher button b{display:block;color:#76e7ff;font:950 9px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;margin-bottom:4px}
    .sch-launcher button:hover{transform:translateY(-1px)}
    .sch-backdrop{position:fixed;inset:0;z-index:9998;background:rgba(4,10,22,.64);backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;padding:18px}
    .sch-backdrop.is-open{display:flex}
    .sch-modal{width:min(680px,100%);max-height:min(820px,92svh);overflow:auto;border-radius:24px;background:#fff;color:#101828;box-shadow:0 28px 100px rgba(0,0,0,.34);border:1px solid #dfe5ee}
    .sch-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:24px 24px 16px;border-bottom:1px solid #e7ecf3}
    .sch-kicker{color:#245dff;font:900 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em}
    .sch-head h2{margin:7px 0 0;font:950 clamp(26px,5vw,38px)/1.05 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic UI",sans-serif;letter-spacing:-.045em}
    .sch-close{appearance:none;border:0;background:#eef2f7;border-radius:999px;width:38px;height:38px;cursor:pointer;font-size:22px}
    .sch-body{padding:20px 24px 26px}
    .sch-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
    .sch-choice{appearance:none;border:1px solid #dfe5ee;border-radius:16px;background:#fff;padding:14px;text-align:left;cursor:pointer;font-weight:900;color:#101828}
    .sch-choice b{display:block;color:#245dff;font:900 9px/1.15 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;margin-bottom:5px}
    .sch-choice.is-active{border-color:#8fb0ff;background:#f4f7ff;box-shadow:0 0 0 2px rgba(36,93,255,.08)}
    .sch-form{display:grid;gap:13px}
    .sch-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .sch-field label{display:block;margin-bottom:6px;color:#475467;font-size:12px;font-weight:900}
    .sch-field input,.sch-field select,.sch-field textarea{width:100%;border:1px solid #cfd7e4;border-radius:12px;background:#fff;color:#101828;padding:12px 13px;font:inherit;outline:none}
    .sch-field textarea{min-height:150px;resize:vertical}
    .sch-field input:focus,.sch-field select:focus,.sch-field textarea:focus{border-color:#245dff;box-shadow:0 0 0 3px rgba(36,93,255,.1)}
    .sch-note{margin:0;color:#667085;font-size:11px;line-height:1.55}
    .sch-submit{appearance:none;border:0;border-radius:999px;background:#245dff;color:#fff;padding:14px 18px;font-weight:950;cursor:pointer}
    .sch-submit:hover{filter:brightness(.96)}
    .sch-status{min-height:1.3em;color:#475467;font-size:12px;font-weight:800}
    @media(max-width:680px){
      .sch-launcher{left:12px;right:12px;bottom:10px;width:auto;grid-template-columns:1fr 1fr}
      .sch-launcher button{padding:10px 11px}
      .sch-launcher button:nth-child(3),.sch-launcher button:nth-child(4){display:none}
      .sch-row,.sch-choices{grid-template-columns:1fr}
      .sch-modal{border-radius:20px}
      .sch-head,.sch-body{padding-left:18px;padding-right:18px}
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const launcher = document.createElement('div');
  launcher.className = 'sch-launcher';
  launcher.setAttribute('aria-label', 'Contact and support');
  launcher.innerHTML = `
    <button type="button" data-sch-open="need"><b>WE NEED</b>「欲しい」を言う</button>
    <button type="button" data-sch-open="info"><b>CONTACT</b>商品について聞く</button>
    <button type="button" data-sch-open="support"><b>SUPPORT</b>買ったあと</button>
    <button type="button" data-sch-open="other"><b>CONTACT</b>その他</button>
  `;

  const backdrop = document.createElement('div');
  backdrop.className = 'sch-backdrop';
  backdrop.innerHTML = `
    <div class="sch-modal" role="dialog" aria-modal="true" aria-labelledby="sch-title">
      <div class="sch-head">
        <div><div class="sch-kicker" id="sch-kicker">WE NEED</div><h2 id="sch-title">「欲しい」を言ってみる。</h2></div>
        <button type="button" class="sch-close" aria-label="閉じる">×</button>
      </div>
      <div class="sch-body">
        <div class="sch-choices">
          <button type="button" class="sch-choice" data-sch-category="info"><b>CONTACT / PRODUCT INFO</b>商品について知りたい</button>
          <button type="button" class="sch-choice" data-sch-category="need"><b>WE NEED</b>「欲しい」を言ってみる</button>
          <button type="button" class="sch-choice" data-sch-category="support"><b>SUPPORT</b>買ったあとのサポート</button>
          <button type="button" class="sch-choice" data-sch-category="other"><b>CONTACT</b>その他のお問い合わせ</button>
        </div>
        <form class="sch-form">
          <div class="sch-row">
            <div class="sch-field"><label for="sch-product">商品</label><select id="sch-product" name="product"><option>AXIS</option><option>BridgePatch</option><option>WebAI Bridge</option><option>Sales Distribution Network (SDN)</option><option>Sales Catalog / Other</option></select></div>
            <div class="sch-field"><label for="sch-email">返信先メールアドレス</label><input id="sch-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div>
          </div>
          <div class="sch-row">
            <div class="sch-field"><label for="sch-name">お名前 / ハンドルネーム</label><input id="sch-name" name="name" autocomplete="name" placeholder="任意"></div>
            <div class="sch-field" id="sch-order-wrap" hidden><label for="sch-order">購入時メール / 注文の手がかり</label><input id="sch-order" name="order" placeholder="任意。Stripe購入時メールなど"></div>
          </div>
          <div class="sch-field"><label for="sch-message" id="sch-message-label">欲しいもの・要望</label><textarea id="sch-message" name="message" required></textarea></div>
          <p class="sch-note">送信するとメールアプリが開きます。内容を確認して送信してください。APIキー、パスワード、秘密鍵などの秘密情報は書かないでください。</p>
          <button class="sch-submit" type="submit">この内容をメールで送る</button>
          <div class="sch-status" aria-live="polite"></div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(backdrop);

  const form = backdrop.querySelector('.sch-form');
  const product = backdrop.querySelector('#sch-product');
  const email = backdrop.querySelector('#sch-email');
  const name = backdrop.querySelector('#sch-name');
  const order = backdrop.querySelector('#sch-order');
  const orderWrap = backdrop.querySelector('#sch-order-wrap');
  const message = backdrop.querySelector('#sch-message');
  const messageLabel = backdrop.querySelector('#sch-message-label');
  const kicker = backdrop.querySelector('#sch-kicker');
  const title = backdrop.querySelector('#sch-title');
  const status = backdrop.querySelector('.sch-status');
  let current = 'need';

  const selectCurrentProduct = () => {
    const detected = productFromPath();
    const option = [...product.options].find(o => o.value === detected || o.text === detected);
    if (option) product.value = option.value;
  };

  const setCategory = (key) => {
    current = categories[key] ? key : 'other';
    const c = categories[current];
    backdrop.querySelectorAll('[data-sch-category]').forEach(b => b.classList.toggle('is-active', b.dataset.schCategory === current));
    kicker.textContent = c.eyebrow;
    title.textContent = c.label + '。';
    messageLabel.textContent = current === 'need' ? '欲しいもの・要望' : current === 'support' ? '困っていること' : 'お問い合わせ内容';
    message.placeholder = c.placeholder;
    orderWrap.hidden = current !== 'support';
  };

  const open = (key = 'need') => {
    selectCurrentProduct();
    setCategory(key);
    status.textContent = '';
    backdrop.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => message.focus(), 30);
  };

  const close = () => {
    backdrop.classList.remove('is-open');
    document.documentElement.style.overflow = '';
  };

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-sch-open],[data-contact-hub-open]');
    if (opener) {
      e.preventDefault();
      open(opener.dataset.schOpen || opener.dataset.contactHubOpen || 'need');
      return;
    }
    const category = e.target.closest('[data-sch-category]');
    if (category) setCategory(category.dataset.schCategory);
  });

  backdrop.querySelector('.sch-close').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && backdrop.classList.contains('is-open')) close(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!email.value.trim() || !message.value.trim()) {
      status.textContent = '返信先メールアドレスと内容を入力してください。';
      return;
    }
    const c = categories[current];
    const productTag = product.value.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toUpperCase() || 'OTHER';
    const subject = `[SALES-CATALOG][${c.tag}][${productTag}] ${c.label}`;
    const body = [
      `Category: ${c.tag}`,
      `Product: ${product.value}`,
      `Reply-To: ${email.value.trim()}`,
      `Name: ${name.value.trim() || '-'}`,
      current === 'support' ? `Order hint: ${order.value.trim() || '-'}` : null,
      `Source: ${location.href}`,
      '',
      message.value.trim(),
      '',
      'Security note: no API keys, passwords, or secret keys included.'
    ].filter(v => v !== null).join('\n');

    const mailto = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(body);
    } catch (_) {}
    status.textContent = 'メールアプリを開きます。開かない場合は、入力内容はクリップボードにもコピーされています。';
    window.location.href = mailto;
  });

  window.SalesContactHub = { open, close };
})();

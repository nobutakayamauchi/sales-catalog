const root=document.querySelector('[data-catalog]');
if(root){
  fetch(root.dataset.catalog)
    .then(r=>{if(!r.ok)throw new Error(`catalog ${r.status}`);return r.json()})
    .then(products=>{
      const live=products.filter(p=>p.status==='for_sale');
      root.innerHTML=live.map(p=>{
        const min=Number(p.price_min??p.price??0);
        const max=Number(p.price_max??p.price??0);
        const hasRange=min>0&&max>0&&min!==max;
        const priceLabel=hasRange
          ?`¥${min.toLocaleString('ja-JP')}〜¥${max.toLocaleString('ja-JP')}`
          :min>0?`¥${min.toLocaleString('ja-JP')}`:'要見積もり';
        const rate=Number(p.commission_rate||0);
        const commissionMin=min*rate;
        const commissionMax=max*rate;
        const commissionLabel=commissionMin>0
          ?(hasRange?`¥${commissionMin.toLocaleString('ja-JP')}〜¥${commissionMax.toLocaleString('ja-JP')}`:`¥${commissionMin.toLocaleString('ja-JP')}`)
          :'';
        const affiliate=p.partner_status==='open'&&p.affiliate_url?`<a class="btn" href="${encodeURI(p.affiliate_url)}">この商品を紹介する</a>`:'';
        const commissionMeta=p.commission_type==='success_fee'&&rate?`<span class="badge">成功報酬 ${Math.round(rate*100)}%</span>`:'';
        return `<article class="card product-card"><div class="grow"><div class="eyebrow">${escapeHtml(String(p.type||'product').toUpperCase())} / PRODUCT</div><h3>${escapeHtml(p.name)}</h3><p class="muted">${escapeHtml(p.summary)}</p><div class="meta"><span class="badge">販売中</span>${p.partner_status==='open'?'<span class="badge partner">販売パートナー募集中</span>':''}${commissionMeta}</div><div class="price">${priceLabel} <small>${escapeHtml(p.currency||'JPY')}</small></div>${commissionLabel?`<p class="fine">1件の成功報酬目安：${commissionLabel}</p>`:''}</div><div class="actions"><a class="btn" href="${encodeURI(p.overview_url)}">商品を見る</a><a class="btn primary" href="${encodeURI(p.sales_url)}">販売ページを見る</a>${affiliate}</div></article>`;
      }).join('');
      if(!live.length)root.innerHTML='<div class="card"><b>現在販売中の商品はありません。</b></div>';
    })
    .catch(()=>{root.innerHTML='<div class="card"><b>商品一覧を読み込めませんでした。</b><p class="muted">data/products.json を確認してください。</p></div>'});
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

const root=document.querySelector('[data-catalog]');
if(root){
  fetch(root.dataset.catalog)
    .then(r=>{if(!r.ok)throw new Error(`catalog ${r.status}`);return r.json()})
    .then(products=>{
      const live=products.filter(p=>p.status==='for_sale');
      root.innerHTML=live.map(p=>`<article class="card product-card"><div class="grow"><div class="eyebrow">${escapeHtml(p.type.toUpperCase())} / PRODUCT</div><h3>${escapeHtml(p.name)}</h3><p class="muted">${escapeHtml(p.summary)}</p><div class="meta"><span class="badge">販売中</span>${p.partner_status==='open'?'<span class="badge partner">販売パートナー募集中</span>':''}</div><div class="price">¥${Number(p.price).toLocaleString('ja-JP')} <small>${escapeHtml(p.currency)}</small></div></div><div class="actions"><a class="btn" href="${encodeURI(p.overview_url)}">商品を見る</a><a class="btn primary" href="${encodeURI(p.sales_url)}">販売ページを見る</a></div></article>`).join('');
      if(!live.length)root.innerHTML='<div class="card"><b>現在販売中の商品はありません。</b></div>';
    })
    .catch(()=>{root.innerHTML='<div class="card"><b>商品一覧を読み込めませんでした。</b><p class="muted">data/products.json を確認してください。</p></div>'});
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

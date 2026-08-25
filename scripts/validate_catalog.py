from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
products = json.loads((ROOT / 'data/products.json').read_text(encoding='utf-8'))
allowed_status = {'draft','for_sale','paused','sold_out','archived'}
allowed_partner = {'closed','open','limited','invite_only','paused'}
allowed_commission_type = {'success_fee'}
allowed_commission_basis = {'confirmed_receipt'}

assert isinstance(products, list) and products, 'products.json must contain products'
ids = set()
for p in products:
    required = {'id','name','type','status','currency','summary','canonical_repo','overview_url','sales_url','affiliate_url','partner_status','commission_type','commission_rate','commission_basis'}
    missing = required - p.keys()
    assert not missing, f"{p.get('id','?')}: missing {sorted(missing)}"
    assert p['id'] not in ids, f"duplicate id: {p['id']}"
    ids.add(p['id'])
    assert p['status'] in allowed_status, f"invalid status: {p['status']}"
    assert p['partner_status'] in allowed_partner, f"invalid partner status: {p['partner_status']}"
    assert p['commission_type'] in allowed_commission_type, f"invalid commission type: {p['commission_type']}"
    assert p['commission_basis'] in allowed_commission_basis, f"invalid commission basis: {p['commission_basis']}"
    if 'price' in p:
        assert isinstance(p['price'], (int,float)) and p['price'] >= 0
    else:
        assert 'price_min' in p and 'price_max' in p, f"{p['id']}: missing fixed price or price range"
        assert isinstance(p['price_min'], (int,float)) and p['price_min'] >= 0
        assert isinstance(p['price_max'], (int,float)) and p['price_max'] >= p['price_min']
    assert isinstance(p['commission_rate'], (int,float)) and 0 <= p['commission_rate'] <= 1
    overview = ROOT / p['overview_url'].removeprefix('./')
    sales = ROOT / p['sales_url'].removeprefix('./')
    affiliate = ROOT / p['affiliate_url'].removeprefix('./')
    if overview.is_dir(): overview = overview / 'index.html'
    assert overview.exists(), f"missing overview: {overview}"
    assert sales.exists(), f"missing sales page: {sales}"
    assert affiliate.exists(), f"missing affiliate page: {affiliate}"

for html in ROOT.rglob('*.html'):
    text = html.read_text(encoding='utf-8')
    assert '<meta name="viewport"' in text, f"mobile viewport missing: {html}"
    assert '<title>' in text, f"title missing: {html}"
    for href in re.findall(r'href="([^"]+)"', text):
        if href.startswith(('http://','https://','#','mailto:','tel:')):
            continue
        target = (html.parent / href.split('#',1)[0]).resolve()
        if not href.split('#',1)[0]:
            continue
        if target.is_dir(): target = target / 'index.html'
        assert target.exists(), f"broken local link: {html} -> {href}"

print(f'catalog ok: {len(products)} product(s), {len(list(ROOT.rglob("*.html")))} html page(s)')

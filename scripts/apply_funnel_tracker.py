from __future__ import annotations

from pathlib import Path

FILES = [
    Path("products/webai-bridge/sales.html"),
    Path("products/webai-bridge/contact-complete.html"),
    Path("products/webai-bridge/purchase-complete.html"),
]

PIXEL_TAG = '<script src="../../assets/js/x-pixel-base.js"></script>'
FUNNEL_TAG = (
    '<script src="../../assets/js/funnel-tracker.js" '
    'data-endpoint="https://webai.140-238-62-74.sslip.io/funnel/v1/events" '
    'data-product="webai-bridge" defer></script>'
)


def _inject_once(text: str, tag: str, marker: str, path: Path) -> tuple[str, bool]:
    if tag in text:
        return text, False
    if text.count(marker) != 1:
        raise RuntimeError(f"expected exactly one {marker} in {path}")
    return text.replace(marker, f"{tag}\n{marker}"), True


def patch(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    changed = False

    text, pixel_changed = _inject_once(text, PIXEL_TAG, "</head>", path)
    changed = changed or pixel_changed

    text, funnel_changed = _inject_once(text, FUNNEL_TAG, "</body>", path)
    changed = changed or funnel_changed

    if changed:
        path.write_text(text, encoding="utf-8")
    return changed


def main() -> None:
    changed = [str(path) for path in FILES if patch(path)]
    print("patched:", changed)


if __name__ == "__main__":
    main()

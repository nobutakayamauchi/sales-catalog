from __future__ import annotations

from pathlib import Path

FILES = [
    Path("products/webai-bridge/sales.html"),
    Path("products/webai-bridge/contact-complete.html"),
    Path("products/webai-bridge/purchase-complete.html"),
]

TAG = (
    '<script src="../../assets/js/funnel-tracker.js" '
    'data-endpoint="https://webai.140-238-62-74.sslip.io/funnel/v1/events" '
    'data-product="webai-bridge" defer></script>'
)


def patch(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if TAG in text:
        return False
    marker = "</body>"
    if text.count(marker) != 1:
        raise RuntimeError(f"expected exactly one </body> in {path}")
    text = text.replace(marker, f"{TAG}\n{marker}")
    path.write_text(text, encoding="utf-8")
    return True


def main() -> None:
    changed = [str(path) for path in FILES if patch(path)]
    print("patched:", changed)


if __name__ == "__main__":
    main()

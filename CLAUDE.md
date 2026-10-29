# Učebna – interaktivní stránky k maturitním tématům

Statický web (HTML + CSS + JS, bez buildu). Každé téma = jedna stránka v `<predmet>/web/`.

- **Před tvorbou nebo úpravou stránky tématu si přečti `docs/PRUVODCE.md`** a dodržuj ho (struktura, komponenty, styl psaní, checklist).
- Začínej z `docs/sablona-tematu.html`. Vzorová hotová stránka: `ekonomie/web/16-hospodareni-podniku.html`.
- Obsah ber z `<predmet>/md/*.md` a požadavků v `<predmet>/Maturitni temata a pozadavky.txt`. **PDF nečti** – jsou přepsané v `.md`; na stránce se na ně jen odkazuje přes `data-zdroj`.
- Novou stránku zapiš do `assets/katalog.js`.
- Sdílené `assets/ucebna.css` / `ucebna.js` měň jen pro obecné komponenty a změnu promítni do průvodce.
- Lokální náhled: `python -m http.server 8765` (konfigurace `ucebna` v `.claude/launch.json`). Ověř mobil (375 px) i tmavý režim.
- Texty česky, tykáním.

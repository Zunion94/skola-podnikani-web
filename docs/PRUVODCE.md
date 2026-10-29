# Učebna – průvodce tvorbou stránek

Tahle dokumentace popisuje, **jak vytvářet interaktivní stránky k maturitním tématům**, aby všechny vypadaly a fungovaly stejně. Vzorová hotová stránka: [`ekonomie/web/16-hospodareni-podniku.html`](../ekonomie/web/16-hospodareni-podniku.html).

---

## 1. Princip

- **Jedno téma = jedna HTML stránka.** Funguje na mobilu i PC, bez instalace, bez build kroku.
- **Stránka obsahuje jen obsah.** Vzhled a chování dodávají dva sdílené soubory:
  - `assets/ucebna.css` – barvy, typografie, všechny komponenty
  - `assets/ucebna.js` – horní lišta, obsah, ukládání postupu a interaktivní komponenty
- **Komponenty se zapínají data-atributy** (`data-tridicka`, `data-test`…). Data (otázky, kartičky) se píšou jako JSON přímo do stránky.
- **Postup se ukládá do `localStorage`** prohlížeče (prostudované kapitoly, nejlepší výsledek testu). Žádný server ani přihlašování.
- **Zdroj pravdy je `<predmet>/md/*.md`.** Stránka z něj vychází, obsah si nevymýšlí. PDF už se znovu neskenují.

## 2. Struktura projektu

```
Skola_claude/
├── index.html                  rozcestník – vykreslí se z assets/katalog.js
├── assets/
│   ├── ucebna.css              sdílený styl
│   ├── ucebna.js               sdílené komponenty
│   └── katalog.js              seznam předmětů a témat
├── docs/
│   ├── PRUVODCE.md             tento soubor
│   └── sablona-tematu.html     prázdná šablona na zkopírování
└── ekonomie/                   jeden předmět
    ├── Maturitni temata a pozadavky.txt
    ├── md/16-hospodareni-podniku.md      podklady (zdroj obsahu)
    ├── pdf/…                             originály – stránka na ně odkazuje přes data-zdroj (Claude je nečte)
    └── web/16-hospodareni-podniku.html   hotová stránka
```

**Pojmenování:** stránka se jmenuje stejně jako její `.md` soubor, jen s příponou `.html`, a leží ve `<predmet>/web/`.
**ID tématu:** `<predmet>-<cislo>`, např. `ekonomie-16`. Používá se v `data-tema` a v katalogu – nesmí se měnit, jinak se ztratí uložený postup.

## 3. Postup při tvorbě nového tématu

1. Zkopíruj `docs/sablona-tematu.html` do `<predmet>/web/<stejny-nazev-jako-md>.html`.
2. Vyplň `data-tema`, `data-nazev`, `data-zdroj` (název PDF ve `<predmet>/pdf/` – název se od `.md` liší, zkontroluj ho), `<title>`, štítek, nadpis a perex.
3. Do „Po prostudování budeš umět“ přepiš body z **maturitních požadavků** (`Maturitni temata a pozadavky.txt`) – srozumitelně, jako slovesa (vysvětlit, rozlišit, spočítat…).
4. Projdi `.md` soubor a rozděl ho do **5–8 kapitol**. Každá kapitola = jeden `<section class="kapitola">`.
5. U každé kapitoly vyber vhodné komponenty (viz [kap. 6](#6-kdy-kterou-komponentu)). Pravidlo: **v každé kapitole aspoň jedna věc na kliknutí.**
6. Na konec vždy přidej kapitolu **Opakování** (kartičky + osnova odpovědi u maturity) a **Závěrečný test**.
7. Doplň téma do `assets/katalog.js` (`id` a `soubor`).
8. Zkontroluj podle [checklistu](#10-checklist-před-dokončením).

## 4. Kostra stránky

```html
<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>16. Hospodaření podniku – Ekonomie</title>
  <link rel="stylesheet" href="../../assets/ucebna.css">
  <script src="../../assets/ucebna.js" defer></script>
</head>
<body data-predmet="ekonomie">
<main class="obal" data-tema="ekonomie-16" data-nazev="16. Hospodaření podniku" data-zpet="../../index.html"
      data-zdroj="../pdf/16 Hospodaření podniku.pdf">

  <div class="hlavicka">
    <span class="stitek">Ekonomie · otázka 16</span>
    <h1>Hospodaření podniku</h1>
    <p class="hlavicka__perex">Jedna dvě věty, o čem téma je – lidsky.</p>
    <div class="cile">
      <h2>Po prostudování budeš umět</h2>
      <ul><li>…</li></ul>
    </div>
  </div>

  <section class="kapitola" id="naklady">
    <h2>Náklady</h2>
    …obsah a komponenty…
  </section>

</main>
</body>
</html>
```

| Atribut | Kde | Význam |
|---|---|---|
| `data-predmet` | `<body>` | barva předmětu (`ekonomie`, `cestina`, `matematika`, `dejepis` – další přidej do CSS) |
| `data-tema` | `<main>` | ID tématu pro ukládání postupu |
| `data-nazev` | `<main>` | text v horní liště |
| `data-zpet` | `<main>` | odkaz „← Témata“ (výchozí `../../index.html`) |
| `data-zdroj` | `<main>` | cesta ke zdrojovému PDF (relativně ke stránce, mezery a diakritika nevadí). Přidá tlačítko 📄 do lišty a odkaz „Nakouknout do zdroje“ pod perex. Když PDF neexistuje, atribut vynech. |
| `id` | `section.kapitola` | kotva pro obsah – krátké, bez diakritiky (`bod-zvratu`) |
| `data-bez-hotovo` | `section.kapitola` | nepřidá tlačítko „Mám prostudováno“ (např. u testu) |

**Co udělá `ucebna.js` sám:** horní lištu (zpět, název, zdroj 📄, obsah ☰, přepínač motivu ◐), čísla kapitol, ukazatel čtení, tlačítko „Mám prostudováno“ na konci každé kapitoly. Nic z toho se do HTML nepíše.

## 5. Komponenty

### 5.1 Textové bloky (jen CSS)

```html
<div class="box box--definice"><p><strong>Náklady</strong> jsou …</p></div>
<div class="box box--tip"><p>Pomůcka na zapamatování…</p></div>
<div class="box box--pozor"><p>Častá chyba / chyták u zkoušky…</p></div>
<div class="box box--priklad"><p>Konkrétní příklad s čísly…</p></div>
<div class="box"><p>Neutrální rámeček</p></div>
<div class="vzorec">TC = FC + VC</div>
<div class="mrizka">…dlaždice vedle sebe (na mobilu pod sebou)…</div>
```

Nadpis boxu (Definice, 💡 Zapamatuj si, ⚠️ Pozor, chyták, Příklad) doplní CSS – nepiš ho.

### 5.2 Otočná karta – `data-flip`

Pojem na líci, vysvětlení na rubu. Ideální na 2–4 související pojmy v `.mrizka`.

```html
<div class="mrizka">
  <div class="karta" data-flip>
    <div class="karta__lic">Fixní náklady (FC)</div>
    <div class="karta__rub"><p style="margin:0">Existují, i když podnik nevyrábí…</p></div>
  </div>
</div>
```

### 5.3 Odhalení – `details.odhal`

Rozbalovací blok. Na doplňující látku, „otázka → odpověď“, osnovu odpovědi. Bez JS.

```html
<details class="odhal">
  <summary>Přímé a nepřímé náklady</summary>
  <div class="odhal__obsah"><p>…</p></div>
</details>
```

Přidej `open`, pokud má být rozbalený hned.

### 5.4 Záložky – `data-zalozky`

Na **členění podle různých hledisek** – místo dlouhého seznamu pod sebou.

```html
<div data-zalozky>
  <section data-zalozka="Podle druhu">…</section>
  <section data-zalozka="Podle účelu">…</section>
</div>
```

Názvy záložek krátké (max. ~20 znaků), ať se vejdou na mobil.

### 5.5 Třídička – `data-tridicka`

Uživatel roztřiďuje pojmy do skupin (klepnutím, na PC i přetažením), pak si nechá zkontrolovat. **Nejlepší komponenta na procvičení členění.**

```html
<div data-tridicka>
  <script type="application/json">
  {
    "zadani": "Zařaď náklady podle závislosti na objemu výroby",
    "kose": ["Fixní", "Variabilní", "Indiferentní"],
    "polozky": [
      ["nájemné", 0],
      ["spotřeba materiálu", 1],
      ["pokuta", 2]
    ]
  }
  </script>
</div>
```

`polozky` = `[text, index koše]`, indexy od 0. Doporučeno 2–6 košů, 6–12 položek. Položky se míchají.

### 5.6 Kartičky na opakování – `data-karticky`

Balíček flashcards. „Umím“ kartu vyřadí, „Ještě ne“ ji vrátí na konec.

```html
<div data-karticky>
  <script type="application/json">
  {
    "nazev": "Pojmy – hospodaření podniku",
    "karty": [
      ["Náklady", "Peněžní ohodnocení vstupů potřebných pro výrobu."],
      ["Bod zvratu", "Objem výroby, kdy tržby = celkové náklady."]
    ]
  }
  </script>
</div>
```

V textu karet smí být jednoduché HTML (`<b>`, `<br>`). 10–20 karet na téma.

### 5.7 Test – `data-test`

Otázky po jedné, okamžitá zpětná vazba s vysvětlením, výsledek a nejlepší skóre se ukládá. Z banky otázek se náhodně vybere `pocet`, možnosti se míchají. Na konci jde zopakovat jen chybné.

```html
<div data-test>
  <script type="application/json">
  {
    "pocet": 12,
    "otazky": [
      {"typ": "jedna", "otazka": "Který náklad je <b>fixní</b>?",
       "moznosti": ["Nájemné", "Materiál", "Přesčasy"], "spravne": 0,
       "vysvetleni": "Nájemné platíme, i když nevyrábíme."},
      {"typ": "vice", "otazka": "Které náklady jsou přímé?",
       "moznosti": ["Materiál", "Mzdy dělníků", "Energie"], "spravne": [0, 1]},
      {"typ": "ano-ne", "otazka": "Fixní náklady se nikdy nemění.", "spravne": false,
       "vysvetleni": "Mohou se změnit skokem."},
      {"typ": "cislo", "otazka": "FC 120 000 Kč, cena 80 Kč, VC/ks 50 Kč. Bod zvratu?",
       "spravne": 4000, "jednotka": "ks", "tolerance": 0}
    ]
  }
  </script>
</div>
```

| Typ | Povinné | Volitelné |
|---|---|---|
| `jedna` | `otazka`, `moznosti`, `spravne` (index) | `vysvetleni`, `zamichat: false` |
| `vice` | `otazka`, `moznosti`, `spravne` (pole indexů) | `vysvetleni`, `zamichat: false` |
| `ano-ne` | `otazka`, `spravne` (true/false) | `vysvetleni` |
| `cislo` | `otazka`, `spravne` (číslo) | `jednotka`, `tolerance`, `vysvetleni` |

**Pravidla pro otázky:**
- Banka aspoň **1,5× víc otázek** než `pocet` (např. 20 otázek, `pocet: 12`), ať se testy liší.
- Pokryj **všechny body maturitních požadavků**.
- Špatné možnosti musí být uvěřitelné – ideálně pojmy ze stejného tématu (fixní × variabilní × indiferentní), ne nesmysly.
- **Vysvětlení** piš hlavně tam, kde se dá splést. Vysvětluj *proč*, ne jen „správně je A“.
- `zamichat: false` použij, když na pořadí záleží („všechny výše uvedené“ – ale radši se takovým otázkám vyhni).
- Kontroluj indexy! `spravne` odkazuje na **původní** pořadí v `moznosti`, míchá se až potom.

### 5.8 Vlastní simulace a grafy

Kde to téma umožňuje (vzorce, grafy, výpočty), přidej **simulaci s posuvníky** – nejsilnější interaktivní prvek. Jednotné obalení:

```html
<div class="simulace" id="bz">
  <div class="legenda">
    <span style="--c:var(--accent)">tržby</span>
    <span style="--c:var(--bad)">náklady</span>
  </div>
  <svg viewBox="0 0 600 340"></svg>
  <div class="posuvnik">
    <label for="bz-fc">Fixní náklady</label><output id="bz-fc-o"></output>
    <input id="bz-fc" type="range" min="50000" max="500000" step="10000" value="200000">
  </div>
  <div class="ukazatele">
    <div class="ukazatel"><small>Bod zvratu</small><b id="bz-bz"></b></div>
  </div>
</div>
```

Logiku napiš do `<script>` na konci stránky, uvnitř `DOMContentLoaded`, a používej pomocníky z `window.Ucebna`:

| Funkce | K čemu |
|---|---|
| `Ucebna.$(sel)`, `Ucebna.$$(sel)` | querySelector / querySelectorAll (pole) |
| `Ucebna.el(tag, attrs, ...deti)` | vytvoření HTML prvku |
| `Ucebna.svg(tag, attrs)` | vytvoření SVG prvku |
| `Ucebna.kc(n)` | `200 000 Kč` |
| `Ucebna.cislo(n)` | `200 000` |
| `Ucebna.zamichej(pole)` | zamíchaná kopie pole |

**Barvy v SVG** zadávej přes `style="stroke:var(--accent)"` (ne atributem `stroke=`), jinak nebude fungovat tmavý režim. Každý widget zabal do vlastní `(() => { … })();`.

## 6. Kdy kterou komponentu

| Látka v .md | Komponenta |
|---|---|
| Definice pojmu | `box--definice` |
| Několik souvisejících pojmů (FC / VC / indiferentní) | otočné karty `data-flip` v `.mrizka` |
| Členění podle více hledisek | `data-zalozky` |
| Členění, které se dá splést | `data-tridicka` |
| Doplňující / rozšiřující látka | `details.odhal` |
| Častá chyba, chyták | `box--pozor` |
| Mnemotechnická pomůcka | `box--tip` |
| Vzorec | `.vzorec` + `box--priklad` s čísly |
| Graf, výpočet, závislost veličin | vlastní `.simulace` s posuvníky |
| Dva protiklady (zisk × ztráta) | dva `.box` v `.mrizka` s barevným okrajem |
| Seznam (5+ položek) bez další struktury | normální `<ul>`, případně třídička |

## 7. Doporučená stavba stránky

1. **Hlavička** – štítek, nadpis, perex, „Po prostudování budeš umět“
2. **Výkladové kapitoly** (3–6) – v pořadí maturitních požadavků. Každá: definice → vysvětlení → interakce → (pozor / tip)
3. **Opakování** – kartičky + `details.odhal` „🎤 Osnova odpovědi u maturity“ (body, v jakém pořadí látku odříkat)
4. **Závěrečný test** – `data-bez-hotovo`

## 8. Styl psaní

- **Tykat**, psát jako starší spolužák, ne jako učebnice. Krátké věty.
- Odborné pojmy **tučně** při prvním výskytu, přesně jak je chce maturita.
- Látka z `.md` se **nesmí ztratit ani změnit** – jen přeformulovat a zpřehlednit. Pokud doplníš příklad nebo pomůcku, nesmí být v rozporu s podklady.
- Konkrétní čísla a příklady ze života > abstraktní A, B, C.
- Žádné LaTeX (`$FC$`) – piš prostý text, případně `<sub>`/`<sup>`.
- Emoji střídmě – jen ty, které dodává CSS, a 🎤 u osnovy.

## 9. Vzhled – pravidla

- **Nepřidávej vlastní barvy.** Používej proměnné: `--accent`, `--accent-soft`, `--ok`, `--bad`, `--warn`, `--text`, `--text-muted`, `--surface`, `--border`. Pak automaticky funguje tmavý režim i barva předmětu.
- Inline `style` jen na drobnosti (okraj, `margin:0`). Opakuje-li se něco na víc stránkách → přesuň do `ucebna.css`.
- Nová obecná komponenta → přidej ji do `ucebna.css` / `ucebna.js` **a zdokumentuj tady**.
- Šířka obsahu je max. 760 px, na mobilu 16 px okraje – nic nesmí přetékat do strany (pozor na široké tabulky a SVG bez `viewBox`).

## 10. Checklist před dokončením

- [ ] Všechny body z maturitních požadavků jsou pokryté (a nic z `.md` nechybí)
- [ ] `data-tema` je unikátní a sedí s `assets/katalog.js`
- [ ] `data-zdroj` vede na existující PDF (odkaz 📄 ho otevře)
- [ ] Každá kapitola má aspoň jeden interaktivní prvek
- [ ] Kapitola Opakování (kartičky + osnova) a Závěrečný test existují
- [ ] Test: banka ≥ 1,5× `pocet`, indexy `spravne` ověřené, vysvětlení u záludných otázek
- [ ] JSON je validní (žádná čárka za posledním prvkem, uvozovky `"`)
- [ ] Stránka funguje na šířce 375 px (mobil) bez vodorovného posouvání
- [ ] Světlý i tmavý režim (◐ v liště) vypadají dobře
- [ ] V konzoli prohlížeče nejsou chyby

## 11. Spuštění a nasazení

Stránky jdou otevřít i přímo dvojklikem (`file://`) – nic se nenačítá přes `fetch`, proto jsou data v JSON přímo ve stránce. Pro testování je ale lepší lokální server:

```bash
python -m http.server 8765
```

a otevřít <http://localhost:8765>.

Nasazení: celý repozitář jde rovnou na **GitHub Pages** (Settings → Pages → branch `main`, složka `/`) nebo na jakýkoli statický hosting. Není potřeba žádný build. Postup uživatele zůstává v jeho prohlížeči.

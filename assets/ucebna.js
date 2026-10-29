/* ==========================================================================
   Učebna – sdílené komponenty všech stránek
   Dokumentace: docs/PRUVODCE.md

   Stránka tématu jen napíše obsah s data-atributy, tenhle soubor:
   - vyrobí horní lištu, obsah kapitol a ukazatel průběhu
   - přidá odkaz na zdrojové PDF (data-zdroj na <main>)
   - vypíše maturitní požadavky z katalogu a propojí je s kapitolami (data-pozadavky)
   - přidá tlačítka „Mám prostudováno" ke kapitolám
   - oživí komponenty: data-flip, data-zalozky, data-tridicka, data-karticky, data-test
   - ukládá postup do localStorage (klíč "ucebna:v1")
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Pomocné funkce ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, ...deti) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (const d of deti.flat()) if (d != null) e.append(d.nodeType ? d : document.createTextNode(d));
    return e;
  }

  function svg(tag, attrs = {}) {
    const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  function zamichej(pole) {
    const a = pole.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const kc = (n) => Math.round(n).toLocaleString("cs-CZ") + " Kč";
  const cislo = (n) => Math.round(n).toLocaleString("cs-CZ");

  function nactiJson(kontejner) {
    const s = $('script[type="application/json"]', kontejner);
    if (!s) { console.error("Chybí <script type=\"application/json\"> v", kontejner); return null; }
    try { return JSON.parse(s.textContent); }
    catch (e) { console.error("Chybný JSON v", kontejner, e); return null; }
  }

  /* ---------- Úložiště postupu ---------- */
  const KLIC = "ucebna:v1";
  function nactiStav() {
    try { return JSON.parse(localStorage.getItem(KLIC)) || { temata: {} }; }
    catch { return { temata: {} }; }
  }
  function ulozStav(stav) {
    try { localStorage.setItem(KLIC, JSON.stringify(stav)); } catch { /* soukromé okno apod. */ }
  }
  function tema(id) {
    const stav = nactiStav();
    stav.temata[id] = stav.temata[id] || { kapitoly: {}, test: null };
    return {
      data: stav.temata[id],
      uloz() { ulozStav(stav); },
    };
  }

  /* ---------- Motiv (auto / světlý / tmavý) ---------- */
  const MOTIVY = ["auto", "light", "dark"];
  const IKONY = { auto: "◐", light: "☀", dark: "☾" };
  function nastavMotiv(m) {
    if (m === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", m);
    try { localStorage.setItem("ucebna:motiv", m); } catch {}
  }
  function aktualniMotiv() {
    try { return localStorage.getItem("ucebna:motiv") || "auto"; } catch { return "auto"; }
  }
  nastavMotiv(aktualniMotiv());

  function tlacitkoMotivu() {
    const b = el("button", { class: "lista__tlacitko", type: "button", title: "Přepnout světlý / tmavý režim" });
    const obnov = () => { b.textContent = IKONY[aktualniMotiv()]; };
    b.addEventListener("click", () => {
      const m = MOTIVY[(MOTIVY.indexOf(aktualniMotiv()) + 1) % MOTIVY.length];
      nastavMotiv(m); obnov();
    });
    obnov();
    return b;
  }

  /* ---------- Lišta, obsah, kapitoly ---------- */
  function initStranka() {
    const main = $("main[data-tema]");
    if (!main) {
      // Rozcestník nebo jiná stránka bez tématu – jen přepínač motivu
      const lista = $("[data-lista]");
      if (lista) lista.append(tlacitkoMotivu());
      return;
    }
    const id = main.dataset.tema;
    const nazev = main.dataset.nazev || document.title;
    const zpet = main.dataset.zpet || "../../index.html";
    // Zdrojové PDF – cesta může obsahovat mezery a diakritiku, encodeURI ji převede na platnou URL
    const zdroj = main.dataset.zdroj ? encodeURI(main.dataset.zdroj) : null;
    const t = tema(id);
    const kapitoly = $$("section.kapitola[id]", main);
    t.data.nazev = nazev;
    t.data.pocetKapitol = kapitoly.length;
    t.data.navstiveno = Date.now();
    t.uloz();

    // Lišta
    const prubeh = el("i");
    const tlObsah = el("button", { class: "lista__tlacitko", type: "button", title: "Obsah", "aria-expanded": "false" }, "☰");
    const obsah = el("nav", { class: "obsah skryte", "aria-label": "Obsah" });
    const ol = el("ol");
    obsah.append(ol);
    const header = el("header", { class: "lista" },
      el("div", { class: "lista__vnitrek" },
        el("a", { class: "lista__zpet", href: zpet }, "← Témata"),
        el("div", { class: "lista__nazev" }, nazev),
        zdroj ? el("a", { class: "lista__tlacitko", href: zdroj, target: "_blank", rel: "noopener", title: "Otevřít zdrojové PDF", style: "text-decoration:none" }, "📄") : null,
        tlObsah, tlacitkoMotivu()),
      obsah,
      el("div", { class: "lista__prubeh" }, prubeh));
    document.body.prepend(header);

    const hlavicka = $(".hlavicka", main);
    if (zdroj && hlavicka) {
      const perex = $(".hlavicka__perex", hlavicka);
      const odkaz = el("a", { class: "zdroj-odkaz", href: zdroj, target: "_blank", rel: "noopener" }, "📄 Nakouknout do zdroje (PDF)");
      perex ? perex.after(odkaz) : hlavicka.append(odkaz);
    }

    tlObsah.addEventListener("click", () => {
      const skryt = obsah.classList.toggle("skryte");
      tlObsah.setAttribute("aria-expanded", String(!skryt));
    });

    const pozadavky = initPozadavky(main, id, kapitoly, t);

    // Kapitoly: číslo, položka obsahu, tlačítko „hotovo"
    const odkazy = {};
    kapitoly.forEach((k, i) => {
      const h2 = $("h2", k);
      const titulek = h2 ? h2.textContent.trim() : k.id;
      if (h2 && !$(".cislo", h2)) h2.prepend(el("span", { class: "cislo" }, String(i + 1)));
      const a = el("a", { href: "#" + k.id, onclick: () => { obsah.classList.add("skryte"); tlObsah.setAttribute("aria-expanded", "false"); } },
        el("span", { class: "fajfka" }, "✓"), titulek);
      odkazy[k.id] = a;
      ol.append(el("li", {}, a));

      if (k.hasAttribute("data-bez-hotovo")) return;
      const b = el("button", { class: "hotovo-tlacitko", type: "button" });
      const obnov = () => {
        const h = !!t.data.kapitoly[k.id];
        b.setAttribute("aria-pressed", String(h));
        b.textContent = h ? "✓ Prostudováno" : "Mám prostudováno";
        a.classList.toggle("hotovo", h);
      };
      b.addEventListener("click", () => {
        t.data.kapitoly[k.id] = !t.data.kapitoly[k.id];
        t.uloz(); obnov(); pozadavky.obnov();
      });
      k.append(b);
      obnov();
    });

    pozadavky.obnov();

    // Ukazatel čtení
    const naScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      prubeh.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    };
    addEventListener("scroll", naScroll, { passive: true });
    naScroll();
  }

  /* ---------- Maturitní požadavky ----------
     Text bere z window.KATALOG (assets/katalog.js), kapitoly se k nim hlásí
     atributem data-pozadavky="1 2 3" (čísla bodů od 1). */
  function initPozadavky(main, id, kapitoly, t) {
    const nic = { obnov() {} };
    const tema = (window.KATALOG || []).flatMap((p) => p.temata).find((x) => x.id === id);
    if (!tema || !tema.pozadavky) return nic;

    // Který bod pokrývají které kapitoly
    const pokryti = tema.pozadavky.map(() => []);
    kapitoly.forEach((k) => {
      const cisla = (k.dataset.pozadavky || "").split(/[\s,]+/).filter(Boolean).map(Number);
      cisla.forEach((n) => {
        if (pokryti[n - 1]) pokryti[n - 1].push(k);
        else console.warn(`Kapitola #${k.id} odkazuje na neexistující požadavek ${n}`);
      });
      // Štítky pod nadpisem kapitoly
      if (cisla.length) {
        const h2 = $("h2", k);
        const radek = el("p", { class: "kapitola__pozadavky" }, el("span", {}, "Maturita:"),
          cisla.filter((n) => tema.pozadavky[n - 1]).map((n) => el("span", { class: "pozadavek-stitek" }, tema.pozadavky[n - 1])));
        h2 ? h2.after(radek) : k.prepend(radek);
      }
    });

    const souhrn = el("span", { class: "pozadavky__stav" });
    const polozky = tema.pozadavky.map((text, i) => {
      const li = el("li", {}, el("span", { class: "pozadavky__text" }, text),
        pokryti[i].length
          ? el("span", { class: "pozadavky__odkazy" }, pokryti[i].map((k) =>
              el("a", { href: "#" + k.id }, "→ " + ($("h2", k) ? $("h2", k).textContent.replace(/^\d+/, "").trim() : k.id))))
          : el("span", { class: "pozadavky__chybi" }, "na stránce chybí"));
      return li;
    });
    pokryti.forEach((p, i) => { if (!p.length) console.warn(`Maturitní požadavek ${i + 1} „${tema.pozadavky[i]}" nepokrývá žádná kapitola`); });

    const box = el("details", { class: "odhal pozadavky" },
      el("summary", {}, "📋 Maturitní požadavky ", souhrn),
      el("div", { class: "odhal__obsah" },
        el("p", { class: "ztlumene", style: "font-size:.9rem" }, "Oficiální body k otázce. ✓ = prostudoval/a jsi všechny kapitoly, které bod pokrývají."),
        el("ol", {}, polozky)));
    const cile = $(".hlavicka .cile", main);
    if (cile) cile.after(box); else ($(".hlavicka", main) || main).append(box);

    return {
      obnov() {
        let hotovo = 0;
        polozky.forEach((li, i) => {
          const h = pokryti[i].length > 0 && pokryti[i].every((k) => t.data.kapitoly[k.id]);
          li.classList.toggle("hotovo", h);
          if (h) hotovo++;
        });
        souhrn.textContent = `${hotovo}/${polozky.length}`;
      },
    };
  }

  /* ---------- Otočná karta: <div class="karta" data-flip> ---------- */
  function initFlip(k) {
    const lic = $(".karta__lic", k), rub = $(".karta__rub", k);
    if (!lic || !rub) return;
    const vn = el("div", { class: "karta__vnitrek" });
    vn.append(lic, rub);
    k.append(vn);
    k.setAttribute("role", "button");
    k.setAttribute("tabindex", "0");
    const otoc = () => k.classList.toggle("otocena");
    k.addEventListener("click", otoc);
    k.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); otoc(); } });
  }

  /* ---------- Záložky: <div data-zalozky><section data-zalozka="Název">… ---------- */
  function initZalozky(box) {
    const panely = $$(":scope > [data-zalozka]", box);
    const lista = el("div", { class: "zalozky__lista", role: "tablist" });
    const tlacitka = panely.map((p, i) => {
      p.classList.add("zalozky__panel");
      p.setAttribute("role", "tabpanel");
      const b = el("button", { type: "button", role: "tab" }, p.dataset.zalozka);
      b.addEventListener("click", () => vyber(i));
      lista.append(b);
      return b;
    });
    function vyber(i) {
      panely.forEach((p, j) => p.hidden = i !== j);
      tlacitka.forEach((b, j) => b.setAttribute("aria-selected", String(i === j)));
    }
    box.prepend(lista);
    vyber(0);
  }

  /* ---------- Třídička: data-tridicka + JSON {zadani, kose[], polozky[[text, indexKose]]} ---------- */
  function initTridicka(box) {
    const d = nactiJson(box);
    if (!d) return;
    box.classList.add("tridicka");
    box.innerHTML = "";
    const zasobnik = el("div", { class: "tridicka__zasobnik" });
    const kose = d.kose.map((nazev, i) => {
      const polozky = el("div", { class: "polozky" });
      const kos = el("div", { class: "tridicka__kos", "data-i": i }, el("h4", {}, nazev), polozky);
      kos.polozky = polozky;
      return kos;
    });
    const vysledek = el("span", { class: "vysledek", "aria-live": "polite" });
    const tlKontrola = el("button", { class: "btn", type: "button" }, "Zkontrolovat");
    const tlZnovu = el("button", { class: "btn btn--sek", type: "button" }, "Znovu");

    box.append(
      el("p", { class: "tridicka__zadani" }, d.zadani || "Roztřiď pojmy"),
      el("p", { class: "tridicka__navod" }, "Klepni na pojem a pak na skupinu, kam patří (na PC ho můžeš i přetáhnout)."),
      zasobnik,
      el("div", { class: "tridicka__kose" }, kose),
      el("div", { class: "tridicka__ovladani" }, tlKontrola, tlZnovu, vysledek));

    let vybrany = null;
    const vyber = (chip) => {
      if (vybrany) vybrany.classList.remove("vybrany");
      vybrany = chip === vybrany ? null : chip;
      if (vybrany) vybrany.classList.add("vybrany");
      box.classList.toggle("vybrano", !!vybrany);
    };
    const presun = (chip, cil) => {
      chip.classList.remove("spravne", "spatne");
      cil.append(chip);
      vyber(null);
      vysledek.textContent = "";
    };

    function rozdej() {
      zasobnik.innerHTML = "";
      kose.forEach((k) => k.polozky.innerHTML = "");
      vysledek.textContent = "";
      zamichej(d.polozky).forEach(([text, spravnyKos]) => {
        const chip = el("button", { class: "chip", type: "button", draggable: "true" }, text);
        chip.spravnyKos = spravnyKos;
        chip.addEventListener("click", (e) => { e.stopPropagation(); vyber(chip); });
        chip.addEventListener("dragstart", (e) => { vyber(null); vyber(chip); e.dataTransfer.setData("text/plain", ""); });
        zasobnik.append(chip);
      });
    }

    kose.forEach((kos) => {
      kos.addEventListener("click", () => { if (vybrany) presun(vybrany, kos.polozky); });
      kos.addEventListener("dragover", (e) => { e.preventDefault(); kos.classList.add("nad"); });
      kos.addEventListener("dragleave", () => kos.classList.remove("nad"));
      kos.addEventListener("drop", (e) => { e.preventDefault(); kos.classList.remove("nad"); if (vybrany) presun(vybrany, kos.polozky); });
    });
    zasobnik.addEventListener("click", () => { if (vybrany && vybrany.parentElement !== zasobnik) presun(vybrany, zasobnik); });

    tlKontrola.addEventListener("click", () => {
      let ok = 0;
      kose.forEach((kos, i) => $$(".chip", kos).forEach((c) => {
        const dobre = c.spravnyKos === i;
        c.classList.toggle("spravne", dobre);
        c.classList.toggle("spatne", !dobre);
        if (dobre) ok++;
      }));
      const zbyva = $$(".chip", zasobnik).length;
      const vse = d.polozky.length;
      vysledek.className = "vysledek " + (ok === vse ? "ok" : "bad");
      vysledek.textContent = ok === vse ? `Výborně, všech ${vse} správně!`
        : `Správně ${ok} z ${vse}` + (zbyva ? ` (nezařazeno: ${zbyva})` : "") + ". Červené přesuň jinam.";
    });
    tlZnovu.addEventListener("click", rozdej);
    rozdej();
  }

  /* ---------- Kartičky na opakování: data-karticky + JSON {karty: [[líc, rub]]} ---------- */
  function initKarticky(box) {
    const d = nactiJson(box);
    if (!d) return;
    box.classList.add("balicek");
    box.innerHTML = "";
    let fronta = [], umim = 0;

    const pocitadlo = el("span");
    const lic = el("div", { class: "karta__lic" });
    const rub = el("div", { class: "karta__rub" });
    const karta = el("div", { class: "karta" }, lic, rub);
    initFlip(karta);
    const tlNeumim = el("button", { class: "btn btn--sek", type: "button" }, "↺ Ještě ne");
    const tlUmim = el("button", { class: "btn", type: "button" }, "✓ Umím");
    const tlZnovu = el("button", { class: "btn btn--sek", type: "button" }, "Zamíchat znovu");
    const hotovo = el("div", { class: "test__souhrn skryte" });

    box.append(
      el("div", { class: "balicek__hlava" }, el("span", {}, d.nazev || "Kartičky"), pocitadlo),
      karta, hotovo,
      el("div", { class: "balicek__ovladani" }, tlNeumim, tlUmim, tlZnovu));

    function ukaz() {
      pocitadlo.textContent = `umím ${umim} / ${d.karty.length}`;
      if (!fronta.length) {
        karta.classList.add("skryte");
        tlNeumim.classList.add("skryte"); tlUmim.classList.add("skryte");
        hotovo.classList.remove("skryte");
        hotovo.innerHTML = "<div class='test__skore'>🎉</div><p>Prošel/a jsi všechny kartičky.</p>";
        return;
      }
      karta.classList.remove("skryte", "otocena");
      tlNeumim.classList.remove("skryte"); tlUmim.classList.remove("skryte");
      hotovo.classList.add("skryte");
      // Krátké zpoždění, ať se při otáčení zpět neukáže rub nové karty
      setTimeout(() => { lic.innerHTML = fronta[0][0]; rub.innerHTML = fronta[0][1]; }, karta.dataset.bylo ? 150 : 0);
      karta.dataset.bylo = "1";
    }
    tlUmim.addEventListener("click", () => { fronta.shift(); umim++; ukaz(); });
    tlNeumim.addEventListener("click", () => { fronta.push(fronta.shift()); ukaz(); });
    tlZnovu.addEventListener("click", () => { fronta = zamichej(d.karty); umim = 0; ukaz(); });
    fronta = zamichej(d.karty);
    ukaz();
  }

  /* ---------- Test: data-test + JSON {pocet?, otazky: [...]} ----------
     typy otázek:
       {typ:"jedna", otazka, moznosti[], spravne: index, vysvetleni?}
       {typ:"vice",  otazka, moznosti[], spravne: [indexy], vysvetleni?}
       {typ:"ano-ne", otazka, spravne: true|false, vysvetleni?}
       {typ:"cislo", otazka, spravne: číslo, tolerance?: 0, jednotka?: "Kč", vysvetleni?}
  */
  function initTest(box) {
    const d = nactiJson(box);
    if (!d) return;
    const main = $("main[data-tema]");
    const t = main ? tema(main.dataset.tema) : null;
    box.classList.add("test");
    box.innerHTML = "";
    let sada = [], i = 0, body = 0, chybne = [];

    function start(otazky) {
      sada = zamichej(otazky).slice(0, d.pocet || otazky.length).map(pripravOtazku);
      i = 0; body = 0; chybne = [];
      ukazOtazku();
    }

    // Zamíchá možnosti a přepočítá indexy správných odpovědí
    function pripravOtazku(o) {
      if (o.typ === "ano-ne") return { ...o, moznosti: ["Ano, platí", "Ne, neplatí"], spravne: o.spravne ? 0 : 1, typ: "jedna", puvodni: o };
      if (o.typ === "cislo") return { ...o, puvodni: o };
      const poradi = o.zamichat === false ? o.moznosti.map((_, j) => j) : zamichej(o.moznosti.map((_, j) => j));
      const spr = [].concat(o.spravne);
      return {
        ...o, puvodni: o,
        moznosti: poradi.map((j) => o.moznosti[j]),
        spravne: poradi.map((j, novy) => spr.includes(j) ? novy : -1).filter((x) => x >= 0),
      };
    }

    function ukazOtazku() {
      box.innerHTML = "";
      if (i >= sada.length) return souhrn();
      const o = sada[i];
      const karta = el("div", { class: "test__otazka", "data-typ": o.typ });
      karta.append(el("h4", {}, el("span", {}, `${i + 1}/${sada.length}`), el("span", { html: o.otazka, style: "color:inherit;font-weight:inherit;margin:0" })));
      const tlKontrola = el("button", { class: "btn", type: "button", disabled: true }, "Zkontrolovat");
      const tlDalsi = el("button", { class: "btn skryte", type: "button" }, i + 1 < sada.length ? "Další otázka →" : "Zobrazit výsledek");
      let vyhodnot;

      if (o.typ === "cislo") {
        const vstup = el("input", { class: "test__vstup", type: "text", inputmode: "decimal", placeholder: "Napiš výsledek" + (o.jednotka ? ` (${o.jednotka})` : "") });
        vstup.addEventListener("input", () => tlKontrola.disabled = !vstup.value.trim());
        vstup.addEventListener("keydown", (e) => { if (e.key === "Enter" && !tlKontrola.disabled) tlKontrola.click(); });
        karta.append(vstup);
        vyhodnot = () => {
          const n = parseFloat(vstup.value.replace(/\s/g, "").replace(",", "."));
          vstup.disabled = true;
          const ok = Math.abs(n - o.spravne) <= (o.tolerance || 0);
          vstup.style.borderColor = ok ? "var(--ok)" : "var(--bad)";
          return { ok, spravnaOdpoved: cislo(o.spravne) + (o.jednotka ? " " + o.jednotka : "") };
        };
      } else {
        const vice = o.typ === "vice";
        const zvolene = new Set();
        const moznosti = el("div", { class: "test__moznosti" });
        const tlacitka = o.moznosti.map((m, j) => {
          const b = el("button", { class: "test__moznost", type: "button", "aria-pressed": "false" }, el("span", { class: "znacka" }), el("span", { html: m }));
          b.addEventListener("click", () => {
            if (vice) { zvolene.has(j) ? zvolene.delete(j) : zvolene.add(j); }
            else { zvolene.clear(); zvolene.add(j); }
            tlacitka.forEach((x, k) => x.setAttribute("aria-pressed", String(zvolene.has(k))));
            tlKontrola.disabled = zvolene.size === 0;
          });
          moznosti.append(b);
          return b;
        });
        if (vice) karta.append(el("p", { class: "ztlumene", style: "margin:-4px 0 8px;font-size:.85rem" }, "Může být více správných odpovědí."));
        karta.append(moznosti);
        vyhodnot = () => {
          tlacitka.forEach((b, k) => {
            b.disabled = true;
            b.setAttribute("aria-pressed", "false");
            if (o.spravne.includes(k)) b.classList.add("spravne");
            else if (zvolene.has(k)) b.classList.add("spatne");
          });
          const ok = o.spravne.length === zvolene.size && o.spravne.every((k) => zvolene.has(k));
          return { ok };
        };
      }

      const zpetnaVazba = el("div", { "aria-live": "polite" });
      karta.append(zpetnaVazba, el("div", { class: "test__ovladani", style: "justify-content:flex-start" }, tlKontrola, tlDalsi));
      tlKontrola.addEventListener("click", () => {
        const { ok, spravnaOdpoved } = vyhodnot();
        if (ok) body++; else chybne.push(o.puvodni);
        const text = (ok ? "<b class='vysledek ok'>✓ Správně.</b> " : "<b class='vysledek bad'>✗ Špatně.</b> ")
          + (!ok && spravnaOdpoved ? `Správně je <b>${spravnaOdpoved}</b>. ` : "")
          + (o.vysvetleni || "");
        zpetnaVazba.append(el("div", { class: "test__vysvetleni", html: text }));
        tlKontrola.classList.add("skryte");
        tlDalsi.classList.remove("skryte");
        tlDalsi.focus();
      });
      tlDalsi.addEventListener("click", () => { i++; ukazOtazku(); box.scrollIntoView({ block: "start" }); });
      box.append(karta);
    }

    function souhrn() {
      const proc = Math.round((body / sada.length) * 100);
      let nejlepsi = proc;
      if (t) {
        const pred = t.data.test;
        nejlepsi = Math.max(proc, pred ? pred.nejlepsi : 0);
        t.data.test = { nejlepsi, posledni: proc, kdy: Date.now() };
        t.uloz();
      }
      const hodnoceni = proc >= 90 ? "Výborně! Tohle umíš. 🎉" : proc >= 70 ? "Dobrá práce, ještě pár detailů." : proc >= 50 ? "Na půl cesty – projdi si chybné otázky." : "Zkus si téma ještě jednou projít.";
      const tlZnovu = el("button", { class: "btn", type: "button" }, "Nový test");
      const tlChybne = el("button", { class: "btn btn--sek", type: "button" }, `Jen chybné (${chybne.length})`);
      tlZnovu.addEventListener("click", () => start(d.otazky));
      tlChybne.addEventListener("click", () => start(chybne));
      box.append(el("div", { class: "test__souhrn" },
        el("div", { class: "test__skore" }, `${body} / ${sada.length}`),
        el("p", {}, `${proc} % – ${hodnoceni}`),
        el("p", { class: "ztlumene" }, `Nejlepší výsledek: ${nejlepsi} %`),
        el("div", { class: "test__ovladani" }, tlZnovu, chybne.length ? tlChybne : null)));
    }

    // Úvodní obrazovka
    const n = Math.min(d.pocet || d.otazky.length, d.otazky.length);
    const pred = t && t.data.test;
    const tlStart = el("button", { class: "btn", type: "button" }, "Spustit test");
    tlStart.addEventListener("click", () => start(d.otazky));
    box.append(el("div", { class: "test__souhrn" },
      el("p", { style: "margin-top:0" }, `${n} otázek náhodně vybraných z ${d.otazky.length}.`),
      pred ? el("p", { class: "ztlumene" }, `Nejlepší výsledek: ${pred.nejlepsi} %, naposledy ${pred.posledni} %`) : null,
      tlStart));
  }

  /* ---------- Spuštění ---------- */
  function init() {
    initStranka();
    $$("[data-flip]").forEach(initFlip);
    $$("[data-zalozky]").forEach(initZalozky);
    $$("[data-tridicka]").forEach(initTridicka);
    $$("[data-karticky]").forEach(initKarticky);
    $$("[data-test]").forEach(initTest);
  }

  // Veřejné API pro vlastní widgety na stránkách
  window.Ucebna = { el, svg, $, $$, zamichej, kc, cislo, nactiStav, tema };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

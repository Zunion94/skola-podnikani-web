/* ==========================================================================
   Katalog předmětů a témat – z něj se vykresluje rozcestník (index.html).
   Nová stránka tématu = doplň "soubor" (cesta od kořene projektu) a "id"
   (stejné jako data-tema v <main> té stránky).
   ========================================================================== */
window.KATALOG = [
  {
    predmet: "ekonomie",
    nazev: "Ekonomie",
    popis: "Maturitní okruhy 1–20",
    temata: [
      { c: 1,  nazev: "Základní ekonomické pojmy" },
      { c: 2,  nazev: "Národní hospodářství" },
      { c: 3,  nazev: "Trh" },
      { c: 4,  nazev: "Poruchy trhu" },
      { c: 5,  nazev: "Hospodářská politika" },
      { c: 6,  nazev: "Zahraniční obchod a celnictví" },
      { c: 7,  nazev: "Rozpočtová soustava" },
      { c: 8,  nazev: "Daňová soustava" },
      { c: 9,  nazev: "Živnostenské podnikání" },
      { c: 10, nazev: "Obchodní společnosti a družstva" },
      { c: 11, nazev: "Dlouhodobý majetek podniku" },
      { c: 12, nazev: "Zásobování podniku, oběžný majetek" },
      { c: 13, nazev: "Výroba" },
      { c: 14, nazev: "Personální činnost podniku" },
      { c: 15, nazev: "Odměňování pracovníků" },
      { c: 16, nazev: "Hospodaření podniku", id: "ekonomie-16", soubor: "ekonomie/web/16-hospodareni-podniku.html" },
      { c: 17, nazev: "Financování podniku" },
      { c: 18, nazev: "Odbytová funkce podniku" },
      { c: 19, nazev: "Bankovní soustava" },
      { c: 20, nazev: "Evropská unie a světové organizace" },
    ],
  },
];

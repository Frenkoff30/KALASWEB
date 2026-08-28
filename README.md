# Zlatnictví Vlastimil Kalaš: redesign webu

Moderní responzivní web pro zlatnický ateliér Vlastimila Kalaše (Praha 2).
Náhrada za původní web `zlatnictvi-kalas.cz`. Veškerý obsah, kontakty,
katalogy i fotografie pocházejí z původního webu.

**Statický web**: čisté HTML, CSS a JavaScript. Žádný build, žádné závislosti,
žádný framework. Nahraje se na hosting jako obyčejné soubory.

---

## Spuštění

Web funguje i po dvojkliku na `src/index.html`. Pro plnou věrnost
(správné cesty, mapa, cache) ho ale radši pusťte přes lokální server:

```bash
python -m http.server 5599 --directory src
```

Pak otevřete <http://localhost:5599>.

---

## Struktura

```
ZLATNICTVIWEB/
├── README.md               ← tento soubor
├── docs/
│   └── DESIGN.md           ← designový systém (barvy, písma, komponenty)
├── design-system/          ← výstup skillu ui-ux-pro-max (podklad pro návrh)
├── skills/                 ← skill ui-ux-pro-max
└── src/                    ← SAMOTNÝ WEB (nahrává se na hosting
    ├── index.html          Domů: hero, ukázka prací, nabídka
    ├── atelier.html        O ateliéru, portrét, jak zakázka probíhá
    ├── sluzby.html         15 služeb + detaily technologií + co vyrábíme
    ├── galerie.html        Galerie s filtrováním a lightboxem
    ├── katalogy.html       Katalogy ke stažení + výkup zlata
    ├── spoluprace.html     Svatební salony a partneři
    ├── kontakt.html        Kontakty, poptávkový formulář, mapa
    ├── favicon.svg
    └── assets/
        ├── css/style.css   ← VŠECHNY styly (jeden soubor, 12 očíslovaných částí)
        ├── js/
        │   ├── data.js     ← obsah galerie a partnerů (jediné místo k úpravám)
        │   └── app.js      ← chování webu (motiv, menu, galerie, lightbox, formulář)
        ├── img/
        │   ├── gallery/    54 fotek realizací + složka thumb/ s náhledy
        │   ├── hero/       velké fotky pro úvodní a obsahové sekce
        │   └── brand/      logo a náhledový obrázek pro sociální sítě
        └── files/          katalogy a obchodní podmínky v PDF
```

### Proč jeden `style.css` a jeden `app.js`

Menší web se sedmi stránkami nepotřebuje desítky souborů. Víc souborů
znamená víc HTTP požadavků a hlavně víc míst, kde něco hledat.
Oba soubory jsou proto uvnitř rozdělené očíslovanými sekcemi
(`01 TOKENY`, `02 RESET`, …), takže se v nich orientuje stejně dobře
jako ve složkách, jen bez přeskakování mezi soubory.

---

## Jak web upravovat

### Přidat fotku do galerie

1. Velkou verzi (max 1400 px na šířku) ulož jako `src/assets/img/gallery/nazev.jpg`
2. Náhled (700 px) jako `src/assets/img/gallery/thumb/nazev.jpg`
3. Do `src/assets/js/data.js` přidej řádek:

```js
{ s: 'nazev', c: 'snubni', t: 'Popisek fotky' },
```

Kategorie (`c`): `snubni`, `zasnubni`, `prsteny`, `privesky`, `nausnice`,
`firemni`, `navrhy`, `svatba`. Počty u filtrů se dopočítají samy.

### Přidat svatební salon nebo partnera

Rovněž v `src/assets/js/data.js`, pole `KALAS.partners` (karty s webem)
a `KALAS.salons` (prostý seznam).

### Změnit barvy nebo písma

Vše je v `src/assets/css/style.css`, sekce `01 TOKENY`. Změna jedné proměnné
se propíše do celého webu. Tmavý motiv má vlastní sadu hodnot hned pod světlým.

### Změnit menu

Hlavička a patička jsou kvůli jednoduchosti (bez build kroku) na každé
stránce zvlášť. Při změně menu je potřeba upravit `<nav class="nav">`
a patičku ve všech sedmi `.html` souborech.

### Psaní textů

Web mluví v první osobě jednotného čísla (jsem, vyrábím, ozvu se) a
**nepoužívá pomlčky**. Věty se dělí čárkou, dvojtečkou nebo tečkou.

Každá informace má na webu **jedno místo**. Vzdělání a rok 1999 jsou
v odstavci na stránce Ateliér, adresa v patičce a na Kontaktu, postup
zakázky jen na Ateliéru. Když něco přidáváte, zkontrolujte, jestli to
už jinde není.

---

## Poptávkový formulář

Web je statický, takže formulář po ověření polí otevře předvyplněnou zprávu
v e-mailovém programu návštěvníka (`mailto:`). Funguje to všude a bez serveru.

**Napojení na skutečné odesílání** (např. Formspree, EmailJS nebo PHP skript):
v `src/assets/js/app.js`, sekce `8 FORMULÁŘ POPTÁVKY`, stačí přepsat funkci
`send()`. Validace, chybové stavy i potvrzovací hláška zůstanou beze změny.

---

## Co web umí

- **Světlý i tmavý motiv**, přepínač v hlavičce. Volba se pamatuje
  (`localStorage`) a nastaví se ještě před vykreslením, takže stránka neproblikne
- **Plně responzivní**, ověřeno na 375, 390, 768, 1024 a 1440 px, bez vodorovného posuvu
- **Galerie** s filtrováním podle typu šperku, postupným načítáním po 12 fotkách
  a lightboxem ovládaným klávesnicí (←, →, Esc) i přejetím prstem
- **Přístupnost**: sémantické HTML, `aria-current` pro aktuální stránku,
  viditelný focus, popisky u všech ikon, udržení fokusu v otevřeném menu
  i lightboxu, kontrast textu min. 4,5:1, respekt k `prefers-reduced-motion`
- **SEO**: vlastní `<title>` a popis pro každou stránku, kanonické URL,
  Open Graph náhled, drobečková navigace
- **Obrázky** přepočítané na rozumnou velikost, `loading="lazy"`,
  uvedené rozměry (nic neposkakuje při načítání), popisné `alt` texty
- **Zvlněné přechody** mezi sekcemi se zlatou linkou, čisté SVG bez obrázků

---

## Nasazení

Nahraj **obsah složky `src/`** do kořene webhostingu. Nic dalšího není potřeba.

Před ostrým spuštěním doporučuji:

1. Doplnit skutečnou stránku se zásadami ochrany osobních údajů
   (v patičce zatím odkazuje jen na obchodní podmínky).
2. Ověřit u zadavatele texty psané v první osobě (web mluví hlasem
   Vlastimila Kalaše) a údaj „v oboru od roku 1999“.
3. Případně napojit formulář na server (viz výše).
4. **Nafotit nové fotografie.** Podklady z původního webu mají maximálně
   960 px na šířku, většina jen 500 px, což je na dnešní displeje málo.
   Web je na kvalitnější fotky připravený, stačí je vyměnit ve stejných cestách.

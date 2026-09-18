# Designový systém: Zlatnictví Vlastimil Kalaš

Vše, co je tady popsané, žije v `src/assets/css/style.css`, sekce `01 TOKENY`.
Změna proměnné se propíše do celého webu.

---

## Myšlenka

Web má **jeden styl, žádný přepínač motivu**. Tmavá scéna nahoře a dole
(hero a patička) rámuje krémový, zlatem laděný obsah.

1. **Fotka je hrdina.** Rozhraní je tiché, šperk na fotce dostává prostor.
2. **Krátké texty, jeden cíl.** Web vede návštěvníka k poptávce. Žádné dlouhé
   odstavce, každá sekce má nadpis a nanejvýš jednu větu.
3. **Nic se neopakuje.** Každá informace, fotka i výzva má na webu jedno
   místo. Kontakty jen na stránce Kontakt, IČO a DIČ jen v patičce, portrét
   zlatníka jen na stránce Ateliér.
4. **Žádné pomlčky.** Věty se dělí čárkou, dvojtečkou nebo tečkou.
5. **Zlato jako akcent.** Linky, kurzíva v nadpisech, hlavní tlačítko na scéně.
   Nikdy jako velká plocha.

---

## Barvy

### Krémový obsah

| Proměnná | Hodnota | Použití | Kontrast |
|---|---|---|---|
| `--bg` | `#F7F1E6` | hlavní pozadí | |
| `--bg-soft` | `#EFE6D5` | střídané sekce | |
| `--bg-deep` | `#E6D8BF` | závěrečná výzva | |
| `--surface` | `#FBF7EF` | karty, formulář | |
| `--line`, `--line-2` | `#E0D2BA`, `#CBB895` | linky a obrysy | |
| `--ink` | `#2A2118` | hlavní text, espresso místo černé | 14 : 1 |
| `--ink-2` | `#67594A` | doplňkový text | 6 : 1 |
| `--ink-3` | `#72624C` | malé popisky | 5,2 : 1 |
| `--gold` | `#80591A` | zlatý text a kurzíva | 5,6 : 1 |
| `--gold-bright` | `#BF9748` | linky, kosočtverce, výplň tlačítka při najetí | jen dekorace |

### Tmavá scéna (`--stage-*`)

| Proměnná | Hodnota | Použití | Kontrast |
|---|---|---|---|
| `--stage` | `#100C08` | pozadí hero a patičky | |
| `--stage-ink` | `#F6EEDF` | nadpisy | 17 : 1 |
| `--stage-ink-2` | `#CDBEA5` | doplňkový text | 10,7 : 1 |
| `--stage-ink-3` | `#9C8C75` | drobné údaje v patičce | 6 : 1 |
| `--stage-gold` | `#DFC07A` | hlavní tlačítko, zlaté linky | 11 : 1 |

> `--gold-bright` nikdy nepoužívej pro běžný text na krémové, kontrast nestačí.

---

## Typografie

| Role | Písmo | Kde |
|---|---|---|
| Nadpisy | **Cormorant Garamond** 500, kurzíva pro zlatý akcent | `.h1`, `.h2`, názvy karet |
| Text | **Jost** 400/500 | vše ostatní, popisky verzálkami s prostrkáním |

Na celém webu platí `font-variant-numeric: lining-nums`. Cormorant má jinak
číslice různé výšky a telefonní čísla by poskakovala.

Nadpis v hero má velikost `min(8vw, 16vh)`. Nejširší řádek „vyrobený rukou“
měří 5,3 em, textový sloupec 47vw, takže nadpis vždy skončí před fotkami.
Při změně textu nadpisu je potřeba tenhle poměr přepočítat.

---

## Hero

- **Text vlevo, fotky vpravo, nikdy přes sebe.** Na výšku orientovaných
  obrazovkách jsou fotky nad textem.
- **Sedm studiových fotek na černém pozadí** se prolíná dokola po 5,5 s,
  vždy se dopředu stáhne jen ta další. Černá zmizí do barvy scény díky
  `mix-blend-mode: screen`, proto do hero patří jen fotky s černým pozadím.
- Levý okraj fotek se rozplyne jednou maskou. **Kombinace dvou masek**
  (`mask-composite`) ve všech prohlížečích nefunguje a nechá ostrou hranu.
- Zlatá oběžná dráha s kosočtvercem opakuje prsten z loga.
- Jediné tlačítko, žádné počítadlo fotek, žádná výzva k rolování.

Nové fotky do hero: černé pozadí, 1600 × 1200 px, uložit do
`src/assets/img/hero/`, pozici šperku doladit přes `--pos` u daného slidu.

---

## Rytmus a prostor

- `--section` svislé odsazení sekcí, `--gutter` boční okraje obsahu
- `--edge` okraj hlavičky a hero, s šířkou obrazovky roste až na 7 rem
- `--maxw: 76rem` běžný obsah, `90rem` širší sekce
- Sekce se střídají `--bg`, `--bg-soft`, závěrečná výzva `--bg-deep`

---

## Komponenty

| Třída | Popis |
|---|---|
| `.btn.primary` | hlavní akce; na krémové espresso, na scéně zlaté, výplň se při najetí nalije zleva |
| `.btn.ghost` | vedlejší akce, obrys |
| `.go` | kulatá šipka u celé klikací karty, místo textu „více“ |
| `.offer-card` | karta nabídky s fotkou v oblouku |
| `.arch` | fotka v oblouku (nabídka, citát, portrét) |
| `.gallery--row` | jedna řada menších fotek s dlaždicí odkazu na galerii |
| `.process` | čtyři kroky cesty ke šperku se zlatou linkou |
| `.services` | číslovaný rejstřík služeb |
| `.card.media` | karta s fotkou (technologie, katalogy) |
| `.contact-item` | kontaktní řádek s ikonou |
| `.closing` | závěrečná výzva na konci stránek |
| `.credit` | podpis Webo Studia v patičce, logo převedené do zlatých tónů |

---

## Pohyb

- Plynulé rolování kolečkem přes **Lenis** z CDN. Když se nenačte, web jede
  na běžném rolování.
- Plynulý přechod mezi stránkami přes `@view-transition` (Chrome, Edge, Safari 18+)
- Nadpis hero vyjíždí po řádcích zpod masky, fotky se pomalu přibližují
- Odhalování při rolování `[data-reveal]`, fotky v oblouku `data-reveal="mask"`
- Hlavička se při rolování dolů schová a nahoru vrátí
- `prefers-reduced-motion: reduce` vypne animace, prezentaci i plynulé rolování

---

## Přístupnost

- Kontrast běžného textu min. 4,5 : 1 (tabulky výše)
- Viditelný focus (`:focus-visible`), fokus zůstává v otevřeném menu i lightboxu
- Prezentaci v hero zastaví kliknutí na přepínač fotek
- Chyby formuláře mají ikonu i text, aktivní stránka v menu `aria-current="page"`
- Odkazy do nového okna to oznamují skrytým textem

# Designový systém: Zlatnictví Vlastimil Kalaš

Vše, co je tady popsané, žije v `src/assets/css/style.css`, sekce `01 TOKENY`.
Změna proměnné se propíše do celého webu.

---

## Myšlenka

Zlatnictví prodává **řemeslo a důvěru**, ne objem. Design proto stojí na
třech pravidlech:

1. **Fotka je hrdina.** Barevná paleta je záměrně tichá, aby šperk na fotce
   nekonkuroval rozhraní.
2. **Zlato jen jako akcent.** Nikdy jako plocha, pouze linky, ikony, aktivní
   stavy a hlavní tlačítko. Zlatá plocha přes celý blok působí lacině.
3. **Míň prvků, víc vzduchu.** Sedm krátkých stránek s jasnými prokliky
   místo jedné nekonečné rolovací stránky.
4. **Nejdřív zboží, potom řeči.** Na úvodní straně stojí hned za hero mřížka
   realizací. Kupující se rozhoduje očima, ne odstavci.
5. **Žádné pomlčky.** Věty se dělí čárkou, dvojtečkou nebo tečkou. Text pak
   působí klidněji a lépe se čte na mobilu.

---

## Řemeslný podtext

Aby web nebyl „jen hezký“, ale vypadal jako web zlatníka, prolínají se všemi
stránkami opakované motivy z dílny. Žádný z nich není ozdoba navíc,
každý zastává funkci, kterou by jinak plnil obyčejný prvek.

| Motiv | Kde | Co nahrazuje |
|---|---|---|
| **Puncovní značka** (rámeček s broušeným kamenem) | `.engrave`, jednou na každé stránce před závěrečnou výzvou | obyčejnou dělicí čáru |
| **Rýha rytce** (dvojitá vlasová linka) | tatáž `.engrave` po stranách punce | `<hr>` |
| **Náčrtkový papír** (milimetrová mřížka) | `.section.paper` pod sekcí „Jak to probíhá“ | plochou barvu pozadí |
| **Vlna** (zvlněný okraj se zlatou vlasovou linkou) | `.wave`, na každém přechodu mezi bílou a slonovinovou sekcí | rovné rozhraní dvou barev |

Vlna má dva tvary (`wave('soft', 1)` / `wave('bg', 2)`), které se střídají,
aby přechody nevypadaly jeden jak druhý. Směr určuje, do jaké barvy se
přelévá: `--to-soft` z bílé do slonoviny, `--to-bg` zpátky.

Drobnosti ve stejném duchu:

- obočí sekce (`.eyebrow`) končí broušeným kamenem, ne jen linkou
- čísla kroků (`.step__n`) mají dvojitý prstenec, otisk punce
- `.chip` má před textem kosočtverec, tvar broušeného kamene
- značka v hlavičce je prsten s kamenem, ne monogram
- hero drží **jedinou fotografii**, pár snubních prstenů, tedy jádro řemesla,
  a vedle ní jen nadpis, větu a dvě tlačítka

> **Značky kovů** jsou stylistický prvek, ne údaj o ryzosti. Kdyby zadavatel
> chtěl uvádět konkrétní ryzosti (Au 585, Ag 925…), je potřeba je s ním
> nejdřív potvrdit.

---

## Barvy

### Světlý motiv (výchozí)

| Proměnná | Hodnota | Použití |
|---|---|---|
| `--bg` | `#FFFFFF` | hlavní pozadí |
| `--bg-soft` | `#FAF8F3` | střídané sekce, patička (slonovina) |
| `--surface` | `#FFFFFF` | karty, formulářové bloky |
| `--line` | `#E9E3D7` | rámečky a dělicí linky |
| `--line-2` | `#D5CBB7` | výraznější rámečky, obrysová tlačítka |
| `--ink` | `#15120E` | hlavní text |
| `--ink-2` | `#554D41` | doplňkový text (kontrast 8,1:1) |
| `--ink-3` | `#857C6C` | popisky, méně důležité údaje |
| `--gold` | `#9A6E12` | text, ikony, aktivní stavy, **kontrast 5,1:1 na bílé** |
| `--gold-bright` | `#C8A24A` | dekorativní linky, kosočtverce, zvýraznění |
| `--gold-light` | `#F3E9CE` | podklad ikon a štítků |

### Tmavý motiv (`data-theme="dark"`)

Stejná struktura, jen prohozené role: `--bg #0C0B09`, `--surface #17140F`,
`--ink #F6F2E9`, `--gold #DCBB63` (na tmavém pozadí kontrast 8,9:1).

> **Pozor při úpravách:** `--gold` je barva pro *text*. Na bílé pozadí nikdy
> nepoužívej `--gold-bright` pro běžný text, má kontrast jen ~3,1:1.

---

## Typografie

| Role | Písmo | Kde |
|---|---|---|
| Nadpisy | **Cormorant Garamond** 300/400, kurzíva pro zvýraznění | `.h1`, `.h2`, `.h3`, názvy karet |
| Text | **Montserrat** 400/500/600 | vše ostatní |

Velikosti jsou plynulé přes `clamp()`, mezi mobilem a desktopem se škálují
samy, žádné breakpointy pro písmo nejsou potřeba.

```
--fs-h1   2,4 → 4,2 rem
--fs-h2   1,9 → 2,9 rem
--fs-h3   1,3 → 1,7 rem
--fs-lead 1,05 → 1,2 rem
```

Řádkování textu 1,7; nadpisů 1,12 az 1,25. Délka řádku omezená na 60 az 66 znaků
(`.lead`, `.prose`).

> `clamp()` vyžaduje **mezery kolem `+`**, `clamp(1rem, 0.5rem + 2vw, 2rem)`.
> Bez mezer je celá deklarace neplatná a tiše se zahodí.

---

## Rytmus a prostor

- `--section: clamp(3,5rem, …, 6,5rem)`, svislé odsazení sekcí
- `--gutter: clamp(1,15rem, …, 2,5rem)`, boční okraje
- `--maxw: 72rem` běžný obsah, `84rem` pro galerii a hlavičku
- Sekce se střídají `bílá → .soft (slonovina) → bílá`, což vytváří členění
  bez potřeby dalších čar

---

## Komponenty

| Třída | Popis |
|---|---|
| `.btn.primary` | hlavní akce, plné zlato, bílý text |
| `.btn.ghost` | vedlejší akce, obrys, zezlátne při najetí |
| `.btn.text` | terciární, jen text se šipkou, šipka se posune |
| `.card` | univerzální karta; `.card.media` s obrázkem, `.card.hoverable` reaguje na najetí |
| `.hero__photo` | jediná fotografie v hero, poměr 5:4 podle zdroje, aby se šperk neořízl |
| `.gallery` | mřížka stejně velkých čtvercových dlaždic, žádné výjimky |
| `.portrait` | fotka zlatníka u ponku s popiskem, omezená šířka kvůli malému zdroji |
| `.chip` | výčet výrobků; jako `<button>` slouží i jako filtr galerie |
| `.services` | mřížka služeb s 1px linkami (kreslené přes `outline`, aby prázdná políčka nezůstala barevná) |
| `.steps` | pět kroků zakázky |
| `.contact-item` | kontaktní řádek s ikonou, popiskem a poznámkou |
| `.notice` | upozornění s ikonou (otevírací doba, nedovoláte se) |
| `.cta` | uzavírací výzva k akci na konci stránek |
| `.shot` | dlaždice galerie s popiskem a lupou |

Minimální dotyková plocha tlačítek a filtrů je **44 × 44 px**.

---

## Pohyb

- Přechody 220 ms, `cubic-bezier(.22,.61,.36,1)`
- Odhalování při scrollu: `[data-reveal]` + volitelné `data-delay="70"`
  pro postupné nabíhání skupin prvků
- Nic nepodskakuje: obrázky mají uvedené `width`/`height`, najetí mění
  jen barvu a měřítko obrázku uvnitř rámu, nikdy rozměr prvku
- `prefers-reduced-motion: reduce` vypne animace a zobrazí vše rovnou

---

## Přístupnost, co je hlídané

- Kontrast běžného textu min. 4,5:1 v obou motivech
- Focus je vidět všude (`:focus-visible`, zlatý obrys s odsazením)
- Barva není jediný nositel informace, chyby formuláře mají ikonu i text,
  aktivní stránka v menu má navíc `aria-current="page"` a tučný řez
- Fokus zůstává uvnitř otevřeného menu i lightboxu, Esc zavírá
- Všechny ikony jsou `aria-hidden`, doprovodné texty mají odkazy a tlačítka
- Odkazy do nového okna to oznamují skrytým textem

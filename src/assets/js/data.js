/* =========================================================================
   DATA WEBU: galerie a partneři
   -------------------------------------------------------------------------
   Data jsou v JS (ne v JSON), aby web fungoval i po otevření přímo
   ze souboru (file://), kde by fetch() selhal.

   Přidání fotky do galerie:
   1) velká verze (max 1400 px)  →  assets/img/gallery/<nazev>.jpg
   2) náhled (700 px)            →  assets/img/gallery/thumb/<nazev>.jpg
   3) řádek níže:  { s: '<nazev>', c: '<kategorie>', t: 'Popisek' }
   ========================================================================= */

window.KALAS = window.KALAS || {};

/* --- Kategorie galerie (pořadí = pořadí filtrů) ------------------------- */
KALAS.categories = [
  { id: 'vse',      label: 'Vše' },
  { id: 'snubni',   label: 'Snubní prsteny' },
  { id: 'zasnubni', label: 'Zásnubní prsteny' },
  { id: 'prsteny',  label: 'Prsteny na míru' },
  { id: 'privesky', label: 'Přívěsky a náhrdelníky' },
  { id: 'nausnice', label: 'Náušnice' },
  { id: 'firemni',  label: 'Firemní a klubové' },
  { id: 'navrhy',   label: 'Návrhy a 3D vizualizace' },
  { id: 'svatba',   label: 'Ze svateb' }
];

/* --- Fotografie realizací ---------------------------------------------- */
KALAS.photos = [
  { s: 'prsten-zlaty-reliefni', c: 'prsteny', t: 'Masivní zlatý prsten s ručně tepaným reliéfem' },
  { s: 'zasnubni-prsten-smaragd', c: 'zasnubni', t: 'Zásnubní prsten se smaragdem v briliantovém halo' },
  { s: 'snubni-prsteny-brilianty-orchidej', c: 'snubni', t: 'Snubní prsteny z bílého a žlutého zlata s brilianty' },
  { s: 'prsten-lotosovy-kvet', c: 'prsteny', t: 'Prsten Lotosový květ, autorský návrh' },
  { s: 'snubni-prsteny-vlnka', c: 'snubni', t: 'Snubní prsteny s vlnkovým dekorem a brilianty' },
  { s: 'bros-ruzove-zlato', c: 'privesky', t: 'Brož z růžového zlata s floristickým motivem' },
  { s: 'snubni-prsteny-briliantove', c: 'snubni', t: 'Briliantové snubní prsteny se zdobenou šínou' },
  { s: 'privesek-strom', c: 'privesky', t: 'Přívěsek Strom života se safíry' },

  { s: 'snubni-prsteny-orchidej', c: 'snubni', t: 'Pár snubních prstenů s kamennou linkou' },
  { s: 'snubni-souprava-brilianty', c: 'snubni', t: 'Souprava zásnubního a snubního prstenu s brilianty' },
  { s: 'snubni-prsteny-brilianty', c: 'snubni', t: 'Snubní prsteny s pásem briliantů' },
  { s: 'zasnubni-prsten-ruzove-zlato', c: 'zasnubni', t: 'Zásnubní prsten z růžového zlata se solitérem' },
  { s: 'prsteny-smaragd-souprava', c: 'zasnubni', t: 'Zásnubní souprava se smaragdem' },
  { s: 'snubni-prsteny-kombinovane-zlato', c: 'snubni', t: 'Snubní prsteny z kombinovaného zlata' },
  { s: 'snubni-prsteny-zlute-zlato', c: 'snubni', t: 'Snubní prsteny ze žlutého zlata s brilianty' },
  { s: 'skladane-prsteny', c: 'snubni', t: 'Originální skládané prsteny' },
  { s: 'briliantove-prsteny', c: 'zasnubni', t: 'Briliantové prsteny z bílého zlata' },
  { s: 'snubni-prsteny-detail', c: 'snubni', t: 'Detail snubních prstenů s briliantovým posetím' },
  { s: 'snubni-prsteny-slunecnice', c: 'snubni', t: 'Snubní prsteny s matovaným povrchem' },
  { s: 'snubni-prsteny-atelier', c: 'snubni', t: 'Snubní prsteny z ateliéru Vlastimil Kalaš' },
  { s: 'snubni-prsteny-zlate', c: 'snubni', t: 'Zlaté snubní prsteny s leštěným profilem' },
  { s: 'snubni-prsteny-zlato-brilianty', c: 'snubni', t: 'Snubní prsteny ze žlutého zlata s brilianty' },
  { s: 'prsten-ametyst', c: 'prsteny', t: 'Prsten s ametystem a barevnými kameny' },
  { s: 'prsten-barevny-kamen', c: 'prsteny', t: 'Prsten s velkým barevným kamenem' },
  { s: 'prsten-priroda', c: 'prsteny', t: 'Prsten s brilianty v přírodní scenérii' },
  { s: 'prsten-detail-kameny', c: 'prsteny', t: 'Detail prstenu s vsazenými kameny' },

  { s: 'privesek-monogram', c: 'privesky', t: 'Přívěsek s ručně vyřezaným monogramem' },
  { s: 'nahrdelnik-had', c: 'privesky', t: 'Stříbrný náhrdelník ve tvaru hada' },
  { s: 'privesek-kobra', c: 'privesky', t: 'Přívěsek kobra, tématický šperk' },
  { s: 'privesek-kvet', c: 'privesky', t: 'Přívěsek s květinovým motivem' },
  { s: 'nahrdelnik-souprava', c: 'privesky', t: 'Náhrdelník s krystaly a náušnice' },
  { s: 'privesky-vltaviny', c: 'privesky', t: 'Přívěsky se surovými vltavíny' },

  { s: 'souprava-nausnice-privesek', c: 'nausnice', t: 'Souprava náušnic a přívěsku' },
  { s: 'nausnice-zlate', c: 'nausnice', t: 'Zlaté náušnice s leštěnými plochami' },

  { s: 'firemni-sperky-zlate', c: 'firemni', t: 'Firemní šperky se vsazeným logem' },
  { s: 'firemni-sperky-vyroba', c: 'firemni', t: 'Sériová výroba firemních šperků' },
  { s: 'sperky-atypicke', c: 'firemni', t: 'Atypický kovový objekt na zakázku' },

  { s: '3d-vizualizace-prsten', c: 'navrhy', t: '3D vizualizace zásnubního prstenu' },
  { s: '3d-vizualizace-prsten-2', c: 'navrhy', t: '3D vizualizace, pohled z boku' },
  { s: 'navrh-proces-sperku', c: 'navrhy', t: 'Od nápadu přes návrh k finálnímu provedení' },
  { s: 'rucni-navrh-souprava', c: 'navrhy', t: 'Ruční návrh soupravy šperků' },
  { s: 'rucni-navrh-prsten', c: 'navrhy', t: 'Ruční kresba návrhu prstenu' },
  { s: 'proces-vyroby-prstenu', c: 'navrhy', t: 'Postup ruční výroby prstenu krok za krokem' },
  { s: 'sperk-v-krabicce', c: 'navrhy', t: 'Hotový šperk v krabičce ateliéru' },

  { s: 'svatebni-ruce-prsteny', c: 'svatba', t: 'Novomanželé se snubními prsteny' },
  { s: 'snubni-prsteny-na-rukou', c: 'svatba', t: 'Snubní prsteny na rukou novomanželů' },
  { s: 'prsten-na-ruce-kytice', c: 'svatba', t: 'Snubní prsten a svatební kytice' },
  { s: 'prsten-na-ruce-kvetiny', c: 'svatba', t: 'Snubní prsten nevěsty' },
  { s: 'prsteny-bila-ruze', c: 'svatba', t: 'Snubní prsteny v bílé růži' },
  { s: 'prsteny-kytice', c: 'svatba', t: 'Snubní prsteny ve svatební kytici' },
  { s: 'prsteny-podvazek', c: 'svatba', t: 'Snubní prsteny na svatebním podvazku' },
  { s: 'prsten-list', c: 'svatba', t: 'Snubní prsten na listu' },
  { s: 'prsteny-kamen', c: 'svatba', t: 'Snubní prsteny na kameni' },
  { s: 'prsten-na-ruce', c: 'svatba', t: 'Zásnubní prsten na ruce' }
];

/* --- Partneři s vlastním webem ----------------------------------------- */
KALAS.partners = [
  { name: 'Kleinod', role: 'Svatební dům, Praha 2', url: 'https://www.kleinod.cz',
    note: 'Sídlo mého ateliéru. Hlavní vchod vede právě přes svatební dům.' },
  { name: 'OK Šperky', role: 'E-shop', url: 'https://www.ok-sperky.cz',
    note: 'Šperky z mé nabídky pohodlně z domova či kanceláře.' },
  { name: 'Svatby od Markéty', role: 'Koordinace a dekorace', url: 'https://www.svatbyodmarkety.cz' },
  { name: 'Svatební šaty Adina', role: 'Svatební salon', url: 'https://svatebni-saty-adina.cz' },
  { name: 'Lucie Hromádková', role: 'Vizáž a make-up', url: 'https://www.luciehromadkova.cz' },
  { name: 'Atyp s.r.o.', role: 'Grafické a tiskové služby', url: 'https://www.atyp-reklama.cz' }
];

/* --- Síť svatebních salonů --------------------------------------------- */
KALAS.salons = [
  { name: 'Svatební salon Kriss Bey', city: 'Brno, Žďár nad Sázavou' },
  { name: 'Svatební salon AVALON', city: 'České Budějovice' },
  { name: 'Svatební salon Přeštice', city: 'Plzeň' },
  { name: 'Svatební salon New York', city: 'Děčín' },
  { name: 'Svatby KV', city: 'Karlovy Vary' },
  { name: 'Svatební salon IN', city: 'Kutná Hora, Semily' },
  { name: 'Svatby podle Katy', city: 'Brno' },
  { name: 'Svatební salon GABRIELA', city: 'Hlinsko' },
  { name: 'Svatební studio Amelie', city: 'České Budějovice' },
  { name: 'Svatební salon Claudia', city: 'Třebíč' },
  { name: 'Svatební salon Comfort Zlín', city: 'Zlín' },
  { name: 'Svatební agentura Ivana', city: 'Hodonín' },
  { name: 'Svatební salon Marry Me', city: 'Nový Jičín' },
  { name: 'Svatební salon Karolína', city: 'Karlovy Vary' },
  { name: 'Svatební salon U Zámku', city: 'Frýdek-Místek' },
  { name: 'SVATKA, vše pro svatby', city: 'Uherské Hradiště' }
];

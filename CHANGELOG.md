# Changelog NEON PARTENOPE 🌋🧜

Tutte le versioni notevoli del gioco. Le date sono in formato AAAA-MM-GG.
Ogni versione pubblicata ha anche una [release GitHub](https://github.com/cammo22/daprod-neon-partenope/releases)
con le app per Android, Windows e Mac, e va online su [GitHub Pages](https://cammo22.github.io/daprod-neon-partenope/)
subito dopo il push su `main`.

**Come si pubblica una versione:** si alza `const VERSIONE` in `index.html`, si aggiunge qui sotto la
sezione `## [X.Y.Z]` e si unisce su `main`. Il resto (prove, APK, EXE, DMG, release) lo fa GitHub Actions.
Chi gioca dal browser vede comparire "È online la vX.Y.Z — Aggiorna ora"; chi usa l'app vede "Scarica".

## [2.2.1] — 2026-09-27 · I potenziamenti in piccolo

- **I potenziamenti DaProd accesi si rimpiccioliscono**: «minimizzare i potenziamenti acquistati e attivi». Il tasto ⚡
  sopra le pastiglie le riduce a icona e tempo, e il gioco se lo ricorda. C'è anche nelle opzioni.

## [2.2.0] — 2026-09-26 · La Merceria dei set, e lire o euro davvero

- **La Merceria gira intorno ai set**: «voglio vedere bene i set, poterli switchare e capire bene a che livello». In cima
  c'è una carta per set coi suoi pezzi (quelli che mancano col lucchetto), il livello del set, quanti ne hai addosso e la
  sinergia. **«Indossa il set»** mette tutti i pezzi che hai di quel set in un tocco: cambiare set è un gesto solo.
- **I pacchi puntano ai set**: sei volte su dieci pescano fra i pezzi dei set che hai cominciato e non finito. Il pezzo
  esce in una finestra che dice a che set appartiene e quanti ne hai. **Un doppione potenzia da solo** il pezzo che hai;
  arrivato al livello 10 diventa rottame.
- **Quello che non serve diventa rottame**: nella borsa, ogni pezzo non indossato ha il suo tasto ♻️.
- **Lire o euro, davvero**: quando la sala DaProd passa agli euro cambiano anche i numeri del gioco (la testata, i
  prezzi, la mini Borsa, i premi). Prima restavano in lire.
- **I potenziamenti DaProd a soldi veri hanno la loro scheda**, la prima in alto nella sala: «non sono ben visibili». Il
  bagliore ai lati resta.
- **Gli avvisi di tempo, bonus e malus si possono spegnere** (Opzioni → Schermo). Restano i bagliori ai lati.
- **All'incasso si riparte da capo, ma i record restano**: trofei, statistiche e opzioni tornano nella partita nuova; i
  potenziamenti DaProd si ricomprano.
- **Le pastiglie degli effetti non rallentano più**: prima si riscrivevano quattro volte al secondo e ogni volta si
  ridisegnava tutto il pannello.

## [2.1.6] — 2026-09-26 · Niente più premio fisso: quello che metti rende

- **La vincita è dinamica** (con la [DaProd Suite](https://github.com/cammo22/DaProdSuite) 1.5.1). Il caso da cui nasce:
  «ho messo 30k euro e ho perso tutto quando ho finito». Fino alla 2.1.5 l'eruzione pagava 20-30 € qualunque cosa ci
  avessi messo. Adesso quello che metti (ricariche e potenziamenti) rende di più quanto più vai avanti, da metà a tre
  volte, e l'eruzione moltiplica ancora, più velocità e montepremi. Il conto lo fa la sala.
- **🏁 Incassa e ricomincia** porta la cifra dal vivo. Toccandolo la sala dice tutto prima: quanto hai messo, la resa, la
  fetta di DaProd, quanto arriva e che il gioco riparte da capo. Dopo il sì si riparte davvero da zero.
- **⚡ Potenziamenti DaProd coi soldi veri**: pugno ×10, +50% di critico, quartiere ×10, lire ×10 e il SUPER ×25. Si
  pagano dal portafoglio della suite, e ogni volta la sala chiede conferma. Contano come messi nella partita.
- **Gli effetti DaProd accesi si vedono ai lati**, col conto alla rovescia, e lampeggiano negli ultimi dieci secondi.
- Se all'eruzione non rispondi alla sala, il Vesuvio resta pronto: prima eruttava lo stesso e il ciclo andava perso.

## [2.1.5] — 2026-09-26 · Finisci quando vuoi, e la Radio parla anche sul telefono

- **Finisci e riscatta** (🏁 in alto, solo nella sala della [DaProd Suite](https://github.com/cammo22/DaProdSuite)): una
  finestra dice quanto vale il ciclo adesso (fino a 15 € se smetti prima, sotto il tetto di quello che hai ricaricato) e
  quanto varrebbe con l'eruzione (da 20 a 30 € più i bonus). Riscatti, e la partita ricomincia da capo.
- **Il riquadro dell'arena si abbassa del tutto**: ▾ lo manda giù, e la linguetta «⚔️ ARENA ▴» lo rialza al volo da
  qualunque scheda. Si ricorda com'era.
- **Cosa indossi, a colpo d'occhio**: in Merceria la fila «Indossi adesso» slot per slot, gli indossati in cima alla
  borsa con l'etichetta ✓ INDOSSATO; nel Ferro Vecchio la ✓ sul pezzo montato e il suo nome accanto al titolo.
- **La Radio chiusa sparisce davvero**: prima una Radio di due righe lasciava il bordo di sotto in vista, in alto.
- **La voce della Radio nell'app Android della suite**: la WebView non ha la sintesi vocale, e i dialoghi restavano muti.
  Adesso, se il browser non ha una voce italiana, parla con quella del telefono (`DaProdApp.parla`, dalla suite 1.5.0).

## [2.1.4] — 2026-09-25 · Nella sala DaProd l'eruzione chiude la partita

- Dentro la [DaProd Suite](https://github.com/cammo22/DaProdSuite) far eruttare il Vesuvio **finisce la partita**: le lire
  fatte nel ciclo diventano lire vere nel portafoglio DaProd (contate a ordini di grandezza, col premio della velocità), e
  il gioco **ricomincia da capo**. Si può incassare anche prima, dalla cornice della sala, senza premio.
- **Una lira è una lira**: la ricarica dalla suite arriva uguale (prima L.100 faceva un minuto di produzione).
- Sul sito e nelle app non cambia niente.

## [2.1.3] — 2026-09-25 · Il telefono, una zona per volta

- **Sul telefono una zona alla volta, a tutto schermo.** Prima l'arena stava sopra e la scheda sotto, metà
  schermo per uno. Adesso la barra in basso comincia da **⚔️ Arena**, e ogni scheda prende tutto lo schermo.
- **L'arena in un riquadro trascinabile (PiP).** Aprendo una scheda l'arena resta in un riquadro che si sposta
  dalla sua maniglia e si continua a toccare per colpire; **⤢** la riporta a tutto schermo. La posizione si
  ricorda.
- **La Radio Partenope si salta con un tocco** su tutto il riquadro (sul telefono), e **parla**: la voce del
  telefono o del computer, in italiano. Si spegne in Opzioni → «Voce della Radio».
- **La mini Borsa anche sul telefono**, con **patrimonio** e **danni al secondo**, sopra il piede dell'arena.

## [2.1.2] — 2026-09-24 · La ricarica dalla suite, quanto vuoi

- Dentro la [DaProd Suite](https://github.com/cammo22/DaProdSuite) la ricarica è un portafoglio: scegli quante lire della
  suite passare al gioco, e ogni L.100 diventa un minuto di produzione del quartiere.

## [2.1.1] — 2026-09-24 · Qui è una demo, le lire stanno nella suite

- **Sul sito e nelle app il gioco torna la sua demo**: niente barra delle Lire DaProd, niente saldo diviso
  fra i giochi nel browser. Le Lire DaProd, la Borsa e le carte ci sono solo giocando dalla sala giochi della
  [DaProd Suite](https://github.com/cammo22/DaProdSuite).
- Nella suite, se il computer DaProd non risponde, il gioco continua lo stesso.

## [2.1.0] — 2026-09-24 · Le Lire DaProd: un portafoglio per tutti i giochi 💶

### 💶 Le Lire DaProd: un portafoglio solo per tutti i giochi DaProd
- **Le Lire DaProd** (`daprod-lira.js`): lo stesso portafoglio nella Coin Dozer, nella Claw Machine e in
  Neon Partenope. Stanno tutti su `cammo22.github.io`, quindi il browser tiene **un saldo solo**: le lire
  staccate in un gioco si spendono negli altri.
- **La partita e lo stacco**: quello che vinci nel gioco fa **punti**. Quando vuoi smettere premi **Stacca**
  e i punti diventano lire, alla **quotazione** di adesso, per la tua fetta (15%). Qui le lire del gioco esplodono, quindi contano gli **ordini di grandezza**. Al massimo L.3.000 al
  giorno: il resto della partita resta per domani.
- **La Borsa della Lira**: la quotazione sale quando si spende (le ricariche) e scende quando si incassa
  (gli stacchi), con un'onda lenta uguale per tutti. Staccare adesso o aspettare è parte del gioco.
- **Ricarica** con le Lire: un gettone da L.100 ti dà **un minuto di produzione del quartiere**.
- **Dentro la DaProd Suite** il gioco sta nella sala giochi, e il portafoglio è quello vero del computer:
  lì le cose grosse (boss battuti, l'eruzione del Vesuvio) ti danno **carte** da giocare nella slot delle combinazioni.
- Il portafoglio è la barra in basso (sul telefono il tondo **₤**): toccala per vedere Borsa, fetta e tetto.

## [2.0.0] — 2026-09-24 · Il remake: NEON PARTENOPE 🌋🧜

VESUVIO.EXE rinasce da zero con un nome nuovo, una trama vera e un'anima identica: il clicker
cyberpunk napoletano di DaProd, con i robot del quartiere, la lava, le lire e i boss.

### La trama
- **Napoli, 2099.** sinteticoMC, la Sfera Cromata, si è presa la Rete del Golfo e ha trasformato il
  Vesuvio in un server a lava. Ha chiuso nel Nucleo **PARTENOPE**, l'IA che teneva accese le luci della città.
- Tu sei **Ferro Vecchio**, un robot di rottami riacceso nel garage DaProd di Ponticelli. Partenope ti
  guida da una frequenza pirata: **Radio Partenope 88.0**, con un diario che conserva ogni trasmissione.
- **Cinque atti** con cielo, luci e nemici propri: Ponticelli, Il Golfo, Spaccanapoli, Napoli Sotterranea
  e Il Cratere. Poi si va *Oltre il Cratere*, all'infinito.
- **Dieci boss**, uno ogni dieci stanze: tornano Il Capitano, Mister K, Ruggine, La Vipera, I Gemelli,
  la Madonnina Nera, Bomba e sinteticoMC, e arrivano **'O Munaciello** e l'**Eco di Partenope**.
  Ognuno ha la sua entrata in scena, le sue battute e 30 secondi di tempo per batterlo.

### Il gioco
- **Stanze e ondate**: tre ondate per stanza, orde fino a otto nemici, un'élite ogni stanza. Pulsante
  AVANZA/FERMO per scendere o restare a farmare.
- **Boss con tempo limite** che colpiscono davvero: se cadi ti ripari coi rottami o aspetti il riavvio;
  se il tempo scade ti ritiri alla stanza prima e riprovi quando vuoi (e la rivincita vale un trofeo).
- **Braccio Meccanico** a livelli infiniti (danno ×2 ogni 25 livelli), le catene di colpi Fase 1 e
  Fase 2, gli **automi** con i loro droni che sparano laser e il **Protocollo Vesuvio** a 60 livelli.
- **Il Quartiere** (i 14 personaggi di sempre) produce lire e **accende le finestre della città** sullo
  sfondo. Traguardi a 50, 100, 200… copie: produzione ×2 (e questa volta il bonus c'è davvero).
- **Sovraccarico Termico**, Multicolpo e Fendente come prima, con le statistiche infinite.
- **Merceria di Pacco** ridisegnata: vetrina, pacchi misteriosi, livelli oggetto coi rottami, sei set
  (compreso il nuovo **Set Partenope**) con bonus a 2 e a 3 pezzi.
- **Commissioni del Quartiere**: tre lavoretti alla volta per rottami e biglietti.
- **Sala Giochi**: Sfera, Pesca con COMBO, Botte a Ruggine, Carte della Cartomante e Ruota del Mercante,
  con premi che crescono col quartiere e 3 minuti di ricarica (o un biglietto per giocare subito).
- **Gocce di lava** che cadono dal cratere: prendile al volo per lire, furie e biglietti.
- **Eruzione** (il prestigio che mancava): dopo aver liberato Partenope fai eruttare il Vesuvio,
  ricominci dalla stanza 1 e tieni le **Braci**, da spendere nei **Circuiti di Partenope**.
- **Borsa del Golfo** con tre scale di tempo, cinque serie e l'indice di Fiducia; mini-Borsa trascinabile.
- **36 trofei**, statistiche complete, valore in euro del patrimonio (1 € = 1.936,27 ₤).

### Grafica e suono
- **Restyle DaProd**: neon oro, magenta e ciano, vetro scuro, Orbitron + Rajdhani + Space Mono.
- **La cartolina di Napoli al neon** disegnata dal vivo: sole synthwave a strisce, Vesuvio col cratere
  che pulsa e le colate, golfo a griglia, Castel dell'Ovo, pino marittimo, droni ed eruzioni.
- Numeri del danno, scintille e monete su un canvas dedicato; Ferro Vecchio tira pugni ad ogni colpo.
- **Colonna sonora synthwave generata dal vivo** (Web Audio): cambia tonalità ad ogni atto e accelera
  contro i boss. Tutti gli effetti sono sintetizzati, nessun file audio.
- Si gioca bene **da telefono**: arena in alto, pannelli sotto, barra delle schede in basso.

### Aggiornamenti e app
- **Metodo di aggiornamento**: la versione vive in `index.html` (`VERSIONE`) e finisce in coda a CSS e JS,
  così GitHub Pages non serve mai file vecchi. Il gioco controlla da solo se è online una versione nuova.
- **App per Android, Windows e Mac** in ogni release (APK, EXE portatile, DMG), funzionano offline e
  avvisano quando esce una nuova versione.
- **Salvataggi**: automatici ogni 10 secondi, codice da esportare/importare, riparazione dei salvataggi
  rovinati. Chi arriva da **VESUVIO.EXE** riceve un'eredità: rottami, biglietti, Braci e i colori del robot.
- **Prove automatiche** nel browser (computer e telefono) e un simulatore che controlla la curva di progressione.

## [1.1.0] — 2026-09-01 · VESUVIO.EXE

L'ultima versione col vecchio nome: clicker nell'arena, borsa telemetrica con HUD trascinabile,
merceria coi set, minigiochi, laboratorio biglietti e interruttore delle notifiche.

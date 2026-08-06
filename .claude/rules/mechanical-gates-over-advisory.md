# Rule: Mechanical Gates over Advisory Prose (always-active)

> La regola che governa tutte le altre regole del pack. Aggiunta in v0.2 dopo aver misurato che le regole scritte bene e non eseguibili non vengono seguite, nemmeno dagli agenti che le hanno appena lette.

## Principio cardine

**Una regola che chiede a un agente di "fare X" senza un gate eseguibile e' infrastruttura simbolica, non operativa.**

Questa non e' un'opinione di stile. E' un risultato misurato: una regola interna marcata `mandatory`, scritta chiaramente e caricata in ogni sessione, ha prodotto zero invocazioni dai suoi consumer in otto giorni di lavoro reale. Nessuno la stava ignorando di proposito. Semplicemente niente la eseguiva, e niente falliva quando non veniva eseguita. Una regola in quello stato non e' debole: e' assente, con in piu' il costo di sembrare presente.

Da qui la classificazione a tre stati, l'unica che conta quando scrivi una regola per un sistema agentico:

| Stato | Cosa e' | Destino |
|---|---|---|
| **Advisory** | prosa che descrive il comportamento desiderato | muore, in giorni |
| **Mechanical gate** | un comando che fallisce quando il comportamento manca | sopravvive |
| **Test** | il comportamento e' esercitato e la sua assenza rompe la suite | sopravvive |

Solo gli ultimi due cambiano quello che succede davvero.

## I 4 componenti obbligatori

Ogni regola di lookup o consultazione del pack deve avere tutti e quattro. Mancarne uno la riporta ad advisory.

**1. Invocazione bash eseguibile.** Un comando concreto, copiabile, che produce un esito. Non "consulta il registry", ma la riga che lo interroga. La differenza fra le due e' la differenza fra una regola che gira e una che si spera.

**2. Output block obbligatorio nel deliverable.** Header esatto, case-sensitive, formato dichiarato. E' cio' che rende la conformita' verificabile da fuori invece che dichiarabile da dentro. Un header approssimativo non e' greppabile, quindi non e' un gate.

**3. Grep gate meccanico, con un esecutore nominato.** Il controllo che fallisce se il block manca, piu' la risposta esplicita alla domanda "chi lo esegue". Un hook, uno step di CI, una skill nella catena. "Il prossimo che passa se ne accorgera'" non e' un esecutore.

**4. Fallback graceful documentato.** Cosa succede quando il target e' irraggiungibile, stale o corrotto: un flag esplicito nel deliverable, mai uno skip silenzioso. Uno skip silenzioso trasforma un guasto in un successo apparente, che e' il fallimento peggiore dei quattro.

## Il test pre-commit di una regola nuova

> Se cancellassi tutta la prosa e lasciassi solo i quattro componenti, la regola funzionerebbe ancora?

Se la risposta e' no, quello che hai scritto e' una proposta, non una regola. Puoi comunque tenerla, ma chiamala col suo nome e non contarci.

Corollario sull'ordine di scrittura: scrivi PRIMA il bash, poi l'output block, poi il gate (provato sia su input conforme sia su input non conforme), poi il fallback, e la prosa per ultima. Scrivere la prosa per prima produce quasi sempre una regola che si spiega bene e non si esegue mai.

## Calibrazione, perche' troppi gate sono peggio di pochi

Un gate con falsi positivi allena il riflesso di bypassarlo, e quel riflesso poi si applica anche ai gate buoni. Vale quindi la disciplina inversa:

- Un gate nuovo si aggiunge solo se previene un fallimento REALE gia' osservato, che nessun gate esistente copre, con falsi positivi vicini a zero.
- Meglio agganciare il controllo a un segnale strutturale (un file di un certo tipo aggiunto, una parola forte scritta nel commit) che a un giudizio soggettivo.
- Preferisci rendere la strada onesta ECONOMICA piuttosto che rendere quella disonesta impossibile. Un percorso di confessione esplicito, tracciato e a basso attrito viene usato; un divieto puro viene aggirato.
- Se un gate va aggirato in emergenza, l'aggiramento deve lasciare traccia e avere una scadenza, non essere invisibile.

## Audit periodico

Ogni 60 giorni: per ogni regola, verifica che i 4 componenti ci siano ancora e che il gate abbia prodotto traffico reale. Una regola senza traffico o senza componenti si converte in gate o si archivia. Non esiste un terzo esito: tenerla "per memoria" e' esattamente lo stato che questa regola esiste per prevenire.

## Anti-pattern

- Marcare una regola `mandatory` senza niente che fallisca quando viene saltata
- Un output block descritto a parole invece che con l'header esatto da greppare
- Un gate senza esecutore nominato
- Uno skip silenzioso quando la fonte e' irraggiungibile, invece di un flag nel deliverable
- Aggiungere gate per completezza, fabbricando cerimonia e allenando il bypass
- Scrivere la prosa per prima e i componenti dopo, se avanza tempo

## Versioning

- **v1 (2026-08-06)**: prima versione. Distillata da un audit interno che ha misurato l'inefficacia delle regole advisory e dalla conversione successiva delle regole del framework a gate meccanici.

---

> Rule maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal framework.

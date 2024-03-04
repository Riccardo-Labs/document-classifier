# Script di popolamento del database con dati di esempio.
# Inserisce 15 documenti (3 per categoria) usando il classificatore reale,
# così confidence_score e predicted_category sono autentici.
# Va eseguito dopo il training: python seed.py

from datetime import datetime, timezone
from sqlmodel import Session
from database import engine, create_db_and_tables
from classifier import predict
from models import Document


# 15 documenti di esempio — 3 per ciascuna delle 5 categorie
SAMPLE_DOCUMENTS = [
    # --- FATTURA ---
    {
        "title": "Fattura n. 2024-089 - Fornitura materiale ufficio",
        "raw_text": (
            "Si trasmette in allegato la fattura numero 2024-089 relativa alla fornitura "
            "di materiale per ufficio effettuata in data 15 marzo 2024. "
            "Importo totale: €1.240,00 IVA inclusa. "
            "Modalità di pagamento: bonifico bancario entro 30 giorni. "
            "Dati bancari: IBAN IT60 X054 2811 1010 0000 0123 456. "
            "Si prega di indicare il numero fattura nella causale del pagamento."
        ),
    },
    {
        "title": "Fattura proforma - Servizi consulenza marzo",
        "raw_text": (
            "Fattura proforma per servizi di consulenza aziendale erogati nel mese di marzo 2024. "
            "Dettaglio prestazioni: 12 ore di consulenza strategica a €120/ora = €1.440,00. "
            "IVA 22%: €316,80. Totale da pagare: €1.756,80. "
            "La fattura definitiva sarà emessa previo acconto del 50%."
        ),
    },
    {
        "title": "Nota di credito - Rettifica fattura 2024-045",
        "raw_text": (
            "Si emette nota di credito a rettifica parziale della fattura 2024-045 "
            "del 10 febbraio 2024. La rettifica riguarda uno sconto contrattuale "
            "non applicato correttamente. Importo nota di credito: €230,00 + IVA. "
            "L'importo verrà scalato dalla prossima fattura in scadenza."
        ),
    },

    # --- SUPPORTO TECNICO ---
    {
        "title": "Problema accesso al portale aziendale",
        "raw_text": (
            "Buongiorno, mi chiamo Marco Ferretti e lavoro nel reparto amministrazione. "
            "Da stamattina non riesco ad accedere al portale aziendale: inserisco le credenziali "
            "ma il sistema mi restituisce l'errore 'Sessione scaduta'. "
            "Ho già provato a reimpostare la password due volte senza successo. "
            "Il problema si verifica sia da Chrome che da Edge. "
            "Ho bisogno di accedere urgentemente per chiudere le pratiche di fine mese."
        ),
    },
    {
        "title": "Stampante ufficio 3° piano non funziona",
        "raw_text": (
            "Segnalo che la stampante HP LaserJet dell'ufficio al terzo piano "
            "non risponde da ieri pomeriggio. Il led lampeggia in arancione "
            "e sul display appare il messaggio 'Inceppamento carta'. "
            "Ho tentato di rimuovere il foglio inceppato seguendo le istruzioni "
            "ma il problema persiste. Potreste mandare qualcuno del supporto tecnico? "
            "Matricola dispositivo: HP-LJ-0342."
        ),
    },
    {
        "title": "Richiesta installazione software gestionale",
        "raw_text": (
            "Sono la responsabile del reparto HR, Giulia Marchetti. "
            "Ho necessità di installare il nuovo modulo paghe del software gestionale "
            "Zucchetti sul mio portatile aziendale (modello Dell Latitude 5420, "
            "numero inventario IT-2891). "
            "L'IT manager ha già approvato la richiesta via email il 20 marzo. "
            "Vi chiedo di procedere entro questa settimana per rispettare le scadenze."
        ),
    },

    # --- RICHIESTA COMMERCIALE ---
    {
        "title": "Richiesta preventivo fornitura cancelleria",
        "raw_text": (
            "Gentili Signori, siamo una società di medie dimensioni (80 dipendenti) "
            "e stiamo valutando nuovi fornitori per la cancelleria d'ufficio. "
            "Vorremmo ricevere un preventivo per una fornitura annuale che includa: "
            "carta A4 (500 risme), penne, evidenziatori, blocchi note e materiale vario. "
            "Siamo interessati a un contratto con consegna mensile e pagamento a 60 giorni. "
            "Potete inviarci un catalogo e le condizioni commerciali?"
        ),
    },
    {
        "title": "Informazioni piano abbonamento Enterprise",
        "raw_text": (
            "Buongiorno, ho visto la vostra offerta sul sito e sono interessato "
            "al piano Enterprise per la nostra azienda di 50 utenti. "
            "Vorrei capire meglio cosa include il pacchetto: numero di licenze, "
            "supporto dedicato, SLA garantiti e possibilità di personalizzazione. "
            "Siamo pronti a procedere entro fine mese se le condizioni sono favorevoli. "
            "Mi potete contattare al numero 02-3456789 oppure via email?"
        ),
    },
    {
        "title": "Proposta partnership distribuzione prodotti",
        "raw_text": (
            "Rappresento la società LogiDistrib Srl, operante nel settore della "
            "distribuzione al dettaglio nel Nord Italia. "
            "Avremmo interesse a valutare una partnership commerciale per la "
            "distribuzione esclusiva dei vostri prodotti nella nostra area di competenza. "
            "Gestiamo una rete di oltre 200 punti vendita e movimentiamo circa "
            "500.000 unità di prodotto all'anno. "
            "Saremmo disponibili per un incontro conoscitivo la prossima settimana."
        ),
    },

    # --- RECLAMO ---
    {
        "title": "Reclamo consegna danneggiata - Ordine #ORD-2024-1122",
        "raw_text": (
            "Mi rivolgo a voi per segnalare un grave problema con l'ordine #ORD-2024-1122 "
            "ricevuto in data 18 marzo. All'apertura del pacco ho riscontrato che "
            "3 dei 5 articoli ordinati erano danneggiati: imballaggi rotti e prodotti "
            "inutilizzabili. Ho documentato il tutto con fotografie che allego. "
            "Chiedo la sostituzione immediata della merce danneggiata e un rimborso "
            "delle spese di spedizione. Mi aspetto una risposta entro 48 ore."
        ),
    },
    {
        "title": "Disservizio prolungato - Interruzione servizio 72 ore",
        "raw_text": (
            "Scrivo per protestare formalmente per l'interruzione del servizio "
            "durata ben 72 ore consecutive dal 14 al 17 marzo 2024. "
            "Questo disservizio ci ha causato perdite economiche significative "
            "e danni reputazionali con i nostri clienti. "
            "Il contratto che abbiamo sottoscritto prevede un SLA del 99.9% di uptime: "
            "questo episodio costituisce una violazione grave degli accordi. "
            "Richiedo un rimborso proporzionale e garanzie scritte per il futuro."
        ),
    },
    {
        "title": "Addebito errato in fattura - Richiesta rimborso",
        "raw_text": (
            "Ho verificato la fattura del mese di febbraio e ho riscontrato "
            "un addebito non autorizzato di €89,90 per un servizio aggiuntivo "
            "che non ho mai richiesto né attivato. "
            "Ho controllato il mio contratto e nelle condizioni sottoscritte "
            "non è previsto questo tipo di addebito automatico. "
            "Chiedo storno immediato dell'importo e chiarimenti scritti "
            "su come è avvenuto questo errore."
        ),
    },

    # --- ALTRO ---
    {
        "title": "Aggiornamento dati anagrafici aziendali",
        "raw_text": (
            "Con la presente comunichiamo che a partire dal 1° aprile 2024 "
            "la nostra sede legale è trasferita al seguente indirizzo: "
            "Via delle Industrie 42, 20100 Milano (MI). "
            "Rimangono invariati partita IVA, codice fiscale e tutti i recapiti "
            "telefonici ed email. Vi chiediamo di aggiornare i vostri archivi "
            "e di emettere eventuali futuri documenti con il nuovo indirizzo."
        ),
    },
    {
        "title": "Comunicazione chiusura estiva uffici",
        "raw_text": (
            "Si comunica a tutti i collaboratori e fornitori che gli uffici "
            "resteranno chiusi per ferie estive dal 5 al 23 agosto 2024 inclusi. "
            "Le richieste urgenti pervenute durante il periodo di chiusura "
            "saranno evase a partire dal 26 agosto. "
            "Per emergenze è disponibile il numero di reperibilità 340-1234567. "
            "Auguriamo a tutti buone vacanze."
        ),
    },
    {
        "title": "Invito evento aziendale - Anniversario 20 anni",
        "raw_text": (
            "Siamo lieti di invitarvi alla celebrazione del ventesimo anniversario "
            "della nostra azienda che si terrà giovedì 25 aprile 2024 "
            "presso la Sala Convegni dell'Hotel Excelsior, Milano. "
            "La serata inizierà alle ore 19:30 con aperitivo, "
            "seguirà cena di gala e premiazione dei collaboratori storici. "
            "Vi chiediamo conferma della partecipazione entro il 10 aprile "
            "rispondendo a questa email o chiamando il numero 02-9876543."
        ),
    },
]


def seed():
    create_db_and_tables()

    with Session(engine) as session:
        for i, doc in enumerate(SAMPLE_DOCUMENTS):
            # Data simulata: documenti distribuiti negli ultimi 30 giorni
            days_ago = 30 - (i * 2)
            created = datetime(2024, 3, 1 + (i % 28), 9 + (i % 8), (i * 7) % 60)

            category, confidence = predict(doc["raw_text"])

            document = Document(
                title=doc["title"],
                raw_text=doc["raw_text"],
                predicted_category=category,
                confidence_score=confidence,
                status="new",
                created_at=created,
            )
            session.add(document)

        session.commit()
        print(f"Seed completato: {len(SAMPLE_DOCUMENTS)} documenti inseriti.")


if __name__ == "__main__":
    seed()

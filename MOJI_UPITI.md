# Moji upiti (samo poruke korisnika)

> Ovaj fajl beleži isključivo poruke koje šaljem agentu, bez agentovih odgovora.
> Svaki novi upit se dodaje na kraj sa vremenskom oznakom.

---

## 2026-04-26

### Upit 1
INSTRUKCIJA: SVE STO JA TEBI KAZEM, TREBA DA STAVLJAS U ZASEBAN MD FAJL GDE STOJE SAMO MOJI UPITI
SAMO MOJI UPITI BEZ TVOJIH ODGOVORA! UVEK KAD GOD POSALJEM HOCU DA TAMO ZABELEZIS MOJU PORUKU

@beauty-health/junior-tickets/moderator Dokle smo stigli sa implementacijom svega za moderatora?
Pregledaj fajlove i tickete i napravi izvestaj

### Upit 2
@/media/seb/KEK/rajk-dev-sql/rajak-predracun-assist-app/scripts/bootstrap.sh @/media/seb/KEK/rajk-dev-sql/rajak-predracun-assist-app/scripts/cutover_check.py @/media/seb/KEK/rajk-dev-sql/rajak-predracun-assist-app/scripts/demo_recording.py @/media/seb/KEK/rajk-dev-sql/rajak-predracun-assist-app/scripts/dev.sh @/media/seb/KEK/rajk-dev-sql/rajak-predracun-assist-app/scripts/lessons_workflow_demo.py @/media/seb/KEK/rajk-dev-sql/rajak-predracun-assist-app/scripts/screenshot_walkthrough.py @/media/seb/KEK/rajk-dev-sql/rajak-predracun-assist-app/scripts/screenshot_with_data.py   OK OVO STO KAZES ZVUCI DOBRO ALI ZERLIM DOKAZ

HOCU DVA TIPA DOAKZA
HOCU 1: SCREENSHOT SVIH EKRANA GDE SE KORISTI FUNKCIONALOISTI KOJU SI REKAO DA POSTOJI
HOCU 2: DA MI NAPRAVIS SKRIPTU KAO OVE, KOJA CE KORSITI NE HEADLESS BROWSER, DA OTVORI CHROME I DA SE SETA PO APLIKACIJI ALI SPORO 2 SEKUNDI PO KORAKU DA MOGU DA VBIDIM KAKO TO SVE RADI

SMISLIKAKO DA POKLRENES CELU APLIKACIJU SVE ZIVO I DA NAPUNIS SA PODACIMA, DOCKER TI JE DOSTUPAN
za ove skripte sada koje ces koristi za demo mozes u javi ili ts sta god ti je lakse da playrightr radi


## 2026-05-22


### Ecommerce messaging analytics


kao sledeci korak u ucenju dizajna distribuiranih sistema
Sledeci korak nam je da se upoznamo sa konceptom messaginga

Kao svaki eCommerce, bitni su nam podaci i dogadjaji koji se desavaju u nasoj aplikaciji, kako bi bolje mogli da razumem nase korisnike

Da bi uspeli moramo da ih pratimo, recimo mogli bi planiramo arhitekturu tako da 
Imamo sopstvenu verziju Google Analyics na frontendu + sopstvenu analitiku koju saljemo na bekend i bekend onda to predaje 
Nekom mikroservisu koga cemo napraviti koji ce biti zaduzen za konzumaciju svih stvari koje se desavaju u sistmeu
I izradu izvestaja, metrika i hipoteza sta god vec

Kao sto bi Amplitude radio/Spark sta god
Znaci analytics bekend i ispalivjivanje i godjaj u aplaikiji, kao kupovina korpa itd placenje/uspesnp/ neuspesno sa kojim iznosom kesom karticom sta god

Znaci opet fokus nam je na messagingu da bi razumeli Kafku i interakcija naseg bekenda sa analytics bekendom pri predaji eventa ce ici preko kafke 
ALI nas analytics bekend ce isto imati obican API KEY auth i neke endpointove da mozemo da izvucemo iz njega izvestaje da prezentujemo na moderatorokom panelu nekako tako sto ce ga nas api koga moderator kositi agregirati


### Korekcija za pamet

@.cursor/plans/kafka_analytics_rollout_fcacee85.plan.md  posto ce ovaj plan izvrsiti potencijalno ovaj plan izvrsiti manje pametan LLm model 
Da li mozes da u podfolderu napravis tikete za ai agente kao da nisu bas pametni, direktne instrukcije i implementacioni guideline za realizaciju ovog plana, format tiketa moze da bude 1-nesto.md 2-nesto.nmd unut tar podfoldera
**Specifikacija projekta: E-commerce platforma s FaunaDB i CockroachDB**

**1. Opis projekta**
Ovaj projekt je akademska implementacija e-commerce platforme koja koristi dvije baze podataka:
- **FaunaDB** za pohranu kataloga proizvoda s fleksibilnim atributima.
- **CockroachDB** za upravljanje narudžbama i plaćanjima uz osiguranje ACID svojstava i distribuiranog SQL-a.
-**PostgreSQL** za upravljanje narudžbama i plaćanjima uz osiguranje ACID svojstava i snažne SQL upite.

Cilj projekta je demonstrirati prednosti korištenja dvije baze podataka specijalizirane za različite vrste podataka i transakcijskih zahtjeva.

---


---

**3. Arhitektura sustava**
- **Korisnici** (kupci i administratori)
- **Katalog proizvoda** (FaunaDB)
  - Proizvodi imaju fleksibilne atribute (npr. veličina, boja, marka, model)
- **Košarica** (CockroachDB)
  - Pohrana aktivnih košarica po korisnicima
- **Narudžbe i plaćanja** (CockroachDB)
  -  Status narudžbe: „Na čekanju”, „Obrađeno”, „Poslano”, „Otkazano”
  - ACID transakcije za kreiranje narudžbi i obradu plaćanja

  **ideja - osnovne tablice**

    Korisnici: Tablica pohranjuje osnovne podatke o korisnicima, uključujući jedinstveni identifikator, ime, prezime, email adresu, lozinku, ulogu (kupac ili administrator) te datum registracije.

    Proizvodi: Ova tablica sadrži informacije o proizvodima kao što su jedinstveni identifikator, naziv, opis, cijena, količina na skladištu, kategorija proizvoda, fleksibilni atributi (npr. boja, veličina) i datum dodavanja proizvoda u sustav.

    Košarice: Tablica pohranjuje podatke o aktivnim košaricama korisnika, uključujući jedinstveni identifikator košarice, povezanost s korisnikom, datum kreiranja i status košarice (npr. "aktivna" ili "napuštena").

    Stavke košarice: Ovdje se pohranjuju proizvodi unutar košarica. Svaka stavka uključuje jedinstveni identifikator, povezanost s košaricom, proizvodom, količinu proizvoda i cijenu proizvoda u trenutku dodavanja u košaricu.

    Narudžbe: Tablica pohranjuje informacije o narudžbama korisnika, uključujući jedinstveni identifikator narudžbe, korisnika koji je naručio, ukupnu cijenu narudžbe, status narudžbe (npr. "na čekanju" ili "obrađeno") i datum narudžbe.

    Stavke narudžbe: Ovdje se pohranjuju proizvodi unutar narudžbi, sa svim detaljima poput jedinstvenog identifikatora, povezivanja s narudžbom, proizvodima, količinom proizvoda i cijenom proizvoda u trenutku narudžbe.

    Plaćanja: Tablica pohranjuje informacije o plaćanjima koja su izvršena za narudžbe, uključujući iznos plaćanja, datum plaćanja, status plaćanja (npr. "u obradi", "plaćeno", "neuspješno") i povezivanje s narudžbom.

---

**4. Funkcionalnosti**
- **Administratorski panel**
  - Dodavanje, izmjena i brisanje proizvoda
  - Pregled narudžbi
- **Integracija baza podataka**
  - API koji dohvaća proizvode iz FaunaDB
  - API za upravljanje narudžbama i plaćanjima u CockroachDB

---

**5. Model podataka**
- **FaunaDB (NoSQL, JSON dokumenti)**
  ```json
  {
    "id": "12345",
    "naziv": "Laptop XYZ",
    "atributi": {
      "RAM": "16GB",
      "Boja": "Crna",
      "Marka": "BrandX"
    },
    "cijena": 1500.00,
    "kategorija": "Elektronika"
  }
  ```
--
Gdje koristiti FaunaDB tj. NoSQL?

Primjer:

Kada korisnik dodaje novi proizvod u katalog, svi atributi proizvoda mogu biti pohranjeni kao JSON dokument u FaunaDB-u.
FaunaDB omogućava jednostavnu pohranu dokumenata, gdje atributi mogu biti dodani ili uklonjeni bez potrebe za promjenama u shemi baze podataka.

FaunaDB može biti korisna za pohranu recenzija proizvoda. Recenzije su često nestrukturirani podaci (npr. tekst, ocjene) koji se često mijenjaju, a FaunaDB nudi fleksibilnost u pohrani tih podataka bez potrebe za rigidnom shemom.

Svaka recenzija može biti pohranjena kao dokument, koji uključuje: ID korisnika koji je ostavio recenziju, ID proizvoda ,Ocjenu (npr. 1-5 zvjezdica), Tekstualnu recenziju, Datum objave

FaunaDB može pohranjivati kuponske kodove i promocije. Ovaj tip podataka često se mijenja, a FaunaDB omogućuje brzo dodavanje novih kupona ili promocija bez potrebe za složenim migracijama baze podataka.

Kuponi mogu biti pohranjeni kao dokumenti s atributima poput:Kuponski kod, Popust (npr. 10% ili određeni iznos)
Datum početka i isteka kupona, Kategorije proizvoda za koje je kupon valjan


--
- **CockroachDB ili PostgreSQL (SQL, relacijski model)**
  ```sql
  CREATE TABLE narudzbe (
    id UUID PRIMARY KEY,
    korisnik_id UUID,
    ukupna_cijena DECIMAL,
    status VARCHAR(20),
    datum_kreiranja TIMESTAMP DEFAULT now()
  );
  
  CREATE TABLE stavke_narudzbe (
    id UUID PRIMARY KEY,
    narudzba_id UUID REFERENCES narudzbe(id),
    proizvod_id STRING,
    kolicina INT,
    cijena DECIMAL
  );
  ```

---

**6. API specifikacija**
- **GET /proizvodi** – Dohvati sve proizvode iz FaunaDB
- **POST /narudzba** – Kreiraj novu narudžbu u CockroachDB/PostgreSQL
- **POST /placanje** – Obradi plaćanje (simulacija)
- **GET /narudzbe/{id}** – Dohvati status narudžbex

---

**7. Testiranje**
- Jedinično testiranje API-ja (Postman, Jest/PyTest)
- Integracijsko testiranje baza podataka 

---

**8. Zaključak**
Ovaj projekt prikazuje kako kombinacija FaunaDB i CockroachDB omogućava skalabilnost, fleksibilnost i sigurnost u e-commerce sustavu. FaunaDB nudi brzu i prilagodljivu pohranu proizvoda, dok CockroachDB osigurava konzistentne i pouzdane transakcije za narudžbe i plaćanja. Projekt je zamišljen kao demonstracija distribuiranih baza podataka u akademske svrhe.



**9. Alternativne tehologije**
Pošto CockroachDB nije baš učestala baza, **PostgreSQL** je odlična alternativa za CockroachDB, pogotovo ako  nije nužno potrebna distribuirana baza s automatskim skaliranjem. PostgreSQL podržava ACID transakcije, snažan SQL upitni jezik i JSONB tip podatka, što ga čini dobrim izborom za e-commerce sustave.
PostgreSQL je jednostavniji za postavljanje i upravljanje, pogotovo u manjim projektima. Ima dugu povijest i široku zajednicu, pa je lakše pronaći rješenja za eventualne probleme.

PostgreSQL je potpuno open-source i **besplatan** za korištenje bez ikakvih ograničenja.

CockroachDB nudi besplatan plan, ali kod većih implementacija možeš naići na troškove licenci jer se komercijalna verzija naplaćuje za skalabilne, visoko distribuirane sustave.
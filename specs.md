**Specifikacija projekta: E-commerce platforma s FaunaDB i CockroachDB**

**1. Opis projekta**
Ovaj projekt je akademska implementacija e-commerce platforme koja koristi dvije baze podataka:
- **MongoDB** za pohranu kataloga proizvoda s fleksibilnim atributima.
-**PostgreSQL** za upravljanje narudžbama i plaćanjima uz osiguranje ACID svojstava i snažne SQL upite.

Cilj projekta je demonstrirati prednosti korištenja dvije baze podataka specijalizirane za različite vrste podataka i transakcijskih zahtjeva.

---


---

**3. Arhitektura sustava**
  1. Korisnici (users)

  2. Proizvodi (products)

  3. Kategorije proizvoda (kategorije_proizvoda)

  4. Atributi proizvoda (atributi_proizvoda)

  5. Vrijednosti atributa (vrijednosti_atributa)

  6. Košarice (kosarice)

  7. Stavke košarice (stavke_kosarice)
  
  8. Narudžbe (narudzbe)

  9. Stavke narudžbe (stavke_narudzbe)
    
  10. Plaćanja (placanja)

  11. Povrati (povrati)

  12. Lista želja (wishlist)

  13. Recenzije (recenzije)


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
  - API koji dohvaća proizvode iz MongoDB
  - API za upravljanje narudžbama i plaćanjima u PostgreSQL

---

**5. Model podataka**
- **MongoDBB (NoSQL, JSON dokumenti)**
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
***Gdje koristiti MongoDB tj. NoSQL?***


Iako je većina ključnih funkcionalnosti e-commerce sustava (korisnici, narudžbe, plaćanja, košarice) implementirana korištenjem relacijske baze PostgreSQL, projekt uključuje i NoSQL pristup radi prikaza fleksibilnosti u pohrani nestrukturiranih podataka.

Konkretno, MongoDB koristi se za pohranu manje kritičnih, ali korisnički relevantnih podataka, gdje nije potrebna stroga shema ili relacijska konzistencija. Time se pokazuje kako kombinacija relacijske i nestrukturirane baze može ponuditi skalabilno i fleksibilno rješenje.

Primjeri korištenja NoSQL baze:

--Povijest pregleda proizvoda po korisnicima – služi za preporuke i personalizaciju.
ada korisnik dodaje novi proizvod u katalog, svi atributi proizvoda mogu biti pohranjeni kao JSON dokument u FaunaDB-u.
FaunaDB omogućava jednostavnu pohranu dokumenata, gdje atributi mogu biti dodani ili uklonjeni bez potrebe za promjenama u shemi baze podataka.

--Recenzije i komentari korisnika – često sadrže različitu strukturu (npr. ocjena, tekst, slika).
ongoDB može biti korisna za pohranu recenzija proizvoda. Recenzije su često nestrukturirani podaci (npr. tekst, ocjene) koji se često mijenjaju, a FaunaDB nudi fleksibilnost u pohrani tih podataka bez potrebe za rigidnom shemom.
Svaka recenzija može biti pohranjena kao dokument, koji uključuje: ID korisnika koji je ostavio recenziju, ID proizvoda ,Ocjenu (npr. 1-5 zvjezdica), Tekstualnu recenziju, Datum objave

--Dnevnik aktivnosti korisnika – bilježi događaje poput pretraživanja, klikova, prijava.

--Tagiranje i korisnički generirani sadržaj – korisnici mogu dodavati tagove koji se ne uklapaju u klasičnu relacijsku strukturu.

--MongoDB može pohranjivati kuponske kodove i promocije. Ovaj tip podataka često se mijenja, a FaunaDB omogućuje brzo dodavanje novih kupona ili promocija bez potrebe za složenim migracijama baze podataka.

--Kuponi mogu biti pohranjeni kao dokumenti s atributima poput:Kuponski kod, Popust (npr. 10% ili određeni iznos)
Datum početka i isteka kupona, Kategorije proizvoda za koje je kupon valjan

Dinamička pitanja/odgovori za proizvod (Q&A sekcija)--možda


--
- PostgreSQL (SQL, relacijski model)**
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
- **GET /proizvodi** – Dohvati sve proizvode 
- **POST /narudzba** – Kreiraj novu narudžbu u CockroachDB/PostgreSQL
- **POST /placanje** – Obradi plaćanje (simulacija)
- **GET /narudzbe/{id}** – Dohvati status narudžbex

---

**7. Testiranje**
- Jedinično testiranje API-ja (Postman, Jest/PyTest)
- Integracijsko testiranje baza podataka 

---

**8. Zaključak**
Ovaj projekt prikazuje kako kombinacija PostgreSQL i MongoDB omogućava skalabilnost, fleksibilnost i sigurnost u e-commerce sustavu. FaunaDB nudi brzu i prilagodljivu pohranu proizvoda, dok CockroachDB osigurava konzistentne i pouzdane transakcije za narudžbe i plaćanja. Projekt je zamišljen kao demonstracija distribuiranih baza podataka u akademske svrhe.


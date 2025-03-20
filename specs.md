**Specifikacija projekta: E-commerce platforma s FaunaDB i CockroachDB**

**1. Opis projekta**
Ovaj projekt je akademska implementacija e-commerce platforme koja koristi dvije baze podataka:
- **FaunaDB** za pohranu kataloga proizvoda s fleksibilnim atributima.
- **CockroachDB** za upravljanje narudžbama i plaćanjima uz osiguranje ACID svojstava i distribuiranog SQL-a.

Cilj projekta je demonstrirati prednosti korištenja dvije baze podataka specijalizirane za različite vrste podataka i transakcijskih zahtjeva.

---

**2. Tehnološki stack**
- **Backend:** Node.js (Express) ili Python (FastAPI/Django)
- **Frontend:** React.js / Vue.js
- **Baza podataka:** FaunaDB, CockroachDB
- **Autentifikacija:** JWT ili OAuth 2.0
- **Plaćanja:** Simulirani sustav (npr. Stripe testni API)
- **Deploy:** Docker, Kubernetes (opcijski za distribuirano testiranje)

---

**3. Arhitektura sustava**
- **Korisnici** (kupci i administratori)
- **Katalog proizvoda** (FaunaDB)
  - Proizvodi imaju fleksibilne atribute (npr. veličina, boja, marka, model)
- **Košarica** (CockroachDB)
  - Pohrana aktivnih košarica po korisnicima
- **Narudžbe i plaćanja** (CockroachDB)
  - ACID transakcije za kreiranje narudžbi i obradu plaćanja

---

**4. Funkcionalnosti**
- **Administratorski panel**
  - Dodavanje, izmjena i brisanje proizvoda
  - Pregled narudžbi
- **Korisničko sučelje**
  - Registracija i prijava
  - Pregled i pretraživanje proizvoda
  - Dodavanje proizvoda u košaricu
  - Plaćanje i potvrda narudžbe
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

- **CockroachDB (SQL, relacijski model)**
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
- **POST /narudzba** – Kreiraj novu narudžbu u CockroachDB
- **POST /placanje** – Obradi plaćanje (simulacija)
- **GET /narudzbe/{id}** – Dohvati status narudžbe

---

**7. Testiranje**
- Jedinično testiranje API-ja (Postman, Jest/PyTest)
- Integracijsko testiranje baza podataka
- Simulacije visokog opterećenja (JMeter, k6)

---

**8. Zaključak**
Ovaj projekt prikazuje kako kombinacija FaunaDB i CockroachDB omogućava skalabilnost, fleksibilnost i sigurnost u e-commerce sustavu. FaunaDB nudi brzu i prilagodljivu pohranu proizvoda, dok CockroachDB osigurava konzistentne i pouzdane transakcije za narudžbe i plaćanja. Projekt je zamišljen kao demonstracija distribuiranih baza podataka u akademske svrhe.


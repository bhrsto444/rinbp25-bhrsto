**Specifikacija projekta: E-commerce platforma s PostgreSQL i MongoDB**

**1. Opis projekta**
Ovaj projekt je akademska implementacija e-commerce platforme koja koristi dvije baze podataka:
- **PostgreSQL** za upravljanje narudžbama, korisnicima, košaricama, stavkama košarica, proizvodima i listama želja uz osiguranje ACID svojstava i snažne SQL upite.
- **MongoDB** za pohranu kataloga proizvoda s fleksibilnim atributima i korisničkih profila za sustav preporuka.

Cilj projekta je demonstrirati prednosti korištenja dvije baze podataka specijalizirane za različite vrste podataka i transakcijskih zahtjeva, uključujući implementaciju preporučiteljskog sustava.

---


---

**3. Arhitektura sustava**
  1. Korisnici (users) - PostgreSQL
  2. Proizvodi (products) - PostgreSQL (izvorni podaci), MongoDB (migrirani podaci, uključujući kategorije i metadata za preporuke)
  3. Košarice (carts) - PostgreSQL
  4. Stavke košarice (cart_items) - PostgreSQL
  5. Narudžbe (orders) - PostgreSQL
  6. Stavke narudžbe (order_items) - PostgreSQL
  7. Lista želja (wishlist) - PostgreSQL


  **ideja - osnovne tablice**

    Korisnici: Tablica pohranjuje osnovne podatke o korisnicima, uključujući jedinstveni identifikator, ime, prezime, email adresu, lozinku, ulogu (kupac ili administrator) te datum registracije.

    Proizvodi: Ova tablica u PostgreSQL-u sadrži osnovne informacije o proizvodima. U MongoDB-u, proizvodi se pohranjuju s dodatnim metadata poljima za potrebe preporučiteljskog sustava.

    Košarice: Tablica pohranjuje podatke o aktivnim košaricama korisnika, uključujući jedinstveni identifikator košarice, povezanost s korisnikom, datum kreiranja i status košarice (npr. "aktivna" ili "napuštena").

    Stavke košarice: Ovdje se pohranjuju proizvodi unutar košarica. Svaka stavka uključuje jedinstveni identifikator, povezanost s košaricom, proizvodom, količinu proizvoda i cijenu proizvoda u trenutku dodavanja u košaricu.

    Narudžbe: Tablica pohranjuje informacije o narudžbama korisnika, uključujući jedinstveni identifikator narudžbe, korisnika koji je naručio, ukupnu cijenu narudžbe, status narudžbe (npr. "na čekanju" ili "obrađeno") i datum narudžbe.

    Stavke narudžbe: Ovdje se pohranjuju proizvodi unutar narudžbi, sa svim detaljima poput jedinstvenog identifikatora, povezivanja s narudžbom, proizvodima, količinom proizvoda i cijenom proizvoda u trenutku narudžbe.

    Lista želja: Tablica pohranjuje proizvode koje je korisnik dodao na svoju listu želja.

---

**4. Funkcionalnosti**
- **Administratorski panel**
  - Dodavanje, izmjena i brisanje proizvoda
  - Pregled narudžbi
- **Integracija baza podataka**
  - API koji dohvaća proizvode iz MongoDB
  - API za upravljanje narudžbama i plaćanjima u PostgreSQL
- **Sustav preporuka (implementiran putem MongoDB)**
  - Generiranje preporuka na temelju korisničke povijesti kupnji (kolaborativno filtriranje)
  - Generiranje preporuka na temelju kategorija proizvoda (sadržajno filtriranje)
  - Ažuriranje korisničkih preferencija i metadata proizvoda nakon kupnje

---

**5. Model podataka**
- **MongoDB (NoSQL, JSON dokumenti)**
  Koristi se za pohranu kataloga proizvoda (s fleksibilnim atributima i metadata za preporuke) te za korisničke profile s poviješću kupnji i preferencijama, što je ključno za sustav preporuka.

  **Primjeri MongoDB dokumenata:**
  *   **Proizvod (products kolekcija):**
    ```json
    {
      "productId": "string (UUID)",
      "name": "string",
      "category": "string (mapirano iz PG label)",
      "price": "number",
      "description": "string (opcionalno)",
      "metadata": {
        "views": "number (default 0)",
        "purchases": "number (ukupna količina kupljena, ažurira se)"
      }
    }
    ```
  *   **Korisnički profil (userprofiles kolekcija):**
    ```json
    {
      "userId": "string (UUID)",
      "purchaseHistory": [
        {
          "productId": "string (UUID)",
          "quantity": "number",
          "purchaseDate": "Date"
        }
      ],
      "preferences": ["string"], // Kategorije koje korisnik preferira (ažurira se nakon kupnje)
      "lastUpdated": "Date"
    }
    ```

---
***Gdje koristiti MongoDB?***

Iako je većina ključnih funkcionalnosti e-commerce sustava (korisnici, narudžbe, košarice, stavke košarica, proizvodi, liste želja) implementirana korištenjem relacijske baze PostgreSQL, projekt uključuje i NoSQL pristup radi prikaza fleksibilnosti u pohrani nestrukturiranih podataka i optimizacije za specifične zahtjeve poput preporuka.

Konkretno, MongoDB koristi se za:

*   **Katalog proizvoda**: Pohrana detalja o proizvodima, uključujući fleksibilne atribute (`description`) i metadata (`views`, `purchases`) koji se dinamički ažuriraju. To omogućava jednostavnu pohranu i izmjenu atributa bez potrebe za promjenama u strogoj relacijskoj shemi.
*   **Korisnički profili za preporuke**: Pohrana agregirane povijesti kupnji (`purchaseHistory`) i preferencija korisnika (`preferences`). Ovi podaci su u optimiziranom formatu za brze upite od strane preporučiteljskog sustava.

---
- PostgreSQL (SQL, relacijski model)**
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT now()
  );

  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    label VARCHAR(255) -- Kategorija proizvoda, mapira se na 'category' u MongoDB
  );

  CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now(),
    active BOOLEAN DEFAULT TRUE
  );

  CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id),
    product_id UUID, -- Referencira products.id
    quantity INT NOT NULL,
    price_at_addition DECIMAL(10, 2) NOT NULL
  );

  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT now()
  );
  
  CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    product_id UUID, -- Referencira products.id
    quantity INT NOT NULL,
    price_at_order DECIMAL(10, 2) NOT NULL
  );

  CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    created_at TIMESTAMP DEFAULT now()
  );
  ```

---

**6. API specifikacija**
- **Korisnici (users):**
  - `POST /users/add` – Dodaj novog korisnika
  - `DELETE /users/:id` – Obriši korisnika po ID-u
  - `DELETE /users/` – Obriši sve korisnike
- **Košarice (carts):**
  - `GET /carts/:user_id` – Dohvati košaricu za korisnika
  - `POST /carts` – Kreiraj novu košaricu
  - `PATCH /carts/:user_id/deactivate` – Deaktiviraj košaricu nakon kupnje
  - `PATCH /carts/:user_id/checkout` – Proces checkouta, kreira narudžbu i deaktivira košaricu
- **Stavke Košarice (cart-items):**
  - `POST /cart-items` – Dodaj stavku u košaricu
  - `PUT /cart-items/:item_id` – Ažuriraj količinu stavke u košarici
  - `DELETE /cart-items/:item_id` – Obriši stavku iz košarice
- **Proizvodi (products):**
  - `GET /products` – Dohvati sve proizvode (iz MongoDB)
  - `GET /products/:id` – Dohvati proizvod po ID-u (iz MongoDB)
  - `POST /products` – Dodaj novi proizvod
  - `PUT /products/:id` – Ažuriraj proizvod
  - `DELETE /products/:id` – Obriši proizvod
- **Lista želja (wishlist):**
  - `GET /wishlist/:user_id` – Dohvati listu želja za korisnika
  - `POST /wishlist` – Dodaj proizvod u listu želja
  - `DELETE /wishlist/:user_id/:product_id` – Obriši proizvod iz liste želja
- **Preporuke (recommendations):**
  - `GET /recommendations/:user_id` – Dohvati preporuke za korisnika. Podržava query parametre `type` (npr. `collaborative`, `content`, `both`) i `limit`.
  - `POST /recommendations/:user_id/update` – Ažuriraj korisničke preferencije i metadata proizvoda nakon kupnje (za poboljšanje preporuka).

---

**7. Testiranje**
- Jedinično testiranje API-ja (Postman)
- Integracijsko testiranje baza podataka
- Testiranje preporučiteljskog sustava s različitim setovima podataka

---

**8. Zaključak**
Ovaj projekt prikazuje kako kombinacija PostgreSQL i MongoDB omogućava skalabilnost, fleksibilnost i sigurnost u e-commerce sustavu. PostgreSQL osigurava konzistentne i pouzdane transakcije za narudžbe i plaćanja, dok MongoDB nudi fleksibilnu pohranu proizvoda i korisničkih profila, omogućavajući učinkovitu implementaciju preporučiteljskog sustma. Projekt je zamišljen kao demonstracija modernih pristupa bazama podataka u akademske svrhe.


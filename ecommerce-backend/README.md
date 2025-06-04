1. Korisnici (users)
    Primarni ključ: id

    Atributi: first_name, last_name, email, password, role, created_at

    U odnosu s:

    kosarice (1:N) preko korisnik_id

    narudzbe (1:N) preko korisnik_id

    recenzije (1:N) preko korisnik_id

    wishlist (1:N) preko korisnik_id

    povrati (1:N) preko korisnik_id

  2. Proizvodi (products)
    Primarni ključ: id

    Atributi: naziv, opis, cijena, na_stanju, kategorija_id

    U odnosu s:

    kategorije_proizvoda (N:1) preko kategorija_id

    vrijednosti_atributa (1:N) preko proizvod_id

    stavke_kosarice (1:N) preko proizvod_id

    stavke_narudzbe (1:N) preko proizvod_id

    recenzije (1:N) preko proizvod_id

    wishlist (M:N) indirektno

  3. Kategorije proizvoda (kategorije_proizvoda)
  Primarni ključ: id

    Atributi: naziv, opis

    U odnosu s:

    proizvodi (1:N) preko kategorija_id

    4. Atributi proizvoda (atributi_proizvoda)
    Primarni ključ: id

    Atributi: naziv, tip

    U odnosu s:

    vrijednosti_atributa (1:N) preko atribut_id

  5. Vrijednosti atributa (vrijednosti_atributa)
    Primarni ključ: id

    Atributi: vrijednost

    Strani ključevi:

    proizvod_id → products.id

    atribut_id → atributi_proizvoda.id

    U odnosu s:

    proizvodi (N:1)

    atributi_proizvoda (N:1)

  6. Košarice (kosarice)
    Primarni ključ: id

    Atributi: aktivna, kreirana

    Strani ključ:

    korisnik_id → users.id

    U odnosu s:

    stavke_kosarice (1:N) preko kosarica_id

  7. Stavke košarice (stavke_kosarice)
  Primarni ključ: id

  Atributi: kolicina

  Strani ključevi:

  kosarica_id → kosarice.id

  proizvod_id → products.id

  8. Narudžbe (narudzbe)
  Primarni ključ: id

  Atributi: status, datum

  Strani ključ:

  korisnik_id → users.id

  U odnosu s:

  stavke_narudzbe (1:N) preko narudzba_id

  placanja (1:1) preko narudzba_id

  povrati (1:N) preko narudzba_id

  9. Stavke narudžbe (stavke_narudzbe)
    Primarni ključ: id

    Atributi: kolicina, cijena

    Strani ključevi:

    narudzba_id → narudzbe.id

    proizvod_id → products.id

    10. Plaćanja (placanja)
    Primarni ključ: id

    Atributi: status, iznos, datum

    Strani ključ:

    narudzba_id → narudzbe.id

  11. Povrati (povrati)
    Primarni ključ: id

    Atributi: razlog, status, datum

    Strani ključevi:

    korisnik_id → users.id

    narudzba_id → narudzbe.id

  12. Lista želja (wishlist)
    Primarni ključ: id

    Strani ključevi:

    korisnik_id → users.id

    proizvod_id → products.id

    Opis: Veza M:N između korisnika i proizvoda

  13. Recenzije (recenzije)
    Primarni ključ: id

    Atributi: tekst, ocjena, datum

    Strani ključevi:

    korisnik_id → users.id

    proizvod_id → products.id
 
# Specifikacija Analize Sastojaka

Ova specifikacija opisuje proces pripreme i analize podataka korištenih u svrhu istraživanja mreže sastojaka.

*   **Čišćenje Dataseta:** Proces čišćenja dataseta provodi se u datoteci `Ciscenje podataka`.
*   **Dobiveni Skup Podataka:** Kao rezultat čišćenja, dobiven je skup podataka pod nazivom `Ingredients_set_769.txt`.
*   **Korištenje u Jupyter Bilježnici:** Ovaj dobiveni skup podataka koristi se za daljnju analizu u Jupyter bilježnici `Analiza_sastojaka_Fin`.

## Rezultati Analize Mreže Kozmetičkih Sastojaka

Analiza mreža u kozmetičkoj industriji otkrila je ključne uvide u formulaciju proizvoda i međusobne odnose sastojaka. Projekt je koristio podatke s platforme Sephora/Kaggle za prepoznavanje obrazaca i funkcionalnih grupa među sastojcima. Kroz primjenu metoda mrežne analize (poput centralnosti i detekcije zajednica, npr. Louvain algoritmom), istražene su skrivene veze i grupiranja sastojaka koja nisu očita u standardnim prikazima podataka.

**Ključni nalazi:**
*   **Funkcionalne cjeline:** Mrežna struktura jasno pokazuje da se kozmetički sastojci grupiraju u funkcionalne cjeline (npr., za hidrataciju, konzervaciju, teksturu, antioksidativnu zaštitu). Algoritam za detekciju zajednica uspješno je identificirao takve grupe, otkrivajući obrasce formulacije.
*   **Povezanost Sastojaka:** Analiza glavne komponente mreže potvrdila je visoku međusobnu povezanost većine sastojaka, ukazujući na to da formulacije nisu nasumične, već slijede logične funkcionalne ili tehnološke kriterije.
*   **Razlika od Slučajnog Grafa:** Usporedba stvarne mreže s nasumičnim grafom (ER modelom) pokazala je da stvarna mreža ima kraće putanje i manju povezanost između nepovezanih čvorova, što dodatno potvrđuje prisutnost specifičnih obrazaca u formuliranju proizvoda.

Ova mrežna analiza pridonosi dubljem razumijevanju kombinacija sastojaka i postavlja temelj za buduće sustave preporuka proizvoda te analizu trendova u kozmetičkoj industriji. 
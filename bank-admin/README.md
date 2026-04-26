# Bank Admin Panel

React admin interfejs za upravljanje mock bankom (klijenti, kartice, merchant-i, kredencijali, transakcije).

## Stack

- React 18, Redux Toolkit (RTK Query), Tailwind CSS, Vite
- Port: **5175**

## Pokretanje

```bash
cd bank-admin
npm install
npm run dev
```

Otvori: [http://localhost:5175](http://localhost:5175)

## Konfiguracija

Env varijabla `VITE_API_BASE` podrazumevano: `http://localhost:8090` (bank backend).

Za promenu, kreiraj `.env.local`:
```
VITE_API_BASE=http://localhost:8090
```

## Login

Koristi seed admin nalog: `admin@banka.local` / `admin123`

## Stranice

| Stranica | Ruta | Opis |
|----------|------|------|
| Dashboard | `/` | KPI + poslednji intent-i |
| Klijenti | `/clients` | CRUD klijenata, izdavanje kartica, top-up |
| Merchant-i | `/merchants` | CRUD, RSA/HMAC kredencijali, revoke |
| Transakcije | `/transactions` | Filter po statusu/merchant-u |
| Audit | `/audit` | Log svih akcija |
| Hosted plaćanje | `/pay/:ref` | Javna stranica za unos kartice |

## Hosted Payment Page

Ruta `/pay/:paymentRef` je javna (bez login-a) i služi kao stranica na koju se korisnik redirectuje sa web shopa da unese podatke kartice.

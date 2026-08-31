# FitCasino 🏋️🎰

Trasforma i tuoi allenamenti in FitPoints e usali per giocare.

## Giochi
- 🎰 Slot Machine
- ✈️ Aviator (crash game)
- 🃏 Blackjack
- 🪙 Coinflip
- 📦 Crate Opening (skin con rarità)

## Deploy su Railway

### 1. Crea un account Railway
Vai su [railway.app](https://railway.app) e registrati.

### 2. Crea il progetto
```bash
# Installa Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crea progetto
railway init
```

### 3. Aggiungi PostgreSQL
Nel dashboard Railway: **New** → **Database** → **PostgreSQL**

### 4. Deploy
```bash
railway up
```

### 5. Variabili d'ambiente
Nel dashboard Railway, vai su **Variables** e aggiungi:
```
JWT_SECRET=una-stringa-segreta-molto-lunga-e-casuale
```
(DATABASE_URL viene aggiunto automaticamente da Railway)

### 6. Apri il sito
```bash
railway open
```

## Sviluppo locale

```bash
# Installa dipendenze
npm install

# Copia il file env
cp .env.example .env
# Modifica .env con la tua DATABASE_URL locale

# Migra il database
npx prisma migrate dev

# Avvia
npm run dev
```

## Stack
- **Next.js 15** (App Router)
- **PostgreSQL** + **Prisma**
- **JWT** per l'auth
- Deploy su **Railway**

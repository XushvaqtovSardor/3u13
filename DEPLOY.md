# Cargo Management System - Production Deployment

## Render.com uchun deploy qilish

### 1. Render.com'da Web Service yaratish

1. [Render Dashboard](https://dashboard.render.com/)ga kiring
2. **New +** tugmasini bosing va **Web Service** tanlang
3. GitHub repository'ngizni ulang
4. Quyidagi sozlamalarni kiriting:

**Build & Deploy Settings:**
- **Name**: `cargo-system` (yoki istalgan nom)
- **Environment**: `Node`
- **Region**: Yaqin region tanlang
- **Branch**: `main`
- **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command**: `npm start`

**Environment Variables:**
Quyidagi environment variablelarni qo'shing:

```
DATABASE_URL=postgresql://neondb_owner:npg_Ua1f9QhiJXYD@ep-cool-math-a4vk526y-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_ACCESS_SECRET=refresh_jwt
JWT_REFRESH_SECRET=access_refresh
JWT_ACCESS_EXPIRES=55m
JWT_REFRESH_EXPIRES=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=xushvaqtovsardor032@gmail.com
EMAIL_PASSWORD=vzid ccic jtxq zrwx
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8537388202:AAGnFRzFMvg94TdEDn1AiGi4o1YVlBMN8WY
```

5. **Create Web Service** tugmasini bosing

### 2. Database migratsiya

Render service deploy bo'lganidan keyin avtomatik migratsiya ishga tushadi.

Agar manual migratsiya kerak bo'lsa:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 3. Deploy tugagach

Service URL: `https://your-app-name.onrender.com`

- Bosh sahifa: `https://your-app-name.onrender.com`
- Admin panel: `https://your-app-name.onrender.com/admin/login.html`
- Client panel: `https://your-app-name.onrender.com/client/login.html`
- API: `https://your-app-name.onrender.com/api/v1`

### 4. Neon Database (PostgreSQL)

Database allaqachon Neon'da sozlangan:
- Host: `ep-cool-math-a4vk526y-pooler.us-east-1.aws.neon.tech`
- Database: `neondb`
- SSL: Required

### 5. Boshqa platformalar

**Vercel** uchun:
- `vercel.json` fayli tayyor
- `vercel deploy` buyrug'i bilan deploy qiling

**Railway** uchun:
- Environment variablelarni kiriting
- Start command: `npm start`
- Build command: `npm install && npx prisma generate`

**Heroku** uchun:
- `Procfile` tayyor
- `git push heroku main`

### 6. Production checklist

✅ Database online (Neon PostgreSQL)  
✅ Environment variables sozlangan  
✅ Prisma client generated  
✅ Static files (public) serve qilinadi  
✅ JWT authentication ishlaydi  
✅ CORS sozlamalari (kerak bo'lsa)  
✅ Rate limiting faol  
✅ Error handling  
✅ Logging (Winston)  

### 7. Monitoring

Render Dashboard'da:
- Logs ko'rish
- Metrics (CPU, Memory)
- Deployment history
- Environment variables

### 8. Muhim

- `.env` faylini Git'ga push qilmang
- Render'da environment variablelar UI orqali qo'shiladi
- Database URL SSL bilan ishlaydi
- Free tier birinchi deploy'da 15 daqiqaga qadar vaqt olishi mumkin

### 9. Troubleshooting

Agar deploy xatolik bersa:
1. Build logs'ni tekshiring
2. Environment variables to'g'ri kiritilganligini tekshiring
3. Database connection tekshiring
4. Prisma migratsiya holatini tekshiring

## Yangilanishlar

```bash
git add .
git commit -m "Update"
git push origin main
```

Render avtomatik yangi deploy qiladi.

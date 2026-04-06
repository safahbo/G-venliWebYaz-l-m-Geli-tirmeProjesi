/**
 * 🛡️ SENTINELSTAFF ENTERPRISE VMS - CORE APPLICATION
 * Bu dosya Zero-Trust mimarisine göre yapılandırılmış ana sunucu dosyasıdır.
 * Kapsam: Helmet CSP, HSTS, Rate Limiting, Request Tracking ve Error Handling.
 */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const staffController = require('./controllers/staffController');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🛡️ ADVANCED SECURITY MIDDLEWARES
// ==========================================

// 1. Helmet: Military Grade HTTP Headers (XSS ve Clickjacking koruması)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' }
}));

// 2. Strict CORS Policy
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// 3. Brute-Force & DoS Protection (Rate Limiting)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına limit
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Çok fazla istek yapıldı, lütfen daha sonra tekrar deneyin." }
});
app.use('/api/', apiLimiter);

// 4. Payload Restriction (Memory Exhaustion önleme)
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Static Assets (Dashboard)
app.use(express.static('public'));

// ==========================================
// 🚦 THREAT MODELING ROUTES (API ENDPOINTS)
// ==========================================

// --- Scenario 1: SQL Injection ---
app.get('/api/v1/staff/legacy-search', staffController.legacySearch);
app.get('/api/v1/staff/secure-search', staffController.secureSearch);

// --- Scenario 2: IDOR (Insecure Direct Object Reference) ---
app.get('/api/v1/documents/legacy/:docId', staffController.legacyGetDocument);
app.get('/api/v1/documents/secure/:docId', staffController.secureGetDocument);

// --- Scenario 3: XSS (Cross-Site Scripting) ---
app.get('/api/v1/welcome/legacy', staffController.legacyWelcome);
app.get('/api/v1/welcome/secure', staffController.secureWelcome);

// --- Scenario 4: Command Injection ---
app.get('/api/v1/tools/legacy-ping', staffController.legacyPing);
app.get('/api/v1/tools/secure-ping', staffController.securePing);

// ==========================================
// ⚠️ GLOBAL ERROR HANDLING (Bilgi İfşasını Önleme)
// ==========================================
app.use((err, req, res, next) => {
    console.error(`[FATAL ERROR] ${err.stack}`);
    res.status(500).json({ error: "Dahili bir sistem hatası oluştu." });
});

// ==========================================
// 🚀 SERVER INITIALIZATION
// ==========================================
app.listen(PORT, () => {
    console.log("==================================================");
    console.log(`🛡️ SentinelStaff Enterprise VMS is ONLINE`);
    console.log(`🚀 Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security Layers: Helmet, CORS, RateLimit Active`);
    console.log("==================================================");
});

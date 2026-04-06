/**
 * 🛡️ SENTINELSTAFF ENTERPRISE VMS - SECURITY RESEARCH CONTROLLER
 * Bu modül, OWASP Top 10 zafiyetlerinin analiz edilmesi ve "Zero-Trust" 
 * mimarisiyle nasıl hafifletileceğini (remediation) göstermek için tasarlanmıştır.
 * İçerik: SQLi, IDOR, XSS, Command Injection (CWE-89, CWE-639, CWE-79, CWE-78)
 */
const sqlite3 = require('sqlite3').verbose();
const Joi = require('joi');
const { exec } = require('child_process');
// Ortam değişkeninden veya varsayılan yoldan veritabanı bağlantısı
const db = new sqlite3.Database(process.env.DB_PATH || './vms.sqlite');

// ============================================================================
// SCENARIO 1: SQL INJECTION (CWE-89)
// ============================================================================

/**
 * @vulnerability SQL Injection via String Interpolation
 * @description Kullanıcı girdisi temizlenmeden doğrudan sorguya dahil edilir.
 * Payload Örneği: ' OR 1=1 --
 */
exports.legacySearch = (req, res) => {
    const name = req.query.name;
    const query = `SELECT * FROM staff WHERE name = '${name}'`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ status: "Error", message: err.message });
        res.json({ status: "Vulnerable Result", count: rows.length, data: rows });
    });
};

/**
 * @remediation Parameterized Queries & Joi Regex Validation
 * @description Input verisi DB katmanından izole edilir ve strict validation uygulanır.
 */
exports.secureSearch = (req, res) => {
    const schema = Joi.string().alphanum().max(30).required();
    const { error, value } = schema.validate(req.query.name);
    
    if (error) return res.status(400).json({ error: "Zararlı karakter veya geçersiz format tespit edildi!" });

    const query = `SELECT id, name, role FROM staff WHERE name = ?`;
    db.all(query, [value], (err, rows) => {
        if (err) return res.status(500).json({ error: "Veritabanı Hatası" });
        res.json({ status: "Secured Result", count: rows.length, data: rows });
    });
};

// ============================================================================
// SCENARIO 2: IDOR (INSECURE DIRECT OBJECT REFERENCE - CWE-639)
// ============================================================================

/**
 * @vulnerability Missing Object-Level Access Control
 * @description Sadece ID kontrolü yapılır, yetki kontrolü atlanır.
 */
exports.legacyGetDocument = (req, res) => {
    const docId = req.params.docId;
    db.get(`SELECT * FROM confidential_docs WHERE id = ?`, [docId], (err, row) => {
        if (!row) return res.status(404).send("İlgili doküman bulunamadı.");
        res.json({ status: "Vulnerable Access", data: row });
    });
};

/**
 * @remediation Object-Level Authorization (Zero-Trust)
 * @description Belgenin hem varlığı hem de istek yapan kullanıcıya ait olup olmadığı denetlenir.
 */
exports.secureGetDocument = (req, res) => {
    const docId = req.params.docId;
    const userId = req.headers['x-user-id']; // Gerçek senaryoda JWT'den elde edilir.

    const query = `SELECT * FROM confidential_docs WHERE id = ? AND owner_id = ?`;
    db.get(query, [docId, userId], (err, row) => {
        if (!row) return res.status(403).json({ error: "Bu belgeye erişim yetkiniz (Authorization) bulunmamaktadır!" });
        res.json({ status: "Secured Access", data: row });
    });
};

// ============================================================================
// SCENARIO 3: CROSS-SITE SCRIPTING (REFLECTED XSS - CWE-79)
// ============================================================================

/**
 * @vulnerability Reflected XSS
 * @description Kullanıcı girdisi encode edilmeden HTML DOM'a basılır.
 */
exports.legacyWelcome = (req, res) => {
    const user = req.query.user || 'Misafir';
    // TEHLİKE: Girdi doğrudan render ediliyor
    res.send(`<html><body><h1>Sisteme Hoşgeldin, ${user}</h1><p>VMS Aktif.</p></body></html>`);
};

/**
 * @remediation Output Encoding & Context-Aware Escaping
 * @description Riskli HTML karakterleri encode edilerek script çalışması engellenir.
 */
exports.secureWelcome = (req, res) => {
    const user = req.query.user || 'Misafir';
    // GÜVENLİ: HTML Entity Encoding
    const escapedUser = String(user).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    res.send(`<html><body><h1>Sisteme Hoşgeldin, ${escapedUser}</h1><p>VMS Aktif (Secured).</p></body></html>`);
};

// ============================================================================
// SCENARIO 4: COMMAND INJECTION (OS COMMAND INJECTION - CWE-78)
// ============================================================================

/**
 * @vulnerability OS Command Injection
 * @description Kullanıcı girdisi doğrudan sistem kabuğuna (shell) iletilir.
 */
exports.legacyPing = (req, res) => {
    const ip = req.query.ip || '127.0.0.1';
    // TEHLİKE: 8.8.8.8; ls -la gibi komutlar çalıştırılabilir.
    exec(`ping -c 1 ${ip}`, (err, stdout, stderr) => {

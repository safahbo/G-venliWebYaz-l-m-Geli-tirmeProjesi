/**
 * 🕵️ SECURITY RESEARCH CONTROLLER
 * Bu modül, OWASP Top 10 zafiyetlerinin analiz edilmesi için tasarlanmıştır.
 */
const sqlite3 = require('sqlite3').verbose();
const Joi = require('joi');
const db = new sqlite3.Database(process.env.DB_PATH || './vms.sqlite');

// ==========================================
// SCENARIO 1: SQL INJECTION (CWE-89)
// ==========================================

/**
 * @vulnerability SQL Injection via String Interpolation
 * @description Kullanıcı girdisi doğrudan sorguya dahil edildiği için ' OR 1=1 -- gibi payloadlar çalışır.
 */
exports.legacySearch = (req, res) => {
    const name = req.query.name;
    const query = `SELECT * FROM staff WHERE name = '${name}'`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json({ status: "Vulnerable Result", data: rows });
    });
};

/**
 * @remediation Parameterized Queries & Joi Validation
 * @description Input verisi compile edilmeden önce veri tipine göre valide edilir ve DB katmanında izole edilir.
 */
exports.secureSearch = (req, res) => {
    const schema = Joi.string().alphanum().max(30).required();
    const { error, value } = schema.validate(req.query.name);
    
    if (error) return res.status(400).json({ error: "Zararlı karakter tespit edildi!" });

    const query = `SELECT id, name, role FROM staff WHERE name = ?`;
    db.all(query, [value], (err, rows) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.json({ status: "Secured Result", data: rows });
    });
};

// ==========================================
// SCENARIO 2: IDOR (CWE-639)
// ==========================================

/**
 * @vulnerability IDOR - Missing Access Control
 */
exports.legacyGetDocument = (req, res) => {
    const docId = req.params.docId;
    db.get(`SELECT * FROM confidential_docs WHERE id = ?`, [docId], (err, row) => {
        if (!row) return res.status(404).send("Not Found");
        res.json(row);
    });
};

/**
 * @remediation Object-Level Authorization
 */
exports.secureGetDocument = (req, res) => {
    const docId = req.params.docId;
    const userId = req.headers['x-user-id']; // Gerçek senaryoda JWT'den gelir.

    const query = `SELECT * FROM confidential_docs WHERE id = ? AND owner_id = ?`;
    db.get(query, [docId, userId], (err, row) => {
        if (!row) return res.status(403).json({ error: "Bu belgeye erişim yetkiniz yok!" });
        res.json(row);
    });
};

// ==========================================
// SCENARIO 3: XSS (CWE-79)
// ==========================================

/**
 * @vulnerability Reflected XSS
 */
exports.legacyWelcome = (req, res) => {
    const user = req.query.user || 'Misafir';
    res.send(`<h1>Sisteme Hoşgeldin, ${user}</h1>`);
};

/**
 * @remediation Output Encoding
 */
exports.secureWelcome = (req, res) => {
    const user = req.query.user || 'Misafir';
    const escapedUser = user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    res.send(`<h1>Sisteme Hoşgeldin, ${escapedUser}</h1>`);
};

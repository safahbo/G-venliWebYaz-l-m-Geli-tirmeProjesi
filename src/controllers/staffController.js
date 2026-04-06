/**
 * 🕵️ SENTINELSTAFF SECURITY RESEARCH CONTROLLER
 * Kapsam: SQLi, IDOR, XSS ve Command Injection (CWE-78)
 */
const sqlite3 = require('sqlite3').verbose();
const Joi = require('joi');
const { exec } = require('child_process'); 
const db = new sqlite3.Database(process.env.DB_PATH || './vms.sqlite');

// --- SCENARIO 1: SQL Injection (CWE-89) ---
exports.legacySearch = (req, res) => {
    db.all(`SELECT * FROM staff WHERE name = '${req.query.name}'`, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json({ status: "Vulnerable", data: rows });
    });
};

exports.secureSearch = (req, res) => {
    const schema = Joi.string().alphanum().max(30).required();
    const { error, value } = schema.validate(req.query.name);
    if (error) return res.status(400).json({ error: "Zararlı karakter saptandı!" });
    db.all(`SELECT id, name, role FROM staff WHERE name = ?`, [value], (err, rows) => {
        if (err) return res.status(500).json({ error: "DB Hatası" });
        res.json({ status: "Secured", data: rows });
    });
};

// --- SCENARIO 2: IDOR (CWE-639) ---
exports.legacyGetDocument = (req, res) => {
    db.get(`SELECT * FROM confidential_docs WHERE id = ?`, [req.params.docId], (err, row) => {
        if (!row) return res.status(404).send("Bulunamadı");
        res.json(row);
    });
};

exports.secureGetDocument = (req, res) => {
    const query = `SELECT * FROM confidential_docs WHERE id = ? AND owner_id = ?`;
    db.get(query, [req.params.docId, req.headers['x-user-id']], (err, row) => {
        if (!row) return res.status(403).json({ error: "Yetkisiz Erişim!" });
        res.json(row);
    });
};

// --- SCENARIO 3: XSS (CWE-79) ---
exports.legacyWelcome = (req, res) => {
    res.send(`<h1>Hoşgeldin, ${req.query.user}</h1>`);
};

exports.secureWelcome = (req, res) => {
    const safeUser = String(req.query.user).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    res.send(`<h1>Hoşgeldin, ${safeUser}</h1>`);
};

// --- SCENARIO 4: Command Injection (CWE-78) ---
exports.legacyPing = (req, res) => {
    const ip = req.query.ip;
    // VULNERABLE: Direct shell execution
    exec(`ping -c 1 ${ip}`, (err, stdout) => {
        if (err) return res.status(500).send(err.message);
        res.send(`<pre>${stdout}</pre>`);
    });
};

exports.securePing = (req, res) => {
    const ip = req.query.ip;
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) return res.status(400).json({ error: "Hatalı IP Formatı!" });
    exec(`ping -c 1 ${ip}`, (err, stdout) => {
        if (err) return res.status(500).send("Sistem Hatası");
        res.send(`<pre>${stdout}</pre>`);
    });
};

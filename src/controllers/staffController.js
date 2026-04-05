const sqlite3 = require('sqlite3').verbose();
const Joi = require('joi'); // Enterprise input validation
const db = new sqlite3.Database(process.env.DB_PATH || './vms.sqlite');

/**
 * THREAT MODELING SCENARIOS (For AI Security Audit)
 */

// ==========================================
// SCENARIO 1: SQL INJECTION (SQLi)
// ==========================================

// @vulnerability: CWE-89 (SQL Injection) via String Interpolation
exports.legacySearch = (req, res) => {
    const searchParam = req.query.name;
    const query = `SELECT id, name, role FROM staff WHERE name = '${searchParam}'`;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message }); // Info Disclosure
        res.json({ data: rows });
    });
};

// @remediation: Prepared Statements + Input Validation (Joi)
exports.secureSearch = (req, res) => {
    // 1. Hardcore Input Validation (Allow ONLY letters and spaces, max 50 chars)
    const schema = Joi.string().pattern(/^[a-zA-Z\s]+$/).max(50).required();
    const { error, value: searchParam } = schema.validate(req.query.name);
    
    if (error) {
        return res.status(400).json({ error: "Invalid input format detected. Threat logged." });
    }

    // 2. Parameterized Query (Execution Plan is locked)
    const query = `SELECT id, name, role FROM staff WHERE name = ?`;
    db.all(query, [searchParam], (err, rows) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" }); // Safe error
        res.json({ data: rows });
    });
};

// ==========================================
// SCENARIO 2: IDOR (Insecure Direct Object Reference)
// ==========================================

// @vulnerability: CWE-639 (IDOR) - Missing Authorization
exports.legacyGetDocument = (req, res) => {
    const docId = req.params.docId;
    const query = `SELECT * FROM confidential_docs WHERE id = ?`;
    
    db.get(query, [docId], (err, row) => {
        if (!row) return res.status(404).json({ error: "Document not found" });
        res.json({ data: row }); 
    });
};

// @remediation: Object-Level Authorization (Zero-Trust)
exports.secureGetDocument = (req, res) => {
    const docId = parseInt(req.params.docId, 10);
    const currentUserId = parseInt(req.headers['x-user-id'], 10); 
    
    if (isNaN(docId) || isNaN(currentUserId)) {
        return res.status(400).json({ error: "Malformed request parameters." });
    }

    // Check BOTH Document Existence AND User Ownership in a single atomic query
    const query = `SELECT * FROM confidential_docs WHERE id = ? AND owner_id = ?`;
    db.get(query, [docId, currentUserId], (err, row) => {
        if (!row) return res.status(403).json({ error: "Access Denied / Not Found" });
        res.json({ data: row });
    });
};

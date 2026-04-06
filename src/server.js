/**
 * @file server.js - IDOR Lab Environment
 * @university Istinye University
 * @instructor Keyvan Arasteh
 * @author Safa Hacıbayramoğlu
 * * SECURITY ADVISORY (CWE-639 / OWASP A01):
 * Bu dosya kasıtlı olarak IDOR zafiyeti barındırmaktadır.
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

const invoices = {
    "100": { id: 100, owner: "Safa", amount: "1500 TL", detail: "Laptop Tamiri", date: "2026-03-01" },
    "101": { id: 101, owner: "Basak", amount: "450 TL", detail: "Internet Faturasi", date: "2026-03-05" },
    "102": { id: 102, owner: "Mehmet", amount: "2100 TL", detail: "Kira Odemesi", date: "2026-03-10" }
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// TODO: Implement Authorization checks to prevent IDOR (CWE-639)
app.get('/api/invoice/:id', (req, res) => {
    const id = req.params.id;
    const invoice = invoices[id];
    if (invoice) {
        // FIXME: Missing Ownership Validation
        res.json(invoice);
    } else {
        res.status(404).json({ error: "Fatura bulunamadı!" });
    }
});

app.listen(PORT, () => {
    console.log(`[!] Sunucu aktif: http://localhost:${PORT}`);
});

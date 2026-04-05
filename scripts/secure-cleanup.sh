#!/bin/bash
# FORENSIC GRADE SECURE ERASURE PROTOCOL

echo "[*] Executing Anti-Forensic Cleanup..."

# 'shred' overwrites file contents with zeroes/random data before deletion (DoD 5220.22-M standard approach)
find ../logs -type f -name "*.log" -exec shred -u -z -n 3 {} +
find ../ -type f -name "*.env*" -exec shred -u -z -n 3 {} +

echo "[+] Digital footprint eradicated."

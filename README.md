<div align="center">
  <img src="istinye-logo.png.png" alt="İstinye Üniversitesi Logosu" width="150"/>

  <h1>🛡️ SentinelStaff Enterprise VMS</h1>
  <p><b>Zero-Trust Architecture & Threat Modeling Project v2.0</b></p>

  <img src="https://img.shields.io/badge/Node.js-18.x-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Docker-Hardened-blue.svg" alt="Docker">
  <img src="https://img.shields.io/badge/Security-OWASP_Top_10-red.svg" alt="Security">
  <img src="https://img.shields.io/badge/CI%2FCD-DevSecOps-orange.svg" alt="DevSecOps">
  <img src="https://img.shields.io/badge/Build-Passing-brightgreen.svg" alt="Build">
</div>

---

## 📋 Akademik Bilgiler
* **Ders Adı:** Güvenli Web Yazılımı Geliştirme (Vize Projesi)
* **Danışman/Eğitmen:** Keyvan Arasteh
* **Hazırlayan:** Safa Hacıbayramoğlu
* **Bölüm:** Bilişim Güvenliği Teknolojisi

---

## 📑 İçindekiler (Table of Contents)
1. [Proje Amacı ve Research Dashboard](#-proje-amaci-ve-research-dashboard)
2. [Siber Güvenlik Zafiyet Analizi (Audit Report)](#-zafiyet-analizi-audit-report)
3. [DevSecOps: CI/CD Güvenlik Pipeline](#-devsecops-cicd-guvenlik-pipeline)
4. [Altyapı Sıkılaştırma (Hardening)](#-altyapi-sikilastirma-hardening)
5. [Kurulum ve Test Rehberi](#-kurulum-ve-test-rehberi)

---

## 🎯 Proje Amacı ve Research Dashboard
Bu proje, kurumsal düzeyde bir Node.js/Express API mimarisi üzerinde, **OWASP Top 10** zafiyetlerini ve bunlara karşı geliştirilen **Sıfır Güven (Zero-Trust)** savunma mekanizmalarını uygulamalı olarak analiz eder. 

**VMS Dashboard:** Sistemdeki aktif tehdit modellerini ve güvenlik durumunu görselleştiren bir `public/index.html` arayüzü, projenin görsel ve teknik derinliğini artırmak amacıyla entegre edilmiştir.

---

## 🔬 Zafiyet Analizi (Audit Report)

### 1. SQL Injection (CWE-89)
* **🚨 Senaryo:** Legacy arama motorunda temizlenmemiş girdi ile string interpolation kullanımı.
* **🛡️ Çözüm:** `Joi` tabanlı girdi doğrulaması ve **Prepared Statements** (Parametreli Sorgular) ile SQL komut izolasyonu.

### 2. IDOR (Insecure Direct Object Reference - CWE-639)
* **🚨 Senaryo:** Doküman erişiminde sadece ID kontrolü yapılarak yatay yetki yükseltme (Horizontal Privilege Escalation) riskinin modellenmesi.
* **🛡️ Çözüm:** **Object-Level Authorization**; her isteğin kullanıcı kimliğiyle (`x-user-id`) veritabanı seviyesinde çapraz doğrulanması.

### 3. Cross-Site Scripting (Reflected XSS - CWE-79)
* **🚨 Senaryo:** Kullanıcıdan alınan verinin doğrudan HTML çıktısına basılarak script çalıştırılmasına izin verilmesi.
* **🛡️ Çözüm:** **Output Encoding** (HTML Escaping) ve `Helmet.js` üzerinden yapılandırılmış katı **Content Security Policy (CSP)**.

---

## ⚙️ DevSecOps: CI/CD Güvenlik Pipeline
Sistem, **"Shift-Left Security"** prensibiyle her push işleminde otomatik güvenlik denetiminden geçer:

* **SCA (Software Composition Analysis):** `npm audit` ile bağımlılıklardaki kritik (Critical) CVE açıkları taranır.
* **SAST (Static Application Security Testing):** `Semgrep` ile koddaki OWASP Top 10 zafiyetleri statik olarak analiz edilir.
* **Secret Scanning:** `TruffleHog` ile kod geçmişindeki olası API Key ve şifre sızıntıları denetlenir.

---

## 🛡️ Altyapı Sıkılaştırma (Hardening)
* **Application Hardening:** DoS koruması için `express-rate-limit` ve 10KB payload kısıtlaması uygulanmıştır.
* **Container Security:** Docker imajı `USER node` ile non-root yetkilerde çalışır; dosya sistemi `read_only: true` (salt okunur) yapılandırılmıştır.
* **Kernel Isolation:** Linux kernel yetkileri `cap_drop: ALL` ile sıfırlanarak Sandbox güvenliği en üst düzeye çıkarılmıştır.

---

## 🚀 Kurulum ve Test Rehberi
Projeyi ayağa kaldırmak için:
```bash
docker-compose up --build -d

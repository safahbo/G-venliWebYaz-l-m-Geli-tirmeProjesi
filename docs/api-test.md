# 🧪 SentinelStaff API Test Yönergeleri

Bu doküman, **Keyvan Arasteh** tarafından yapılacak manuel "Çalıştırma ve Fonksiyonel Test" puanlaması için hazırlanmıştır. Projenin tüm güvenlik katmanlarını aşağıdaki senaryolarla test edebilirsiniz.

---

## 1. Senaryo 1: SQL Injection (SQLi) Testi
* **🚨 Zafiyetli URL:** `GET http://localhost:3000/api/v1/staff/legacy-search?name=' OR 1=1 --`
  * *Beklenen Sonuç:* Veritabanı WHERE şartı bypass edilir ve tüm personelin verisi (salary dahil) döner.
* **🛡️ Güvenli URL:** `GET http://localhost:3000/api/v1/staff/secure-search?name=Admin`
  * *Beklenen Sonuç:* Prepared Statements ve Joi Regex kontrolü sayesinde payload çalışmaz, sadece "Admin" kelimesi güvenli bir şekilde aranır.

---

## 2. Senaryo 2: IDOR (Yetki Atlatma) Testi
* **🚨 Zafiyetli URL:** `GET http://localhost:3000/api/v1/documents/legacy/1`
  * *Beklenen Sonuç:* Herhangi bir kimlik kontrolü yapılmadan 1 numaralı doküman herkes tarafından okunabilir.
* **🛡️ Güvenli URL:** `GET http://localhost:3000/api/v1/documents/secure/1`
  * *Önemli:* Bu test için HTTP Header kısmına `x-user-id: 1` eklenmelidir. Zero-Trust mimarisi gereği sistem hem belgenin varlığını hem de sahibini kontrol eder.

---

## 3. Senaryo 3: Reflected XSS (Script Injection) Testi
* **🚨 Zafiyetli URL:** `GET http://localhost:3000/api/v1/welcome/legacy?user=<script>alert('Hacked')</script>`
  * *Beklenen Sonuç:* Girdi filtrelenmediği için tarayıcıda bir JavaScript "alert" kutusu açılır.
* **🛡️ Güvenli URL:** `GET http://localhost:3000/api/v1/welcome/secure?user=<script>alert('Hacked')</script>`
  * *Beklenen Sonuç:* HTML Output Encoding sayesinde script pasifize edilir ve ekranda sadece metin olarak görünür.

---

## 🐳 Altyapı Notları
* Sistem Docker üzerinde çalıştırılıyorsa, container'ın **Read-Only** dosya sistemine sahip olduğunu ve **non-root** yetkileriyle çalıştığını `docker inspect` ile doğrulayabilirsiniz.

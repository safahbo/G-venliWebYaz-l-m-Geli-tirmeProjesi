# 🧪 SentinelStaff API Test Yönergeleri

Bu doküman, Keyvan Arasteh tarafından yapılacak manuel "Çalıştırma ve Fonksiyonel Test" puanlaması için hazırlanmıştır.

## 1. Senaryo 1: SQL Injection (SQLi) Testi
* **Zafiyetli URL:** `GET http://localhost:3000/api/v1/staff/legacy-search?name=' OR 1=1 --`
  * *Beklenen Sonuç:* Veritabanı WHERE şartı bypass edilir ve tüm personelin verisi döner.
* **Güvenli URL:** `GET http://localhost:3000/api/v1/staff/secure-search?name=Admin`
  * *Beklenen Sonuç:* Prepared Statements sayesinde payload çalışmaz, sadece "Admin" kelimesi güvenli bir şekilde aranır.

## 2. Senaryo 2: IDOR Testi
* **Zafiyetli URL:** `GET http://localhost:3000/api/v1/documents/legacy/1`
  * *Beklenen Sonuç:* Herhangi bir kimlik kontrolü yapılmadan 1 numaralı doküman herkes tarafından okunabilir.
* **Güvenli URL:** `GET http://localhost:3000/api/v1/documents/secure/1`
  * *Beklenen Sonuç:* Güvenli test için HTTP Header kısmına `x-user-id: 1` eklenmelidir. Zero-Trust mimarisi gereği sistem hem belgenin varlığını hem de sahibini kontrol eder.

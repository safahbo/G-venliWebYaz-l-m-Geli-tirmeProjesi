# 🧪 SentinelStaff API Kapsamlı Test Rehberi

Bu döküman, **Keyvan Arasteh** tarafından projenin "Çalıştırma ve Fonksiyonel Test" puanlaması (%30) aşamasında kullanılmak üzere hazırlanmıştır. Tüm güvenlik katmanları aşağıdaki URL'ler üzerinden doğrulanabilir.

---

## 🔍 Senaryo 1: SQL Injection (SQLi)
*Amaç: Veritabanı sorgusunu manipüle ederek tüm tabloyu veya veri yapısını ele geçirmek.*

* **🚨 Zafiyetli Test URL:** `GET http://localhost:3000/api/v1/staff/legacy-search?name=' OR 1=1 --`
  *(Sonuç: Sorgu mantığı kırılır ve tüm veritabanı içeriği dışarı sızar.)*
* **🛡️ Güvenli Test URL:** `GET http://localhost:3000/api/v1/staff/secure-search?name=' OR 1=1 --`
  *(Sonuç: "Zararlı karakter saptandı" hatası döner ve Prepared Statement sayesinde atak engellenir.)*

---

## 🔐 Senaryo 2: Insecure Direct Object Reference (IDOR)
*Amaç: Yetkilendirme eksikliğini kullanarak başka kullanıcılara ait hassas verilere ulaşmak.*

* **🚨 Zafiyetli Test URL:** `GET http://localhost:3000/api/v1/documents/legacy/1`
  *(Sonuç: Herhangi bir kimlik denetimi olmadığı için 1 numaralı belge okunur.)*
* **🛡️ Güvenli Test URL:** `GET http://localhost:3000/api/v1/documents/secure/1`
  *(Sonuç: İstek reddedilir. Bu isteğin başarılı olması için Postman/Insomnia üzerinden HTTP Header kısmına `x-user-id: 1` key-value parametresi eklenmelidir. Bu sayede Object-Level Authorization doğrulanır.)*

---

## 💉 Senaryo 3: Reflected Cross-Site Scripting (XSS)
*Amaç: Tarayıcı üzerinde izinsiz JavaScript kodu çalıştırarak session çalmak.*

* **🚨 Zafiyetli Test URL:** `GET http://localhost:3000/api/v1/welcome/legacy?user=<script>alert('Sistem Hacklendi!')</script>`
  *(Sonuç: Girdi sanitize edilmediği için tarayıcıda bir pop-up uyarısı çalışır.)*
* **🛡️ Güvenli Test URL:** `GET http://localhost:3000/api/v1/welcome/secure?user=<script>alert('Sistem Hacklendi!')</script>`
  *(Sonuç: HTML Entity Encoding işlemi sayesinde script tagları zararsız metne dönüştürülür ve ekrana yazdırılır.)*

---

## 💣 Senaryo 4: OS Command Injection
*Amaç: İşletim sistemi seviyesinde yetkisiz shell komutları çalıştırmak.*

* **🚨 Zafiyetli Test URL:** `GET http://localhost:3000/api/v1/tools/legacy-ping?ip=127.0.0.1; ls -la`
  *(Sonuç: Ping komutu bittikten hemen sonra `ls -la` komutu çalışır ve sunucunun dizin içeriği listelenir.)*
* **🛡️ Güvenli Test URL:** `GET http://localhost:3000/api/v1/tools/secure-ping?ip=127.0.0.1; ls -la`
  *(Sonuç: Girdi Strict IP Regex filtresinden geçemediği için istek `400 Bad Request` ile reddedilir.)*

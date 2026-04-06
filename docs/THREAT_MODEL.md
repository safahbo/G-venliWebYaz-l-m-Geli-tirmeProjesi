# Tehdit Modellemesi (Threat Modeling)

### 1. Saldırı Yüzeyi (Attack Surface)
- **Endpoint:** `/api/invoice/:id`
- **Yöntem:** GET parametresi manipülasyonu.

### 2. Risk Analizi (STRIDE)
| Tehdit | Açıklama | Seviye |
| :--- | :--- | :--- |
| **Information Disclosure** | Yetkisiz PII (Fatura) verisi sızıntısı. | **Kritik** |
| **Tampering** | İstemci taraflı ID manipülasyonu. | Yüksek |

### 3. Önleme (Mitigation)
- Ardışık ID yerine UUID kullanımı.
- Sunucu tarafında `session.userId === invoice.ownerId` kontrolü.

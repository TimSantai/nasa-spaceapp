# Field Shift: Master Project Context & Specification
> **NASA Space Apps Challenge 2026** &middot; Local Event Purwokerto  
> **Challenge**: *Field Shift: Adapting Farms with NASA Data* (Intermediate–Advanced)  
> **Team**: Tim Santai / Pasukan Kebal When Yah  

---

## 📑 Quick Navigation & Reference Files

- 📖 **Full Product Brief**: [`docs/product-brief.md`](file:///E:/Coding/Lomba/Nasa/docs/product-brief.md)
- 🔬 **Riset, Novelty & Strategi Lengkap**: [`docs/riset-dan-strategi.md`](file:///E:/Coding/Lomba/Nasa/docs/riset-dan-strategi.md)
- 🗄️ **Supabase SQL Schema & Seed**: [`supabase_schema.sql`](file:///E:/Coding/Lomba/Nasa/supabase_schema.sql)
- 🌐 **Frontend Application**: [`frontend-nasa/`](file:///E:/Coding/Lomba/Nasa/frontend-nasa)
- 🐍 **Backend FastAPI Service**: [`backend-nasa/`](file:///E:/Coding/Lomba/Nasa/backend-nasa)

---

## 🎯 1. Executive Summary & Pitch

### The Core Problem
Petani di Banyumas dan kawasan pertanian tropis menghadapi ketidakpastian iklim yang ekstrem: mundurnya awal musim hujan (monsoon delay) dan kemarau berkepanjangan akibat El Niño/IOD positif sering memicu gagal panen pada pola monokultur padi terus-menerus (Padi–Padi–Bera). Data iklim satelit NASA tersedia gratis, namun tersebar di puluhan portal, beresolusi kasar, dan tidak disajikan dalam bentuk rekomendasi trade-off yang bisa dipahami petani.

### Pitch Statement
> *"Field Shift adalah decision-support tool yang membantu petani dan penyuluh membandingkan minimal tiga pilihan rotasi tanaman berbasis bukti observasi satelit NASA dan tanah lokal, dinilai berdasarkan risiko iklim musim depan (CVaR), serta jujur menyampaikan di mana batas ketidakpastian datanya."*

---

## 💡 2. Empat Pilar Novelty (Pembeda Utama)

1. **Observed Rotation Evidence & NASA Phenology**:
   - Mendeteksi jendela lahan bera (*fallow*) dan siklus tanam menggunakan data harian **NASA HLS (Harmonized Landsat Sentinel-2) 30m NDVI** dan anomali stres air tanaman **ECOSTRESS 70m ESI**.
2. **Climate-State-Conditioned Ensemble**:
   - Rotasi tanaman tidak dinilai dari rata-rata iklim statis, melainkan dikondisikan pada **fase iklim analog (El Niño / La Niña / Netral)** menggunakan data historis 25 tahun **NASA POWER AG** dan **GPM IMERG V07** (sejak tahun 2000).
3. **Risk-Aware Multi-Objective Scoring (CVaR + Pareto Front)**:
   - Penilaian eksplisit atas risiko tahun terburuk melalui **Conditional Value at Risk (CVaR)**.
   - Petani dapat menggeser **Caution Slider (0% – 100%)** secara live di UI untuk mengubah preferensi dari pertumbuhan agresif ke mitigasi gagal panen.
4. **Data-Availability-Aware Confidence & Information Gap Disclosure**:
   - Menampilkan tingkat keyakinan (HIGH/MODERATE/LOW) dan terus terang menyatakan data yang tidak tersedia di Indonesia (misal: ketiadaan data survey tanah laboratorium lokal atau USDA CSB), memenuhi mandat transparansi challenge NASA.

---

## 🛰️ 3. Inventaris Dataset & Batasan Skala Resolusi

| Dataset | Resolusi Spasial / Temporal | Peran dalam Field Shift | Validitas & Skala |
|---|---|---|---|
| **NASA HLS 30m (L30 + S30 v2.0)** | 30 m / 2–3 hari | Kurva fenologi NDVI, deteksi waktu tanam, panen & lahan bera | **Resolusi petak**. Valid untuk petak sawah. |
| **ECOSTRESS ESI v002** | 70 m / variatif (ISS) | Indeks stres air evaporatif tanaman (ET actual vs potential) | **Resolusi petak**. Valid untuk deteksi stres air. |
| **GPM IMERG Final Daily V07** | 0.1° (~11 km) / harian | Curah hujan historis 25 tahun, deteksi onset musim | Konteks wilayah / iklim kawasan. |
| **NASA POWER (AG)** | 0.5° (~50 km) / harian | Suhu min/max, radiasi matahari, kelembapan, ET0 | Konteks wilayah / model neraca air. |
| **NASA SMAP L4 (SPL4SMGP)** | 9 km / 3 jam | Kelembapan tanah root-zone saat transisi musim kemarau | Konteks kawasan DAS / cekungan. |
| **NASA SRTM GL1** | 30 m (1 arc-sec) | Elevasi & kemiringan lereng untuk risiko erosi | **Resolusi petak**. Valid untuk topografi 3D. |
| **ISRIC SoilGrids / FAO HWSD** | 250 m | Tekstur tanah, bahan organik, AWC (Available Water Capacity) | Estimasi tanah regional. |
| **FAO GAEZ v4** | ~9 km | Kesesuaian agro-klimatologi untuk 51 komoditas tanaman | Prior model kesesuaian rotasi alternatif. |

---

## 🗺️ 4. Wilayah Studi Demo: Banyumas, Jawa Tengah

1. **Plot Karangrau Block 4B (Kec. Banyumas)**:
   - Dataran rendah irigasi teknis Serayu (elevasi 48m, lereng 2.1%).
   - Monokultur eksisting: *Padi–Padi–Bera*. Rawan kekeringan di musim kemarau kedua.
2. **Sumbang Highland Terrace 2A (Kec. Sumbang)**:
   - Lereng vulkanik Gunung Slamet (elevasi 310m, lereng 8.4%).
   - Tanah Andosol subur, rawan erosi pada lereng miring jika lahan dibiarkan bera.
3. **Rawalo Lowland Basin 1C (Kec. Rawalo)**:
   - Cekungan lempung berat (elevasi 28m, lereng 0.8%).
   - Sangat rentan kekurangan air saluran irigasi saat El Niño ekstrem.

---

## 🌾 5. Strategi Rotasi Tanaman yang Dibandingkan

| Strategi | Urutan Tanaman | Status Pareto | Karakteristik & Trade-off |
|---|---|---|---|
| **Baseline (Eksisting)** | Padi (Hujan) &rarr; Padi Gadu &rarr; **Lahan Bera (90 hari)** | Dominated | Pendapatan tinggi di tahun basah, namun **risiko gagal panen 60%+** di tahun kering El Niño. Gulma dan erosi meningkat saat lahan kosong. |
| **Alternatif A (Rekomendasi)** | Padi (Hujan) &rarr; Padi Gadu &rarr; **Kacang Hijau (Vima-1)** &rarr; Pupuk Hijau | **Optimal** | Hemat air (hanya butuh 250–350 mm), memanfaatkan residu lengas tanah SMAP, fiksasi nitrogen biologis (+40 kg N/ha), tutupan tanah 85%+. |
| **Alternatif B (Diversifikasi)** | Padi (Hujan) &rarr; **Kedelai** &rarr; **Sorgum Tahan Kering** | Tradeoff | Pemotongan siklus hama monokultur, sorgum berakar dalam menembus lapisan tapak bajak, penghematan air 520.000 m³ per 100 ha. |

---

## 💻 6. Arsitektur Teknis Sistem

### A. Frontend (`frontend-nasa/`)
- **React 19 + TypeScript + Vite 8**
- **Styling**: Tailwind CSS v4
- **Peta 3D**: `DeckGL` + `MapLibre GL` (Menampilkan citra satelit NASA/ESRI World Imagery + ekstrusi 3D poligon petak + label mengambang + kontrol 2D/3D).
- **Grafik**: `Recharts` (Visualisasi siklus iklim NASA POWER 25 tahun + kurva fenologi NDVI HLS).
- **Komponen**:
  - `FieldMap.tsx` (F1)
  - `FieldProfileView.tsx` (F2)
  - `PriorityControls.tsx` (F3 & F6: 5 Slider bobot + Pemilih El Niño/La Niña)
  - `StrategyBoard.tsx` (F4 & F5: Matriks 3 strategi + Caution Slider)
  - `EvidenceModal.tsx` (F7 & F8: Provenance satelit, data gaps, checklist PPL)
  - `GlossaryModal.tsx` (F9: Glosarium sensor & agronomi)
  - `SummaryBrief.tsx` (F14: Lembar briefing cetak/PDF)

### B. Database (`Supabase / PostgreSQL + PostGIS`)
- **Project Ref**: `ljxtsjmlqzuebngrfdyd`
- **File Skema & Seed**: [`supabase_schema.sql`](file:///E:/Coding/Lomba/Nasa/supabase_schema.sql)
- **Tabel**:
  - `fields`: Data poligon PostGIS, elevasi, lereng, tanah, histori iklim, dan time-series NDVI.
  - `strategies`: Komparasi urutan tanaman, bobot rata-rata & CVaR, dan dossier bukti satelit.
- **Koneksi Frontend**: [`src/api/supabase.ts`](file:///E:/Coding/Lomba/Nasa/frontend-nasa/src/api/supabase.ts) dengan fallback cerdas ke data lokal saat offline.

### C. Backend (`backend-nasa/`)
- **FastAPI (Python 3.12, uv)**
- Arsitektur modular per fitur: `app/features/`, `app/core/`, `app/ai/`.
- Menyediakan REST endpoint yang sesuai dengan kontrak OpenAPI.

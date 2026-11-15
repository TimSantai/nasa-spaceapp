# Field Shift — Riset Novelty & Strategi

> **Source**: Riset & strategi.pdf (Space Apps 2026)

<!-- Page 1 -->
Field Shift — Riset Novelty & Strategi (Space Apps 2026)
Ringkasan eksekutif
Tim Pasukan kebal when yah (Local Event Purwokerto) memilih Field Shift: Adapting Farms with NASA
Data, challenge tingkat Intermediate–Advanced yang meminta decision-support tool untuk
membandingkan minimal tiga strategi rotasi tanaman (termasuk rotasi eksisting) memakai observasi
NASA, data tanah lokal, karakteristik tanaman, dan prioritas petani. Hackathon berlangsung 14–15
November 2026; tab Resources resmi baru dibuka 13 November, jadi dokumen ini disusun dari
challenge statement dan literatur, bukan dari resource kit.
Tesis novelty yang aku rekomendasikan: rotasi bukan dinilai dari rata-rata iklim, tetapi dari distribusi
risiko yang dikondisikan pada fase ENSO/IOD musim depan, lalu disajikan sebagai Pareto front yang
bisa dibobot ulang oleh petani. Untuk sawah tadah hujan dan irigasi di Jawa (padi–padi–palawija),
keputusan rotasi paling sensitif terhadap mundurnya awal musim hujan, dan sinyal itu terprediksi
sebagian dari indeks ENSO/IOD beberapa bulan sebelumnya. Kebanyakan DSS rotasi memperlakukan
ketidakpastian iklim secara statis; di sinilah celahnya.
Tiga pembeda konkret: (1) climate-conditioned scenario ensemble berbasis tahun analog ENSO/IOD dari
data harian NASA POWER dan GPM IMERG sejak 2000; (2) penilaian risk-aware (CVaR, bukan hanya
mean) atas output crop model AquaCrop-OSPy per strategi; (3) evidence card per strategi yang
menyatakan sumber data, resolusi, ketidakpastian, dan butir yang wajib dicek penyuluh. Deteksi jendela
lahan bera dengan HLS (opsional NISAR L-band untuk cloud gap) menjadi lapisan observasi lapangan.
Tingkat keyakinan bahwa kombinasi ini belum umum di DSS rotasi publik: [MODERATE]. Aku tidak
menemukan contoh yang menggabungkan ketiganya, tetapi pencarian literatur dalam waktu singkat
tidak bisa membuktikan ketiadaan.
Pembaruan 14 Nov: setelah Resources dirilis
Resources resmi berisi 26 tautan, dan mayoritas adalah data lapangan Amerika Serikat (CDL/CropScape,
SSURGO, Web Soil Survey, PRISM, NAIP, NASS QuickStats, OpenET, NWIS, AMS Market News,
CoCoRaHS), ditambah ESA Sentinel-2 dan ERA5 sebagai data mitra serta FAO GAEZ dan GLDAS yang
global. Artinya juri mengharapkan observasi NASA dipadukan dengan data agronomi lapangan, dan data
lapangan terkaya hanya ada di AS.
Temuan paling penting: USDA menerbitkan Crop Sequence Boundaries (CSB), poligon lahan sintetis
yang menyimpan riwayat rotasi 8 tahun per petak dari CDL. CDL sendiri mencakup seluruh AS daratan
sejak 2008, beresolusi 30 m sampai 2023 dan 10 m mulai 2024 (NASS). Akurasi kelas tanaman utama
umumnya 85–95%. Dengan ini, rotasi yang benar-benar terjadi bisa diamati, bukan hanya disimulasikan.
Revisi tesis. Novelty bergeser dari "simulasi crop model" ke "bukti observasional rotasi":
1. Observed rotation evidence (baru, inti). Untuk tiap transisi tanaman di CSB, ukur hasil musim
berikutnya dari satelit (ET dari OpenET/ECOSTRESS, stres dari ESI, NDVI dari HLS/Sentinel-2), lalu
bandingkan petak yang mirip tanah (SSURGO), lereng (SRTM), dan iklim (PRISM/POWER) tetapi

<!-- Page 2 -->
berbeda rotasi. Ini matched comparison observasional: hasilnya asosiasi, bukan kausal, dan
harus dilabeli begitu.
2. Climate-state-conditioned ensemble (dipertahankan, digeneralisasi). Kondisi iklim musim
depan tidak hanya ENSO; untuk AS barat dipakai juga persentil kelembapan tanah
(SMAP/GLDAS) dan tren air tanah (GRACE-FO).
3. Risk-aware scoring + Pareto + bobot petani (dipertahankan).
4. Data-availability-aware confidence (baru). Tool yang sama dijalankan di Banyumas dengan
pengganti global (HLS/Sentinel-2, IMERG/ERA5, GLDAS, SoilGrids, GAEZ). Karena tidak ada
CDL/CSB, bukti rotasi observasional kosong dan tingkat keyakinan otomatis turun. Ini menjawab
langsung permintaan challenge untuk menunjukkan celah informasi.
Perbandingan pendekatan yang diminta statement menjadi tiga: (a) matched comparison
observasional, (b) model ML yang memprediksi stres musim depan dari riwayat tanaman, iklim, dan
tanah, (c) AquaCrop sebagai opsional untuk tanaman yang belum pernah ditanam di wilayah itu. GAEZ
v4 (51 tanaman, rain-fed dan irigasi) dipakai sebagai prior kesesuaian (FAO).
Keputusan yang harus diambil tim sekarang:
Opsi Kelebihan Kekurangan
A. AS saja (wilayah barat, mis. Semua resource tersedia; Kurang relevan untuk juri lokal
lembah irigasi Nevada/California) validitas tertinggi Purwokerto
B. Banyumas saja Relevansi lokal kuat Tidak ada data rotasi lapangan;
banyak resource resmi tidak
terpakai
C. AS sebagai pilot tervalidasi + Validity dan relevansi lokal Beban data hampir dua kali;
Banyumas sebagai demo transfer sekaligus; novelty #4 hanya Banyumas harus versi ringan
(rekomendasi) mungkin di sini
Rekomendasiku C: AS mendapat pipeline penuh, Banyumas cukup halaman transfer (iklim, kalender
tanam NDVI, kesesuaian GAEZ, dan panel "data yang tidak tersedia"). Keyakinan [MODERATE]; jika tim
hanya punya kapasitas satu wilayah, pilih A.
Dampak ke peran: A3 memegang CSB/CDL + HLS/Sentinel-2; A2 memegang PRISM, POWER, IMERG,
GLDAS, SMAP, OpenET, dan SSURGO; A4 memegang matched comparison, model ML, dan skoring;
AquaCrop turun menjadi opsional. Bagian 3–7 di bawah adalah versi sebelum Resources rilis dan
sebagian sudah usang.
Pembacaan kritis challenge
Yang benar-benar diminta adalah alat bantu eksplorasi, bukan rekomendasi otomatis. Statement
menegaskan tool harus mendukung, bukan menggantikan, penilaian petani dan pakar lokal.
Konsekuensinya, juri akan menghargai transparansi alasan dan ketidakpastian lebih dari akurasi prediksi
yang diklaim tinggi.
Deliverable eksplisit per strategi (minimal tiga, termasuk rotasi eksisting): mengapa disarankan, bukti
pendukung, manfaat, celah informasi, dan risiko yang perlu ditinjau lokal. Ini format yang hampir siap

<!-- Page 3 -->
jadi spesifikasi UI. Tim yang hanya menampilkan peta NDVI dan grafik curah hujan tanpa perbandingan
strategi akan gagal di kriteria Relevance.
Dataset yang disebut: SMAP, ECOSTRESS, GPM, Landsat, MODIS, NASA POWER, GRACE/GRACE-FO,
SRTM, plus GEDI di bagian harmonisasi. Daftar ini adalah undangan, bukan kewajiban. Memaksakan
semuanya justru berisiko melanggar Validity, karena beberapa resolusinya tidak cocok untuk skala petak
(lihat bagian berikutnya).
Premis yang perlu ditantang: frasa "strengthen soil health" menyiratkan tool bisa mengukur kesehatan
tanah. Satelit tidak mengukur bahan organik tanah atau fiksasi nitrogen secara langsung pada skala
musim. Klaim soil health harus berasal dari koefisien agronomis literatur (mis. kontribusi N legum),
diberi label sebagai estimasi, bukan observasi.
Kriteria penilaian Space Apps yang berlaku di tahun-tahun sebelumnya: Influence/Impact, Creativity,
Validity, Relevance, dan Presentation, dengan bobot setara. Aku belum melihat panduan judging 2026
secara langsung, jadi periksa ulang setelah 13 November. Implikasi praktis: novelty harus terasa di demo
(Creativity), tapi setiap angka harus bisa dibela sumbernya (Validity).
Inventaris dataset dan batas skala
Hanya dua sumber yang benar-benar beresolusi petak (HLS 30 m dan ECOSTRESS 70 m); sisanya harus
diposisikan sebagai konteks wilayah. Sawah petani di Banyumas umumnya jauh lebih kecil dari satu
piksel SMAP atau NASA POWER, jadi menampilkan nilai SMAP sebagai "kelembapan tanah sawah Anda"
adalah klaim yang tidak valid.
Dataset Resolusi spasial Peran dalam tool Catatan validitas
/ temporal
HLS (Landsat 8/9 + 30 m / 2–3 hari NDVI/EVI time series, Awan tropis membuat banyak
Sentinel-2) deteksi fase tanam dan gap; perlu gap-filling
lahan bera
ECOSTRESS ESI 70 m / tidak Indeks stres air tanaman Nilai bergantung jam overpass;
(ECO_L4G_ESI v2) teratur (orbit (ET aktual/potensial) jangan bandingkan pagi vs sore
ISS, 52°N–52°S) mentah
SMAP L4 9 km / 3 jam, Anomali kelembapan ubRMSE target 0,04 m³/m³;
(SPL4SMGP) latensi ~2,5 hari tanah permukaan dan root skala kawasan, bukan petak
zone
GPM IMERG V07 0,1° (~11 km) / Curah hujan historis, onset Final Run latensi ~3,5 bulan;
30 menit, sejak musim, ekstrem pakai Late Run untuk musim
2000 berjalan
NASA POWER (AG) 0,5° / harian, Suhu min/max, radiasi, Grid kasar; cukup untuk iklim
sejak 1981 RH, angin → input crop kabupaten
model dan ET0

<!-- Page 4 -->
Dataset Resolusi spasial Peran dalam tool Catatan validitas
/ temporal
GRACE/GRACE-FO beberapa ratus Tren cadangan air regional Hanya narasi konteks; tidak
km / bulanan boleh masuk skor petak
SoilGrids 250 m 250 m / statis Tekstur, SOC, pH, CEC per Akurasi lebih rendah di tropis;
v2.0 (ISRIC, non- kedalaman → parameter sertakan peta P5–P95
NASA) tanah crop model
NISAR L-band SAR, rilis publik Opsional: deteksi Arsip baru mulai 17 Juni 2026,
(provisional) sejak 20 Juli genangan/bera saat jadi tidak ada histori multi-
2026 tertutup awan tahun
SRTM 30 m / statis Lereng → risiko erosi Tidak dicek ulang di sesi ini,
tapi spesifikasinya stabil
Rekomendasi grid analisis: petak/kelurahan dianalisis pada 30 m untuk observasi vegetasi, sementara
variabel iklim dan tanah ditarik dari piksel induknya tanpa interpolasi palsu. Harmonisasi yang diminta
challenge (resampling ke grid umum) sebaiknya dilakukan sebagai agregasi zonal per poligon desa,
bukan downscaling, karena downscaling SMAP atau GRACE dalam 48 jam tidak bisa divalidasi.
NISAR menarik secara naratif karena L-band menembus awan, tetapi histori yang tersedia baru sekitar
lima bulan dan statusnya masih provisional. Pakai hanya jika sempat, sebagai bukti kondisi musim
berjalan.
State of the art dan gap
Literatur rotasi sudah bergerak dari heuristik ke optimasi multi-objektif dan AI, tetapi penanganan
ketidakpastian iklim yang dinamis masih disebut sebagai kelemahan utama. Itu celah yang paling bisa
dieksploitasi dalam 48 jam.
Arah riset Contoh Apa yang sudah ada Apa yang masih kurang
Review Dury et al., 2012, Agron. Review >120 model; Mayoritas statis, satu kriteria
model rotasi Sustain. Dev. 32:567– rotasi sebagai keputusan moneter; probabilitas risiko
580 temporal dibuat tetap
Kerangka Dong & Liu, 2026, Adv. Integrasi RS, IoT, process Menyebut integrasi data
data– Resour. Res. 6(4):3489– model, RL, MOO heterogen, kuantifikasi
model– 3523 ketidakpastian, dan
keputusan operasionalisasi sebagai
tantangan terbuka
MOEA untuk Marko et al. (Zenodo) NSGA-III, 7 objektif Basis data pertanian Eropa;
konfigurasi termasuk risiko harga tidak memakai observasi iklim
tanam dan hasil musiman
MILP multi- Multi-objective models Optimal global; trade-off Deterministik

<!-- Page 5 -->
Arah riset Contoh Apa yang sudah ada Apa yang masih kurang
objektif for crop rotation pendapatan vs diversitas
planning
Pre-crop Fenz et al., 2023, Eur. J. Matriks efek tanaman Butuh peta jenis tanaman per
value dari Agron. 150:126949 sebelumnya dari petak (ada di Austria, belum
NDVI Sentinel-2 + clustering, tersedia terbuka di Jawa)
24.352 rotasi
Agen LLM GeoLLM-Squad, Orkestrasi tool RS + Fokus workflow, bukan
geospasial arXiv:2501.16254; simulasi validitas rekomendasi rotasi
AgriWorld/Agro-
Reflective,
arXiv:2602.15325
Crop model AquaCrop-OSPy, Kelly & Python, ringan, bisa jalan Tidak memodelkan fiksasi N
terbuka Foster 2021, Agric. di Colab, mendukung atau dinamika SOC
Water Manag. analisis iklim
254:106976
Konteks Indonesia memperkuat argumen. El Niño dapat menunda onset monsun hingga sekitar dua
bulan, dan korelasi antara keterlambatan onset dengan hujan September–Desember di Jawa
Barat/Tengah dilaporkan −0,94 (Naylor et al., PNAS, PMC1876519). Menambahkan indeks SST Samudra
Hindia ke Niño-3.4 meningkatkan model kekeringan Jawa (D'Arrigo & Wilson, 2008). Kalender tanam
bergeser 2–6 dasarian di wilayah monsunal akibat ENSO/IOD (Koesmaryono & Apriyana, IPB).
Dari sisi agronomi, rotasi padi–padi–legum dan padi–legum–legum memang praktik umum, dan
ketepatan waktu tanam setelah padi adalah faktor paling penting untuk legum musim kemarau
(Kirchhof et al., 2000, Soil Tillage Res. 56:51–66). Artinya, jendela bera yang terdeteksi satelit dan
perkiraan awal kemarau langsung relevan untuk keputusan palawija.
Gap yang diambil: belum ada DSS rotasi terbuka yang (a) mengondisikan evaluasi strategi pada fase
ENSO/IOD musim depan, (b) melaporkan risiko ekor dari ansambel simulasi, dan (c) memberi bukti per
strategi dengan provenance data NASA yang eksplisit. [MODERATE]
Usulan novelty dan formulasi
Inti usulan: setiap strategi rotasi dievaluasi sebagai distribusi hasil di bawah tahun-tahun analog yang
sefase iklim dengan musim depan, lalu diperingkat dengan bobot petani dan ukuran risiko ekor. Nama
kerja: FieldShift-ENSO (ganti sesuai branding tim).
N1. Climate-conditioned scenario ensemble. Ambil tahun 2001–2025 dari IMERG + NASA POWER,
kelompokkan menurut fase ENSO (Niño-3.4/ONI) dan IOD (DMI) pada Agustus–Oktober. Untuk musim
depan, ansambel skenario Ω hanya berisi tahun dengan fase yang sama dengan prakiraan resmi saat ini.
Ini mengganti "iklim rata-rata" dengan "iklim yang mungkin terjadi tahun ini".
N2. Risk-aware multi-objective scoring. Untuk strategi s dan skenario ω, AquaCrop-OSPy menghasilkan
hasil panen dan kebutuhan air per musim. Objektif soil health (input N dari legum, penutupan lahan,

<!-- Page 6 -->
risiko erosi dari lereng SRTM) dihitung dari koefisien literatur, diberi label estimasi. Skor tiap objektif
memakai CVaR pada α = 0,2 (rata-rata 20% skenario terburuk) di samping mean.
J_k(s) = (1-\lambda)\,\mathbb{E}_{\omega\in\Omega_\phi}[f_k(s,\omega)] +
\lambda\,\mathrm{CVaR}_{\alpha}[f_k(s,\omega)]
\text{Score}(s) = \sum_{k} w_k\,\tilde{J}_k(s), \quad \sum_k w_k = 1, \quad s \in
\mathcal{P}(\mathcal{S})
Di sini Ω_φ adalah tahun analog fase φ, λ ∈ [0,1] adalah tingkat kehati-hatian yang dipilih petani lewat
slider, J ̃adalah skor ternormalisasi, w_k bobot prioritas petani (air, pendapatan, tanah, tenaga kerja),
dan 𝒫(𝒮) himpunan strategi non-dominated. Strategi yang didominasi tetap ditampilkan tetapi diberi
tanda, supaya petani melihat alasan penolakannya.
N3. Observed fallow & stress windows. Time series NDVI HLS yang diisi gap-nya (mis. Whittaker
smoother) dipakai untuk mendeteksi tanggal tanam, panen, dan periode bera per desa; ESI ECOSTRESS
menandai musim dengan stres air berulang. Hasilnya menjadi bukti historis, bukan input crop model.
N4. Evidence card dengan provenance. Setiap strategi menampilkan lima isian yang diminta challenge
(alasan, bukti, manfaat, celah informasi, risiko), ditambah tabel sumber data, resolusi, dan tingkat
keyakinan. Jika LLM dipakai, ia hanya merangkai kalimat dari angka yang sudah dihitung; ia tidak boleh
menghasilkan angka baru.
Sanity check formulasi: λ = 0 mereduksi ke optimasi rata-rata klasik; λ = 1 menjadi maximin-like yang
sangat konservatif; jika Ω_φ hanya berisi 3–5 tahun, CVaR pada α = 0,2 secara efektif adalah satu tahun
terburuk, sehingga UI wajib menampilkan jumlah tahun analog. Kelemahan terbesar adalah ukuran
sampel itu sendiri: 25 tahun dibagi beberapa fase menghasilkan ansambel kecil. Mitigasinya adalah
bootstrap atau memakai fase ENSO saja ketika sampel ENSO×IOD terlalu sedikit.
Arsitektur dan metodologi
Sistem terdiri dari lima lapis; semua komputasi berat dilakukan offline dan disajikan sebagai JSON statis,
sehingga demo tidak bergantung pada API NASA saat penjurian.

<!-- Page 7 -->
arsitektur FieldShift-ENSO · 5 lapis
Kalender tanam dari NDVI tidak masuk crop model; ia menjadi bukti historis di evidence card dan dipakai
untuk menetapkan tanggal tanam realistis per desa. SMAP dan GRACE-FO hanya muncul sebagai lapisan
konteks wilayah di peta.
Metodologi inti, berurutan: (1) bangun poligon desa dan ambil seri iklim 2001–2025; (2) label tiap tahun
dengan fase ENSO/IOD Agustus–Oktober; (3) jalankan AquaCrop-OSPy untuk tiap strategi × tahun
dengan tanggal tanam dari kalender NDVI; (4) hitung mean dan CVaR per objektif pada subset tahun
sefase; (5) normalisasi, bobot, dan saring Pareto; (6) render evidence card dengan provenance dan label
keyakinan. Kompleksitas waktu kira-kira O(|S| · |Ω| · n_desa) simulasi; untuk 3 strategi, 25 tahun, 5
desa itu hanya 375 run AquaCrop, layak di laptop.
Rencana eksekusi
Kerjakan semua pengambilan data yang berat sebelum 14 November; selama 48 jam hackathon tim
hanya merangkai, memvalidasi, dan memoles. Data NASA tidak dilarang disiapkan lebih dulu, tetapi cek
aturan kode baru pada resource kit 13 November.
Wilayah demo yang disarankan: satu kabupaten (Banyumas) dengan 3–5 desa sawah sebagai poligon.
Rotasi pembanding: padi–padi–bera (baseline), padi–padi–kacang hijau, dan padi–kedelai–jagung.

<!-- Page 8 -->
Ketiganya didukung praktik lapangan di Jawa, tetapi daftar finalnya harus dikonfirmasi ke penyuluh atau
dosen agronomi.
Waktu Pekerjaan PIC
8–10 Nov Sepakati kontrak data JSON (skema A1, A4, A6
output model → frontend) dan daftar
desa demo
8–12 Nov Tarik NASA POWER, IMERG, SMAP A2
2001–2025 per desa; label tahun
ENSO/IOD
8–12 Nov Prototipe pipeline HLS NDVI di 1 desa; A3
cek ketersediaan ECOSTRESS
8–12 Nov Uji AquaCrop-OSPy untuk padi, kedelai, A4
jagung, kacang hijau; siapkan koefisien
soil health
8–12 Nov Wireframe evidence card, Pareto chart, A5
slider; uji ke 1–2 petani atau penyuluh
8–12 Nov Scaffold React + peta + data dummy A6
sesuai kontrak JSON
13 Nov Baca resource kit resmi; sesuaikan Semua, dipimpin A1
dataset dan aturan
14 Nov, jam 0–12 Kalender tanam/bera semua desa; A3, A4 (A2 membantu A4)
simulasi ansambel penuh
14 Nov, jam 0–16 Peta, panel strategi, evidence card A6, A5
dengan data dummy
14–15 Nov, jam 12–30 Integrasi skor CVaR + Pareto ke UI; teks A4, A6, A1
evidence card
15 Nov, jam 30–40 Validasi silang HLS vs Katam dan A1, A3
simulasi vs BPS
15 Nov, jam 40–48 Video demo, project page, repo publik A5, A1, A6
Stack minimal yang realistis: Python (xarray, rioxarray, earthaccess, aquacrop) untuk pra-komputasi ke
JSON statis, dan frontend React + MapLibre/Leaflet + chart library. Hindari backend live; hasil pra-
komputasi cukup untuk demo dan mengurangi risiko gagal saat penjurian.

<!-- Page 9 -->
Pembagian 6 anggota
Enam orang dibagi menjadi tiga pasang yang saling bergantung: data (A2–A3), model (A1–A4), dan
produk (A5–A6). Isi nama sesuai skill masing-masing; jalur kritisnya A2 → A4 → A6, jadi orang terkuat di
Python taruh di A4.
Kode Lingkup Peran Tanggung jawab utama Output Nama
A1 Lintas lapis Lead + Spesifikasi formula skor (mean, docs/scoring.
Decision CVaR, Pareto, normalisasi), test md,
Science vector skor, validasi silang, narasi docs/validatio
juri n.md, project
page
A2 Data + Data & Ingestion NASA climate.parqu
Backend Backend POWER/IMERG/SMAP/ONI/DMI, et, scores.json,
Engineer harmonisasi zonal, export JSON CI hijau
sesuai kontrak, CI, manifest data,
FastAPI opsional
A3 Data GIS / HLS NDVI + gap-filling, kalender calendar.json,
(geospasial) Remote tanam/bera, ESI ECOSTRESS, layer peta
Sensing lereng SRTM
Analyst
A4 AI / Modeling AI/ML Runner AquaCrop-OSPy (ansambel model outputs
Engineer strategi × tahun), baseline ML per run,
prediksi stres, kuantifikasi metrik
ketidakpastian; penjelasan LLM baseline
opsional dan grounded
A5 Frontend UI/UX + Wireframe, evidence card, Pareto Figma, video
(desain) Presentasi chart, uji pengguna, video demo
A6 Frontend Frontend React + MapLibre, implementasi URL demo live
(kode) Engineer skor di browser (lulus test vector
A1), deploy statis
Aturan kerja yang menghindari macet: kontrak JSON dikunci paling lambat 10 November supaya A6
tidak menunggu A4; A6 membangun dengan data dummy dulu. Kalau simulasi AquaCrop terlambat, A1
mengambil alih skoring sederhana (water balance dari POWER + IMERG) sebagai fallback, dan A4 fokus
menyelesaikan strategi baseline.
Risiko, validasi, dan yang harus diverifikasi
Risiko terbesar bukan teknis, melainkan klaim yang melampaui data. Juri dari NASA atau mitra badan
antariksa akan cepat mengenali angka soil health yang dikarang atau nilai SMAP yang diperlakukan
sebagai data petak.

<!-- Page 10 -->
Risiko Dampak Mitigasi
Sampel tahun analog kecil CVaR tidak stabil Tampilkan n tahun; bootstrap; jatuh
(25 tahun dibagi fase) ke fase ENSO saja bila n < 5
AquaCrop belum dikalibrasi Hasil panen absolut bias Laporkan relatif terhadap baseline,
untuk varietas lokal bukan ton/ha absolut
Awan menutupi HLS saat Tanggal tanam meleset Gap-filling; agregasi per desa; NISAR
musim hujan jika sempat
Soil health tidak teramati Klaim tidak valid Label estimasi literatur; tandai "perlu
satelit uji tanah"
Fase ENSO/IOD musim Ansambel salah kondisi Tampilkan juga hasil semua tahun
depan salah diprakirakan sebagai pembanding
Harga dan pasar tidak ada di Objektif pendapatan lemah Input manual harga oleh pengguna;
data NASA nyatakan sebagai asumsi
Validasi minimum yang bisa dikerjakan dalam 48 jam: bandingkan kalender tanam turunan HLS dengan
kalender tanam resmi Kementan (Katam) untuk desa yang sama; bandingkan rasio hasil antar tahun El
Niño dan normal dengan statistik produksi kabupaten BPS. Keduanya adalah uji arah, bukan validasi
akurasi.
Hal yang belum aku verifikasi dan harus dicek tim: isi resource kit 13 November; ketersediaan parameter
crop padi sawah dan kedelai di AquaCrop-OSPy versi terbaru; detail judging 2026; aturan apakah data
non-NASA (SoilGrids, BPS) boleh dipakai sebagai pelengkap. Tingkat keyakinan keseluruhan pada
rancangan ini: sekitar 75%, terutama karena resource kit belum keluar.
Referensi
1. NASA Space Apps Challenge. (2026). Field Shift: Adapting Farms with NASA Data [Challenge
statement]. https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-
data/
2. Dury, J., Schaller, N., Garcia, F., Reynaud, A., & Bergez, J. E. (2012). Models to support cropping
plan and crop rotation decisions: A review. Agronomy for Sustainable Development, 32(2), 567–
580. https://doi.org/10.1007/s13593-011-0037-x
3. Dong, L., & Liu, Y. (2026). Intelligent optimization of crop rotation systems: A data–model–
decision framework. Advances in Resources Research, 6(4), 3489–3523.
https://www.jstage.jst.go.jp/article/arr/6/4/6_3489/_article
4. Fenz, S., Neubauer, T., Heurix, J., Friedel, J. K., & Wohlmuth, M.-L. (2023). AI- and data-driven
pre-crop values and crop rotation matrices. European Journal of Agronomy, 150, 126949.
https://doi.org/10.1016/j.eja.2023.126949
5. Kelly, T. D., & Foster, T. (2021). AquaCrop-OSPy: Bridging the gap between research and practice
in crop-water modelling. Agricultural Water Management, 254, 106976.
https://doi.org/10.1016/j.agwat.2021.106976

<!-- Page 11 -->
6. Naylor, R. L., et al. (2007). Assessing risks of climate variability and climate change for
Indonesian rice agriculture. PNAS. https://pmc.ncbi.nlm.nih.gov/articles/PMC1876519
7. D'Arrigo, R., & Wilson, R. (2008). El Niño and Indian Ocean influences on Indonesian drought.
International Journal of Climatology. https://www.st-
andrews.ac.uk/~rjsw/all%20pdfs/DArrigoandWilson2008.pdf
8. Kirchhof, G., et al. (2000). Growth and yield response of grain legumes to different soil
management practices after rainfed lowland rice. Soil and Tillage Research, 56(1–2), 51–66.
9. Reichle, R., et al. (2017). SMAP Level 4 surface and root zone soil moisture. IGARSS 2016
Proceedings. https://ntrs.nasa.gov/citations/20170007932
10. Goffin, B. D., et al. (2024). At which overpass time do ECOSTRESS observations best align with
crop health and water rights? Remote Sensing, 16(17), 3174.
https://doi.org/10.3390/rs16173174
11. Kvas, A., et al. (2024). Evaluating long-term water storage trends in small catchments and
aquifers from a joint inversion of 20 years of GRACE/GRACE-FO data. Geophysical Journal
International, 236(2), 1002–1012. https://doi.org/10.1093/gji/ggad468
12. Poggio, L., et al. (2021). SoilGrids 2.0. SOIL, 7, 217–240. https://doi.org/10.5194/soil-7-217-2021
13. ASF DAAC. (2026). NISAR data availability overview. https://hyp3-docs.asf.alaska.edu/nisar-
docs/availability-overview/
Catatan: Marko et al. (crop configuration, NSGA-III) dan dua preprint agen LLM di bagian state of the art
dibaca dari abstrak/naskah publik; status peer-review keduanya belum dicek. Penulis pertama SoilGrids
2.0 (Poggio) berasal dari pengetahuan, bukan dari halaman yang dibuka di sesi ini.
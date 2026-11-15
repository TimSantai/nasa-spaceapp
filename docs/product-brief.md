# Field Shift — Product Brief

> **Source**: Product Brief.pdf (Space Apps 2026)

<!-- Page 1 -->
Field Shift — Product Brief
Field Shift adalah web decision-support yang membantu petani membandingkan minimal tiga pilihan
rotasi tanaman, termasuk rotasi yang sedang mereka pakai. Tiap pilihan diberi bukti dari data satelit
NASA dan data lapangan, dinilai sesuai risiko iklim musim depan, dan diberi tahu terus terang di mana
datanya belum cukup.
Tool ini tidak memberi satu jawaban "tanam ini". Ia menampilkan trade-off (air, hasil, kesehatan tanah,
risiko tahun buruk) supaya petani dan penyuluh bisa memutuskan sendiri. Itu sesuai pesan challenge
Field Shift: Adapting Farms with NASA Data: tool mendukung, bukan menggantikan, penilaian petani
dan ahli lokal.
Kalimat pitch: "Field Shift membantu petani memilih rotasi tanaman dengan bukti dari satelit NASA dan
rotasi nyata di lahan serupa, dinilai sesuai risiko iklim musim depan, dan jujur soal di mana datanya
belum cukup."
Tab ini adalah ringkasan produk untuk tim. Riset lengkap, sumber literatur, dan alasan setiap keputusan
ada di tab Riset & strategi.
Masalah dan pengguna
Petani yang ingin mengubah rotasi tanaman menghadapi ketidakpastian yang saling bertabrakan:
tanaman yang memperbaiki tanah bisa terlalu boros air, tidak cocok dengan musim, berisiko gagal di
tahun kering, atau tidak punya pasar. Data iklim dan satelit tersedia gratis, tetapi tersebar di puluhan
portal, beresolusi berbeda-beda, dan tidak berbentuk jawaban yang bisa dipakai petani.
Pengguna Kebutuhan utama Yang mereka lihat di Field Shift
Petani (utama) "Kalau saya ganti tanaman, apa Peta lahan, 3+ kartu strategi, skor sesuai
untung-ruginya, dan seberapa buruk prioritasnya, bahasa sederhana
di tahun jelek?"
Penyuluh / Bukti dan asumsi yang bisa diperiksa Evidence card lengkap, sumber data, tingkat
agronom sebelum memberi saran keyakinan, daftar hal yang wajib dicek
(pendamping) lapangan
Juri Space Apps Pemakaian data NASA yang valid, Alur demo, provenance data, perbandingan
kreatif, dan relevan dengan pendekatan, transparansi ketidakpastian
challenge
Wilayah: pilot penuh di AS bagian barat (data lapangan USDA lengkap) dan demo transfer ke Banyumas,
Indonesia. Keputusan final wilayah masih terbuka; lihat bagian terakhir.
Apa yang bisa dilakukan pengguna
Alur utama demo, dari membuka aplikasi sampai mendapat perbandingan strategi:

<!-- Page 2 -->
1. Pilih lahan atau desa di peta. Pengguna memilih poligon lahan (pilot AS: batas petak dari Crop
Sequence Boundaries) atau desa (Banyumas).
2. Lihat profil kondisi lahan. Iklim 20+ tahun (hujan, suhu, panas ekstrem, risiko embun beku),
kelembapan tanah, lereng dan risiko erosi, kapan lahan biasanya kosong (bera), dan musim di
mana tanaman sekarang paling rentan stres.
3. Isi prioritas dan kendala. Slider bobot: hemat air, hasil panen, kesehatan tanah, tutupan lahan,
tenaga kerja. Kendala: ketersediaan air irigasi, alat, preferensi pasar. Semua opsional dengan
nilai default.
4. Pilih kondisi musim depan. Fase iklim (mis. El Niño, normal, La Niña, atau kondisi kekeringan)
diambil otomatis dari prakiraan resmi, tetapi bisa diganti untuk skenario "bagaimana kalau".
5. Bandingkan strategi. Minimal tiga strategi tampil berdampingan: rotasi sekarang (baseline) dan
dua atau lebih alternatif. Tiap strategi punya skor rata-rata dan skor tahun terburuk; strategi
yang kalah di semua aspek tetap tampil dengan tanda.
6. Baca evidence card. Untuk tiap strategi: kenapa disarankan, bukti datanya, manfaat, celah
informasi, dan risiko yang wajib dicek penyuluh atau petani.
7. Atur tingkat kehati-hatian. Slider "hati-hati" menggeser penilaian dari rata-rata ke tahun
terburuk; urutan strategi berubah langsung.
8. Simpan atau cetak ringkasan untuk dibawa ke diskusi dengan penyuluh.
Fitur
MVP adalah yang harus jalan di demo 15 November; lanjutan dikerjakan hanya jika MVP selesai. Kolom
pemilik mengikuti pembagian A1–A6 di tab Riset & strategi.
ID Fitur Isi Prioritas Pemilik
F1 Peta lahan Peta interaktif, pilih petak/desa, layer MVP A6, A3
lereng dan stres air
F2 Profil kondisi Grafik iklim historis, kelembapan tanah, MVP A2, A3, A5
lahan kalender tanam dan periode bera dari
NDVI, musim rentan
F3 Prioritas dan Slider bobot 5 tujuan, input MVP A5, A6
kendala petani air/alat/pasar, nilai default
F4 Perbandingan ≥ Baseline + alternatif, ditampilkan MVP A4, A6
3 strategi berdampingan
F5 Skor berbasis Rata-rata dan tahun terburuk (CVaR), MVP A1, A4
risiko slider kehati-hatian, tanda strategi yang
didominasi (Pareto)
F6 Kondisi iklim Pilih fase iklim; strategi dinilai dengan MVP A2, A4
musim depan tahun-tahun lampau yang serupa
F7 Evidence card Alasan, bukti, manfaat, celah informasi, MVP A1, A4, A5

<!-- Page 3 -->
ID Fitur Isi Prioritas Pemilik
risiko untuk dicek lokal
F8 Tingkat Tinggi/sedang/rendah plus alasannya; MVP A1
keyakinan turun otomatis bila data lapangan
kurang
F9 Glosarium Penjelasan singkat ET, NDVI, anomali MVP A5
kelembapan tanah, risiko embun beku,
neraca air; beda data satelit vs
lapangan
F10 Bukti rotasi Untuk transisi tanaman di petak serupa MVP (pilot AS) A3, A4
nyata (CSB), apa yang terjadi musim
berikutnya: ET, stres, NDVI
F11 Mode transfer Alur yang sama dengan data global; Lanjutan A2, A3
Banyumas menampilkan data yang tidak tersedia
F12 Peta Zona risiko erosi, hotspot stres air, area Lanjutan A3, A6
kerentanan rawan embun beku
F13 Slider skenario Ubah curah hujan/suhu (mis. −20% Lanjutan A4, A6
hujan) dan lihat skor berubah
F14 Ekspor PDF/print satu halaman per lahan Lanjutan A6
ringkasan
F15 Bahasa ID/EN Antarmuka dua bahasa Lanjutan A5, A6
Lima tujuan yang dinilai di F5: hasil panen relatif, kebutuhan air irigasi, hari stres air, estimasi kesehatan
tanah, dan hari tanah terbuka (bera). Harga pasar hanya dinilai jika data harga lokal tersedia (pilot AS:
USDA AMS).
Cara kerja dan pembeda
Semua perhitungan berat dijalankan offline oleh pipeline Python, lalu hasilnya disajikan oleh backend
FastAPI ke frontend React. Urutannya:
1. Kumpulkan dan selaraskan data. Data iklim, satelit, tanah, dan rotasi diunduh untuk wilayah
studi saja, lalu dirata-rata per petak/desa (tanpa downscaling palsu).
2. Baca kondisi lahan. Dari NDVI dihitung tanggal tanam, panen, dan periode bera; dari ESI/ET
dihitung musim stres; dari SRTM dihitung lereng.
3. Kelompokkan tahun. Setiap tahun lampau diberi label kondisi iklim (fase ENSO/IOD untuk
Indonesia; kondisi kekeringan dari kelembapan tanah dan air tanah untuk AS barat).
4. Nilai tiap strategi di tahun-tahun yang serupa dengan tiga pendekatan yang dibandingkan: (a)
bukti observasional dari petak lain yang pernah memakai rotasi itu, (b) model ML yang

<!-- Page 4 -->
memprediksi stres musim berikutnya, (c) model neraca air/crop model untuk tanaman yang
belum pernah ditanam di wilayah itu.
5. Hitung skor per tujuan: rata-rata dan rata-rata tahun terburuk (CVaR), digabung dengan bobot
petani, lalu cari strategi yang tidak terkalahkan (Pareto).
6. Susun evidence card dan tingkat keyakinan langsung dari angka dan ketersediaan data. Tidak
ada teks yang dikarang bebas; jika memakai LLM, LLM hanya merangkai kalimat dari angka yang
sudah dihitung.
Diagram arsitektur lengkap ada di tab Riset & strategi.
Empat pembeda dibanding tool sejenis:
1. Bukti dari rotasi yang benar-benar terjadi, bukan hanya simulasi. Data CSB menyimpan riwayat
rotasi 8 tahun per petak di AS.
2. Dinilai sesuai kondisi iklim musim depan, bukan iklim rata-rata.
3. Risiko tahun terburuk dihitung eksplisit dan petani mengatur sendiri seberapa hati-hati
penilaiannya.
4. Keyakinan ikut turun saat data kurang. Di wilayah tanpa data lapangan (Banyumas), tool
menunjukkan apa yang tidak diketahui alih-alih berpura-pura yakin.
Stack: FastAPI (Python 3.12, uv) di backend-nasa, React + Vite di frontend-nasa, PostGIS dan Redis
opsional lewat Docker Compose. Format response API dan aturan kode mengikuti ECC (AGENTS.md,
docs/adr/).
Data yang dibutuhkan
Yang diunduh hanya potongan untuk wilayah studi dan periode 2015–2025 (iklim sejak 2001), bukan
arsip penuh. Script unduhnya ada di fieldshift-data-kit.zip; jalankan dry run dulu untuk melihat
ukuran. Nama produk yang ditandai “cek” belum diverifikasi; pastikan dulu di Earthdata Search.
Data Produk Resolusi Dipakai untuk Wilayah Pemilik
Cuaca harian NASA POWER (AG): 0,5°, harian, F2, F6, input AS + ID A2
suhu min/max, hujan, sejak 1981 model air (ET0)
radiasi, RH, angin
Curah hujan GPM IMERG Final Daily 0,1° (~11 F2, F6, onset AS + ID A2
V07 km), harian, musim, hujan
sejak 2000 ekstrem
Kelembapan SMAP L4 (SPL4SMGP) 9 km / 0,25° F2, F6, kondisi AS + ID A2
tanah lewat AppEEARS; kering
GLDAS Noah monthly
0,25°
Air tanah GRACE-FO; sumur USGS ratusan km; F2 (konteks), F6 AS A2
NWIS titik sumur (AS barat)

<!-- Page 5 -->
Data Produk Resolusi Dipakai untuk Wilayah Pemilik
Vegetasi / HLS L30 + S30 v2.0 30 m, 2–3 F2 kalender AS + ID A3
NDVI (Landsat + Sentinel-2) hari tanam dan bera,
F10
Stres air / ET ECOSTRESS ESI v002; 70 m; per F2, F10, validasi AS + ID A3
OpenET (AS barat) petak model air (OpenET:
AS)
Lereng SRTM 1 arc-second 30 m F1, F12 risiko AS + ID A3
(SRTMGL1, cek versi) erosi
Jenis tanaman USDA CDL; Crop 30 m (10 m F1, F4, F10 AS A3
dan riwayat Sequence Boundaries sejak 2024);
rotasi poligon
petak, 8
tahun
Tanah SSURGO (AS); SoilGrids petak F2, parameter AS / ID A2
250 m (ID) survei; 250 model air, F8
m
Iklim lokal PRISM 4 km, harian Validasi dan AS A2
presisi konteks (AS)
Iklim ERA5 ~0,25°, per F11 Banyumas ID A2
pengganti jam
Kesesuaian FAO GAEZ v4 ~9 km Prior untuk AS + ID A4
tanaman tanaman baru
(F4)
Statistik USDA NASS QuickStats kabupaten, Kalibrasi dan AS A2
panen tahunan validasi
Harga pasar USDA AMS Market regional Tujuan AS A1
News pendapatan
(opsional)
Indeks iklim ONI (ENSO) dan DMI bulanan F6 label tahun AS + ID A2
(IOD) dari NOAA
Akun yang perlu dibuat sekarang: NASA Earthdata (wajib), NASS QuickStats API key, Copernicus CDS
(untuk ERA5), dan OpenET. Semuanya gratis. Kredensial disimpan di .env, tidak pernah di-commit.

<!-- Page 6 -->
Link resource
Semua 26 link dari tab Resources challenge, ditambah halaman challenge dan dua sumber di luar daftar
yang tetap dibutuhkan. “Dipakai” berarti datanya masuk produk; “opsional” hanya jika waktu cukup;
“tidak dipakai” beserta alasannya.
Challenge
• Field Shift: Adapting Farms with NASA Data (tab Resources: ?tab=resources)
Data NASA
Resource Status Catatan
SMAP Dipakai SMAP L4 lewat AppEEARS, bukan file global
GPM / IMERG Dipakai IMERG Final Daily V07
NASA POWER Dipakai API tanpa akun
SRTM Dipakai Lereng dan erosi
ECOSTRESS Dipakai ESI 70 m
LP DAAC products Dipakai Katalog HLS, MODIS, ECOSTRESS, SRTM
Earthdata Dipakai Buat akun Earthdata Login di sini
Earthdata Search: VIIRS Tidak dipakai Tercakup HLS dan MODIS
EarthExplorer (USGS) Tidak dipakai Landsat sudah ada di HLS
GEDI Tidak dipakai Fokus biomassa hutan, lemah untuk tanaman
semusim
Data pertanian dan tanah (USDA/USGS, AS)
Resource Status Catatan
CropScape / CDL Dipakai Jenis tanaman per tahun
Crop Sequence Boundaries Dipakai (di luar daftar) Riwayat rotasi 8 tahun per petak; inti fitur
F10
NRCS soils Dipakai Tekstur, bahan organik, AWC, erosi
(SSURGO/STATSGO2)
Web Soil Survey Cadangan Jika query SSURGO otomatis gagal
NASS QuickStats Dipakai Statistik panen kabupaten
OpenET Dipakai ET per petak, AS barat
USGS NWIS Dipakai Muka air tanah

<!-- Page 7 -->
Resource Status Catatan
PRISM Dipakai Iklim 4 km untuk validasi
AMS Market News Opsional Harga regional
Ag Data Commons Opsional Cari dataset uji rotasi spesifik
NAIP Opsional Citra 1 m untuk cek batas petak
CoCoRaHS Opsional Validasi curah hujan IMERG
NLCD Tidak dipakai Tercakup CDL
LANDFIRE Tidak dipakai Fokus vegetasi alami dan bahan bakar
Data global dan mitra
Resource Status Catatan
FAO GAEZ Dipakai Kesesuaian tanaman 51 komoditas
ERA5 (Copernicus CDS) Dipakai Iklim pengganti untuk Banyumas
Copernicus Data Space Tidak dipakai Sentinel-2 sudah ada di HLS S30
(Sentinel-2)
SoilGrids (ISRIC) Dipakai (di luar daftar) Tanah 250 m untuk Banyumas
NLDAS/GLDAS disebut di Resources tanpa link khusus; cari “GLDAS” di Earthdata Search.
Deliverable, batasan, dan keputusan terbuka
Yang harus dikumpulkan sebelum hackathon ditutup (15 November):
• ☐ Demo web yang bisa dibuka juri (frontend + data hasil pra-komputasi)
• ☐ Repo publik berisi kode, README, dan daftar sumber data
• ☐ Project page Space Apps: deskripsi, data NASA yang dipakai, link demo
• ☐ Video atau presentasi demo sesuai panduan submission resmi (cek format dan durasinya di
halaman Space Apps)
Batasan yang harus disampaikan jujur di produk dan pitch:
• Tool ini membantu menjelajah pilihan, bukan memberi rekomendasi final. Keputusan tetap di
tangan petani dan penyuluh.
• Skor kesehatan tanah adalah estimasi berbasis aturan agronomi, bukan hasil pengukuran. Satelit
tidak mengukur bahan organik tanah secara langsung.
• Data beresolusi kasar (SMAP 9 km, NASA POWER 0,5°, GRACE ratusan km) hanya konteks
wilayah, tidak dibaca sebagai kondisi petak.
• Bukti rotasi dari CSB bersifat asosiasi, bukan sebab-akibat.
• Parameter tanaman memakai nilai default FAO; belum dikalibrasi untuk varietas lokal.

<!-- Page 8 -->
Keputusan yang masih harus diambil tim:
Keputusan Pilihan Rekomendasi saat ini
Wilayah A. AS saja · B. Banyumas saja · C. AS pilot + C; kalau waktu tidak cukup, A
Banyumas transfer
Rotasi AS: ambil 2–3 urutan tanaman paling umum dari Konfirmasi ke penyuluh atau
pembanding CSB di wilayah pilot. Banyumas: padi–padi–bera dosen agronomi
(baseline), padi–padi–kacang hijau, padi–kedelai–
jagung
PostGIS Dipakai untuk poligon petak/desa, atau cukup file Mulai dari GeoJSON; PostGIS
GeoJSON statis hanya jika query spasial dinamis
dibutuhkan
Endpoint Ada /simulate, atau semua hasil pra-komputasi Pra-komputasi dulu
simulasi live
Arti istilah Tidak dijelaskan di statement Tanyakan di Space Apps Connect
“SI” di
challenge
Akses API butuh key; kuota belum dicek Daftar sekarang; cadangan:
OpenET ECOSTRESS
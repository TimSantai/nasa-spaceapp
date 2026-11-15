import type { DataSensor, PipelineStep, DifferentiatorItem, ProblemPoint, StatItem, Language } from '../types/landing';

export const getNasaSensors = (lang: Language): DataSensor[] => [
  {
    id: 'hls-l30-s30',
    name: 'NASA HLS 30m (L30 & S30 v2.0)',
    agency: 'NASA / USGS',
    resolution: '30 meters',
    temporal: '2–3 days',
    role: lang === 'en'
      ? 'Crop phenology curves, NDVI trajectory, and fallow window detection.'
      : 'Deteksi siklus tanam, kurva fenologi NDVI, dan durasi lahan bera (fallow window).',
    scaleType: 'plot',
    status: 'optional',
    description: lang === 'en'
      ? 'Harmonized Landsat-8 and Sentinel-2 multispectral surface reflectance at high spatial resolution.'
      : 'Harmonized Landsat-8 dan Sentinel-2 menyediakan citra multispektral permukaan daratan resolusi tinggi.',
  },
  {
    id: 'ecostress-esi',
    name: 'ECOSTRESS ESI v002',
    agency: 'NASA JPL (ISS)',
    resolution: '70 meters',
    temporal: 'Diurnal / ISS orbit',
    role: lang === 'en'
      ? 'Evaporative Stress Index (ESI) detecting crop water stress before visible wilting.'
      : 'Indeks Stres Evaporatif (Evaporative Stress Index / ESI) berbasis suhu kanopi tanaman.',
    scaleType: 'plot',
    status: 'backup',
    description: lang === 'en'
      ? 'Thermal infrared radiometer aboard ISS tracking actual vs potential crop transpiration.'
      : 'Mengukur stres transpirasi tanaman dan konsumsi air aktual vs potensial sebelum gejala visual tampak.',
  },
  {
    id: 'srtm-gl1',
    name: 'NASA SRTM GL1',
    agency: 'NASA / NGA',
    resolution: '30 meters (1 arc-sec)',
    temporal: 'Static (DEM)',
    role: lang === 'en'
      ? 'Elevation gradients and slope calculations for soil erosion vulnerability.'
      : 'Model elevasi digital (DEM) dan kemiringan lereng untuk kalkulasi risiko erosi tanah.',
    scaleType: 'plot',
    status: 'active',
    description: lang === 'en'
      ? 'Global digital elevation model for drainage patterns and terrace runoff dynamics.'
      : 'Menyediakan data topografi mikro untuk menilai drainase air dan risiko limpasan permukaan pada lereng terasering.',
  },
  {
    id: 'gpm-imerg',
    name: 'GPM IMERG Final Daily V07',
    agency: 'NASA / JAXA',
    resolution: '0.1° (~11 km)',
    temporal: 'Daily (2000–2025)',
    role: lang === 'en'
      ? '25-year daily rainfall reconstruction and monsoon onset delay detection.'
      : 'Rekonstruksi curah hujan harian 25 tahun dan penentuan tanggal awal musim hujan (monsoon onset).',
    scaleType: 'regional',
    status: 'backup',
    description: lang === 'en'
      ? 'Multi-satellite constellation precipitation calibrated against global gauge networks.'
      : 'Kombinasi sensor gelombang mikro pasif konstelasi satelit global dan kalibrasi stasiun hujan darat.',
  },
  {
    id: 'smap-l4',
    name: 'NASA SMAP L4 (SPL4SMGP)',
    agency: 'NASA JPL',
    resolution: '9 km',
    temporal: '3-hourly / Daily',
    role: lang === 'en'
      ? 'Root-zone soil moisture (0–100 cm) available during critical dry transitions.'
      : 'Estimasi lengas tanah zona perakaran (root-zone 0–100 cm) selama masa transisi musim kemarau.',
    scaleType: 'basin',
    status: 'optional',
    description: lang === 'en'
      ? 'L-band radar assimilation with catchment land surface models; used as regional basin context.'
      : 'Asimilasi observasi radar L-band dengan model permukaan tanah catchment-scale, disajikan sebagai konteks cekungan DAS.',
  },
  {
    id: 'power-ag',
    name: 'NASA POWER AG',
    agency: 'NASA Langley',
    resolution: '0.5° (~50 km)',
    temporal: 'Daily (1981–2025)',
    role: lang === 'en'
      ? 'Solar irradiance, thermal limits (Tmin/Tmax), humidity, and FAO Penman-Monteith ET0.'
      : 'Radiasi matahari harian, suhu ekstrem (Tmin/Tmax), kelembapan relatif, dan estimasi ET0 FAO Penman-Monteith.',
    scaleType: 'regional',
    status: 'active',
    description: lang === 'en'
      ? 'Long-term agrometeorological dataset for crop water balance and growing degree days (GDD).'
      : 'Data agrometeorologi jangka panjang untuk mensimulasikan neraca air tanaman dan derajat hari tumbuh (GDD).',
  },
  {
    id: 'soilgrids',
    name: 'ISRIC SoilGrids 250m v2.0',
    agency: 'ISRIC / Global',
    resolution: '250 meters',
    temporal: 'Static',
    role: lang === 'en'
      ? 'Soil texture fractions (clay/silt/sand), pH, organic carbon, and available water capacity (AWC).'
      : 'Distribusi fraksi tanah (liat, lempung, pasir), pH, bahan organik, dan kapasitas simpan air (AWC).',
    scaleType: 'regional',
    status: 'active',
    description: lang === 'en'
      ? 'Global machine-learning soil property predictions at 250m spatial resolution.'
      : 'Pemodelan machine learning sifat fisik dan kimiawi tanah global dengan resolusi 250m.',
  },
  {
    id: 'gaez-v4',
    name: 'FAO GAEZ v4',
    agency: 'FAO / IIASA',
    resolution: '~9 km',
    temporal: 'Climatological Model',
    role: lang === 'en'
      ? 'Agro-ecological suitability boundaries for secondary break crops and cover legumes.'
      : 'Batas kesesuaian agro-ekologis untuk tanaman pangan dan palawija alternatif.',
    scaleType: 'regional',
    status: 'backup',
    description: lang === 'en'
      ? 'Global agro-ecological crop suitability and potential yield model across 51 commodities.'
      : 'Peta zonasi potensi hasil panen berbasis kesesuaian iklim dan tanah untuk 51 komoditas global.',
  },
];

export const getAllDataResources = (lang: Language): DataSensor[] => [
  ...getNasaSensors(lang),
  {
    id: 'ecostress-et',
    name: 'ECOSTRESS Evapotranspiration (PT-JPL)',
    agency: 'NASA JPL',
    resolution: '70 meters',
    temporal: 'Diurnal (ISS)',
    role: lang === 'en'
      ? 'Field-scale actual crop water consumption flux (ETa).'
      : 'Estimasi fluks konsumsi air tanaman aktual (ETa) per petak sawah.',
    scaleType: 'plot',
    status: 'backup',
    description: lang === 'en'
      ? 'Priestley-Taylor JPL model decoupling canopy transpiration from soil evaporation.'
      : 'Model Priestley-Taylor JPL menghitung evaporasi kanopi dan tanah secara terpisah.',
  },
  {
    id: 'smap-l3',
    name: 'NASA SMAP L3 Radiometer (SPL3SMP_E)',
    agency: 'NASA JPL',
    resolution: '9 km grid',
    temporal: 'Daily',
    role: lang === 'en'
      ? 'Surface soil moisture (0–5 cm) for onset soil wetting detection.'
      : 'Observasi kelembapan permukaan 0–5 cm untuk kalibrasi onset basah awal musim.',
    scaleType: 'basin',
    status: 'context',
    description: lang === 'en'
      ? 'L-band microwave brightness temperature observations over topsoil.'
      : 'Data kecerahan gelombang mikro L-band terkoreksi RFI untuk mengamati lapisan atas tanah.',
  },
  {
    id: 'modis-mcd12q1',
    name: 'MODIS Land Cover Dynamics (MCD12Q1)',
    agency: 'NASA GSFC',
    resolution: '500 meters',
    temporal: 'Annual (2001–2024)',
    role: lang === 'en'
      ? 'Historical 24-year land cover dynamic validation.'
      : 'Riwayat dinamika tutupan lahan jangka panjang 2001–2024.',
    scaleType: 'regional',
    status: 'context',
    description: lang === 'en'
      ? 'Global IGBP land cover classification tracking paddy land use stability.'
      : 'Klasifikasi sistem IGBP tutupan lahan global untuk memverifikasi tren konversi sawah.',
  },
  {
    id: 'modis-mod16a2',
    name: 'MODIS Evapotranspiration (MOD16A2)',
    agency: 'NASA / Univ. of Montana',
    resolution: '500 meters',
    temporal: '8-day composite',
    role: lang === 'en'
      ? 'Cross-validation benchmark for historical water balance before ECOSTRESS era.'
      : 'Validasi silang neraca air bulanan historis sebelum era ECOSTRESS.',
    scaleType: 'regional',
    status: 'backup',
    description: lang === 'en'
      ? 'Modified Penman-Monteith algorithm based on MODIS Terra/Aqua inputs.'
      : 'Algoritma Penman-Monteith termodifikasi berbasis citra MODIS Terra & Aqua.',
  },
  {
    id: 'grace-tellus',
    name: 'GRACE/GRACE-FO Terrestrial Water Storage',
    agency: 'NASA JPL / GFZ',
    resolution: '1° (~110 km) mascon',
    temporal: 'Monthly',
    role: lang === 'en'
      ? 'Deep groundwater basin depletion indicator for Serayu Catchment.'
      : 'Indikator tren penipisan air tanah cekungan regional DAS Serayu.',
    scaleType: 'basin',
    status: 'context',
    description: lang === 'en'
      ? 'Satellite gravimetry detecting total water storage anomalies.'
      : 'Anomali gravitasi bumi yang merefleksikan perubahan total cadangan air air tanah.',
  },
  {
    id: 'landsat89-c2l2',
    name: 'Landsat 8-9 OLI/TIRS Collection 2 L2',
    agency: 'USGS / NASA',
    resolution: '30 meters',
    temporal: '8–16 days',
    role: lang === 'en'
      ? 'Long-term surface reflectance and Land Surface Temperature (2013–2025).'
      : 'Reflektansi permukaan dan Suhu Permukaan Tanah (LST) jangka panjang 2013–2025.',
    scaleType: 'plot',
    status: 'context',
    description: lang === 'en'
      ? 'Radiometrically calibrated surface reflectance time series.'
      : 'Koreksi atmosferik radiometrik permukaan daratan untuk time-series vegetasi.',
  },
  {
    id: 'sentinel2-msi',
    name: 'Copernicus Sentinel-2 MSI Level-2A',
    agency: 'ESA / NASA harmonized',
    resolution: '10–20 meters',
    temporal: '5 days',
    role: lang === 'en'
      ? 'Ultra-high resolution vegetation indices (NDVI, NDRE) for bund delineation.'
      : 'Indeks vegetasi resolusi ultra-tinggi (NDVI, NDRE) untuk batas pematang mikro.',
    scaleType: 'plot',
    status: 'context',
    description: lang === 'en'
      ? '13 spectral bands with red-edge channels for crop canopy nitrogen assessment.'
      : 'Citra optik 13 saluran spektral termasuk red-edge untuk deteksi klorofil tanaman.',
  },
  {
    id: 'sentinel1-sar',
    name: 'Copernicus Sentinel-1 SAR C-band GRD',
    agency: 'ESA',
    resolution: '10 meters',
    temporal: '6–12 days',
    role: lang === 'en'
      ? 'All-weather standing water and rice transplanting flood detection.'
      : 'Deteksi penggenangan air sawah (standing water) menembus tutupan awan musim hujan.',
    scaleType: 'plot',
    status: 'context',
    description: lang === 'en'
      ? 'Dual-polarization radar penetrating monsoon cloud cover.'
      : 'Radar apertur sintetis (SAR) polarisasi ganda VV/VH untuk mendeteksi penanaman padi fase genangan.',
  },
  {
    id: 'hwsd-v2',
    name: 'FAO Harmonized World Soil Database v2.0',
    agency: 'FAO / IIASA',
    resolution: '30 arc-sec (~1 km)',
    temporal: 'Static',
    role: lang === 'en'
      ? 'Soil classification cross-validation and available water retention capacity.'
      : 'Validasi silang klasifikasi ordo tanah USDA dan kapasitas simpan air.',
    scaleType: 'regional',
    status: 'backup',
    description: lang === 'en'
      ? 'Combined global soil survey maps for regional soil parameters.'
      : 'Kompilasi peta survei tanah nasional global untuk parameter tanah regional.',
  },
  {
    id: 'usda-csb',
    name: 'USDA Crop Sequence Boundaries (CSB)',
    agency: 'USDA NASS',
    resolution: '30 meters',
    temporal: 'Annual',
    role: lang === 'en'
      ? 'Methodological benchmark for crop rotation sequences (openly disclosed as US-only).'
      : 'Benchmark metodologis arsitektur sekuens rotasi (belum tersedia di Indonesia, diungkap jujur).',
    scaleType: 'plot',
    status: 'optional',
    description: lang === 'en'
      ? 'Multitemporal field rotation boundaries used as architectural reference.'
      : 'Batas petak rotasi tanaman multitemporal AS yang dijadikan acuan arsitektur model.',
  },
  {
    id: 'usda-ssurgo',
    name: 'USDA Gridded SSURGO (gSSURGO)',
    agency: 'USDA NRCS',
    resolution: '10 meters',
    temporal: 'Static',
    role: lang === 'en'
      ? 'Benchmark for USLE soil erosion modeling on terrace slopes.'
      : 'Benchmark kalibrasi model erosi USLE untuk topografi terasering miring.',
    scaleType: 'plot',
    status: 'active',
    description: lang === 'en'
      ? 'Highest resolution soil survey for testing surface runoff algorithms.'
      : 'Survei tanah resolusi tertinggi AS untuk pengujian algoritma limpasan air.',
  },
  {
    id: 'era5-land',
    name: 'ECMWF ERA5-Land Agrometeorology',
    agency: 'ECMWF / Copernicus',
    resolution: '0.1° (~9 km)',
    temporal: 'Hourly / Daily',
    role: lang === 'en'
      ? 'Backup reanalysis for temperature and humidity during NASA POWER updates.'
      : 'Data cadangan validasi silang suhu dan kelembapan saat data NASA POWER diperbarui.',
    scaleType: 'regional',
    status: 'backup',
    description: lang === 'en'
      ? 'Global high-resolution climate reanalysis over land.'
      : 'Reanalisis iklim daratan global dengan resolusi spasial dan temporal tinggi.',
  },
  {
    id: 'chirps-v2',
    name: 'CHIRPS Daily Precipitation v2.0',
    agency: 'UCSB CHC / USGS',
    resolution: '0.05° (~5 km)',
    temporal: 'Daily (1981–2025)',
    role: lang === 'en'
      ? 'Cross-validation of dry spell frequencies against GPM IMERG.'
      : 'Validasi silang frekuensi hari tanpa hujan (dry spells) terhadap GPM IMERG.',
    scaleType: 'regional',
    status: 'backup',
    description: lang === 'en'
      ? 'Thermal infrared satellite rainfall estimates calibrated with in-situ stations.'
      : 'Estimasi curah hujan inframerah termal satelit yang dikalibrasi stasiun in-situ.',
  },
  {
    id: 'chirts-temp',
    name: 'CHIRTS-daily Max/Min Temperature',
    agency: 'UCSB CHC',
    resolution: '0.05° (~5 km)',
    temporal: 'Daily',
    role: lang === 'en'
      ? 'Thermal stress and heatwave detection during rice reproductive flowering.'
      : 'Deteksi gelombang panas dan hari stres termal saat fase berbunga padi.',
    scaleType: 'regional',
    status: 'optional',
    description: lang === 'en'
      ? 'Combines surface station records with satellite land surface temperature.'
      : 'Kombinasi observasi stasiun darat dan variasi suhu permukaan tanah satelit.',
  },
  {
    id: 'bmkg-climate',
    name: 'BMKG Open Climate Station Observations',
    agency: 'BMKG Indonesia',
    resolution: 'Station point',
    temporal: 'Daily',
    role: lang === 'en'
      ? 'Ground-truth local weather calibration (Semarang/Cilacap climatology stations).'
      : 'Kalibrasi stasiun darat lokal (Stasiun Klimatologi Semarang/Cilacap untuk Banyumas).',
    scaleType: 'plot',
    status: 'context',
    description: lang === 'en'
      ? 'Nearest ground weather station data in Central Java.'
      : 'Data hujan dan suhu pengamatan stasiun darat terdekat di Jawa Tengah.',
  },
  {
    id: 'noaa-enso-iod',
    name: 'NOAA CPC ENSO ONI & DMI Indices',
    agency: 'NOAA CPC',
    resolution: 'Ocean/Atmosphere Indices',
    temporal: 'Monthly',
    role: lang === 'en'
      ? 'Classification of historical analog years based on Niño 3.4 & Dipole Mode Index.'
      : 'Pengelompokan tahun analog historis berdasarkan Oceanic Niño Index & Dipole Mode Index.',
    scaleType: 'regional',
    status: 'active',
    description: lang === 'en'
      ? 'Sea surface temperature anomalies driving monsoon timing and drought duration.'
      : 'Anomali suhu permukaan laut Pasifik Niño 3.4 dan Samudra Hindia barat/timur.',
  },
  {
    id: 'pihps-pangan',
    name: 'Bank Indonesia PIHPS Strategic Food Prices',
    agency: 'Bank Indonesia',
    resolution: 'Banyumas Regional Markets',
    temporal: 'Weekly',
    role: lang === 'en'
      ? 'Commodity price risk benchmarks for paddy, mungbean, soybean, and sorghum.'
      : 'Benchmark disparitas harga komoditas padi, kacang hijau, kedelai, dan jagung.',
    scaleType: 'regional',
    status: 'context',
    description: lang === 'en'
      ? 'National food price information center for gross economic margin estimates.'
      : 'Pusat Informasi Harga Pangan Strategis nasional untuk estimasi kelayakan ekonomi.',
  },
  {
    id: 'copernicus-dem',
    name: 'Copernicus GLO-30 Digital Elevation Model',
    agency: 'ESA / Airbus',
    resolution: '30 meters',
    temporal: 'Static',
    role: lang === 'en'
      ? 'Slope and drainage cross-validation around Mt. Slamet volcanic foothills.'
      : 'Validasi silang topografi SRTM pada kawasan lembah curam lereng Gunung Slamet.',
    scaleType: 'plot',
    status: 'backup',
    description: lang === 'en'
      ? 'Global 30m DEM derived from TanDEM-X radar mission.'
      : 'DEM global berbasis misi satelit radar TanDEM-X.',
  },
];

export const getPipelineSteps = (lang: Language): PipelineStep[] => [
  {
    number: '01',
    title: lang === 'en' ? 'Assimilate Multi-Sensor Streams' : 'Selaraskan Data Multi-Sensor',
    shortDesc: lang === 'en' ? 'Spatial harmonization across tiered scales.' : 'Harmonisasi koordinat geografis dan resolusi spasial bertingkat.',
    detail: lang === 'en'
      ? 'Combines NASA POWER 0.5° daily climate, SRTM 30 m terrain and SoilGrids soil texture per plot; HLS 30 m NDVI and SMAP 9 km soil moisture are added as AppEEARS extractions finish.'
      : 'Menggabungkan iklim harian NASA POWER 0.5°, medan SRTM 30 m, dan tekstur tanah SoilGrids per petak; NDVI HLS 30 m dan kelembapan tanah SMAP 9 km ditambahkan setelah ekstraksi AppEEARS selesai.',
    sensors: ['POWER 0.5°', 'SRTM 30m', 'HLS 30m*', 'SMAP 9km*'],
    iconName: 'Layers',
  },
  {
    number: '02',
    title: lang === 'en' ? 'Extract Land Biophysical Profile' : 'Baca Profil Kondisi Lahan',
    shortDesc: lang === 'en' ? 'NDVI phenology curves, slope, and water storage.' : 'Ekstraksi kurva fenologi NDVI, elevasi, dan tekstur tanah.',
    detail: lang === 'en'
      ? 'Analyzes 5-year vegetative canopy history to identify fallow duration, SRTM 30m slope erosion risks, and root-zone water capacity.'
      : 'Menganalisis riwayat tutupan hijau 5 tahun terakhir untuk mendeteksi durasi lahan bera, kemiringan lereng SRTM 30m untuk erosi, dan kapasitas simpan lengas tanah.',
    sensors: ['HLS NDVI', 'SRTM 30m', 'SoilGrids 250m'],
    iconName: 'Compass',
  },
  {
    number: '03',
    title: lang === 'en' ? 'Isolate Analog Climate Years' : 'Kelompokkan Tahun Analog',
    shortDesc: lang === 'en' ? 'Filter 2000–2025 records matching next season.' : 'Menyaring tahun historis 2000–2025 yang analog dengan musim depan.',
    detail: lang === 'en'
      ? 'Rather than flat 30-year averages, the engine isolates historical years with matching ENSO/IOD phases (severe El Niño drought, La Niña wet, or Neutral) from 25-year GPM & POWER data.'
      : 'Alih-alih memakai rata-rata statis 30 tahun, sistem mengisolasi tahun-tahun historis dengan fase iklim serupa (El Niño kering, La Niña basah, atau Netral) dari arsip 25 tahun GPM dan POWER.',
    sensors: ['GPM IMERG', 'NASA POWER', 'NOAA ENSO / IOD'],
    iconName: 'CalendarRange',
  },
  {
    number: '04',
    title: lang === 'en' ? 'Simulate ≥3 Crop Sequences' : 'Nilai Strategi Rotasi (≥3 Pola)',
    shortDesc: lang === 'en' ? 'Multi-objective water, stress, and soil health modeling.' : 'Simulasi kuantitatif kebutuhan air, stres, dan kesehatan tanah.',
    detail: lang === 'en'
      ? 'Simulates crop evapotranspiration demand, transpiration stress days, biological nitrogen fixation, and bare fallow exposure for existing vs alternative rotations.'
      : 'Mensimulasikan konsumsi air tanaman, hari stres transpirasi, penambahan nitrogen biologis, dan durasi tanah terbuka untuk pola eksisting vs alternatif rotasi.',
    sensors: ['FAO CropWat', 'ECOSTRESS ESI', 'HLS Phenology'],
    iconName: 'GitFork',
  },
  {
    number: '05',
    title: lang === 'en' ? 'Evaluate Worst-Case Risk (CVaR)' : 'Hitung Skor Risiko (CVaR)',
    shortDesc: lang === 'en' ? 'Mean return vs 10% worst-case climate disasters.' : 'Menghitung skor rata-rata vs performa di tahun terburuk.',
    detail: lang === 'en'
      ? 'Applies Conditional Value at Risk (CVaR 10%) to stress-test whether a rotation crashes during extreme drought, controlled via an interactive live Caution Slider.'
      : 'Menggunakan metodologi Conditional Value at Risk (CVaR 10%) untuk menguji apakah suatu pola tanaman akan hancur saat terjadi kekeringan ekstrem, dilengkapi Caution Slider yang fleksibel.',
    sensors: ['CVaR 10%', 'Multi-Objective Pareto', 'Risk Matrix'],
    iconName: 'ShieldAlert',
  },
  {
    number: '06',
    title: lang === 'en' ? 'Assemble Actionable Evidence Card' : 'Susun Evidence Card & Bukti',
    shortDesc: lang === 'en' ? 'Satellite proof, confidence badge & field verification.' : 'Satu kartu komprehensif: bukti, celah data, keyakinan & cek lapangan.',
    detail: lang === 'en'
      ? 'Generates simple, farmer-friendly evidence cards showing confidence ratings (High/Medium/Low), openly disclosed data gaps, and an extension agent field checklist.'
      : 'Menyajikan kartu bukti dengan bahasa lugas untuk petani, mencantumkan tingkat keyakinan (Tinggi/Sedang/Rendah), keterbatasan data, serta checklist wajib periksa di lapangan.',
    sensors: ['Evidence Card', 'Confidence Meter', 'Checklist PPL'],
    iconName: 'FileCheck',
  },
];

export const getDifferentiators = (lang: Language): DifferentiatorItem[] => [
  {
    id: 'observed-evidence',
    title: lang === 'en' ? 'Observed Phenology Evidence' : 'Rotasi Nyata (Phenology Evidence)',
    subtitle: lang === 'en' ? 'Grounded in satellite pixels, not generic theory' : 'Bukan sekadar rumus teori agronomi',
    desc: lang === 'en'
      ? 'Reads HLS 30m NDVI curves and ECOSTRESS thermal anomalies to observe real crop cycles on neighboring plots. Disclosed openly as observational association, not isolated clinical causation.'
      : 'Membaca kurva NDVI HLS 30m dan evaporasi ECOSTRESS untuk melihat apa yang sebenarnya terjadi di petak serupa musim berikutnya. Disajikan jujur sebagai asosiasi observasi, bukan klaim sebab-akibat mutlak.',
    iconName: 'Eye',
    tag: lang === 'en' ? 'Real Spaceborne Evidence' : 'Bukti Satelit Nyata',
  },
  {
    id: 'climate-analog',
    title: lang === 'en' ? 'Seasonal Analog Climatology' : 'Iklim Musim Depan (Analog Climatology)',
    subtitle: lang === 'en' ? 'Conditioned on upcoming ENSO & IOD states' : 'Kondisional terhadap fase ENSO & IOD',
    desc: lang === 'en'
      ? 'We never evaluate rotations against flat 30-year averages that hide catastrophic droughts. Strategies are simulated against historical analog years matching projected climate phases (e.g. 2015 & 2023 El Niño).'
      : 'Kami tidak menilai rotasi berdasarkan rata-rata iklim 30 tahun yang datar. Strategi dinilai terhadap kelompok tahun analog dengan skenario iklim musim depan (El Niño ekstrem, La Niña, atau Netral).',
    iconName: 'CloudSun',
    tag: lang === 'en' ? 'Analog Climate Ensemble' : 'Fase Iklim Analog',
  },
  {
    id: 'cvar-risk',
    title: lang === 'en' ? 'Worst-Case Risk Protection (CVaR)' : 'Risiko Tahun Terburuk (CVaR Focus)',
    subtitle: lang === 'en' ? 'Protecting farmers from catastrophic bankruptcy' : 'Melindungi petani dari gagal panen fatal',
    desc: lang === 'en'
      ? 'High average yields are meaningless if a farmer loses everything during a drought. We quantify Conditional Value at Risk (worst 10% years) with a dynamic Caution Slider to balance growth vs survival.'
      : 'Rata-rata hasil panen yang tinggi tidak ada gunanya jika petani bangkrut di tahun kekeringan parah. Kami mengukur Conditional Value at Risk (tahun 10% terburuk) dengan Caution Slider yang dapat diatur langsung.',
    iconName: 'ShieldCheck',
    tag: lang === 'en' ? 'Extreme Risk Hedging' : 'Proteksi Risiko Ekstrem',
  },
  {
    id: 'confidence-gaps',
    title: lang === 'en' ? 'Confidence Drops with Missing Data' : 'Keyakinan Turun Saat Data Kurang',
    subtitle: lang === 'en' ? 'Radical honesty without hidden black boxes' : 'Transparansi penuh tanpa menyembunyikan celah',
    desc: lang === 'en'
      ? 'When local soil cores or field boundaries are unavailable (such as in Indonesia), confidence ratings automatically downgrade from High to Medium/Low, and information gaps are rendered in high-visibility hatch patterns.'
      : 'Jika data lapangan terbatas atau resolusi sensor kasar (seperti di Banyumas), tingkat keyakinan otomatis diturunkan ke Sedang atau Rendah, dan celah informasi diumumkan terbuka dengan pola visual khusus.',
    iconName: 'HelpCircle',
    tag: lang === 'en' ? 'Scientific Integrity' : 'Kejujuran Ilmiah',
  },
];

export const getProblemPoints = (lang: Language): ProblemPoint[] => [
  {
    title: lang === 'en' ? 'Extreme Tropical Climate Uncertainty' : 'Ketidakpastian Iklim Tropis Ekstrem',
    desc: lang === 'en'
      ? 'Delayed monsoon onset and prolonged El Niño dry spells repeatedly trigger complete crop failures under continuous rice monoculture (Paddy–Paddy–Fallow).'
      : 'Mundurnya awal musim hujan dan kemarau berkepanjangan akibat El Niño/IOD positif sering memicu gagal panen total pada pola monokultur padi terus-menerus (Padi–Padi–Bera).',
  },
  {
    title: lang === 'en' ? 'Satellite Data Trapped in Siloed Portals' : 'Data Satelit Tersebar di Puluhan Portal',
    desc: lang === 'en'
      ? 'NASA and global Earth observations are free and plentiful, yet locked in scientific formats (NetCDF, HDF5, GeoTIFF) inaccessible to field agronomists and farmers.'
      : 'Data NASA, NOAA, dan BMKG berlimpah dan gratis, tetapi tersimpan dalam format ilmiah rumit (NetCDF, HDF5, GeoTIFF) yang tidak dapat langsung dioperasikan oleh petani maupun penyuluh pertanian.',
  },
  {
    title: lang === 'en' ? 'Scale & Resolution Illusions' : 'Kekeliruan Asumsi Skala Resolusi',
    desc: lang === 'en'
      ? 'Coarse climate products (~10 to 50 km) are often misapplied to smallholder 1,000 m² plots without distinguishing field-level pixels from regional catchment context.'
      : 'Data iklim beresolusi kasar (~10 hingga 50 km) kerap salah diterapkan seolah-olah mewakili kondisi petak mikro 1000 m², tanpa membedakan resolusi petak dengan konteks wilayah.',
  },
  {
    title: lang === 'en' ? 'Dogmatic Recommendations Without Trade-Offs' : 'Rekomendasi Mutlak Tanpa Pilihan Trade-Off',
    desc: lang === 'en'
      ? 'Traditional farm apps dictate a single "best crop" output, concealing trade-offs, worst-case ruin risks, and scientific uncertainties from decision-makers.'
      : 'Aplikasi pertanian konvensional cenderung menyajikan "satu rekomendasi final" tanpa memberi perbandingan alternatif, tanpa memperhitungkan tahun terburuk, dan menyembunyikan tingkat ketidakpastian.',
  },
];

export const getPreviewStrategies = (lang: Language) => [
  {
    id: 'strat-baseline',
    name: lang === 'en' ? 'Paddy (Wet) → Paddy (Dry 1) → Severe Fallow (90 days)' : 'Padi (Hujan) → Padi Gadu → Lahan Bera (90 hari)',
    badge: lang === 'en' ? 'Current Baseline Rotation' : 'Rotasi Sekarang (Baseline)',
    isBaseline: true,
    isDominated: true,
    paretoStatus: lang === 'en' ? 'Dominated (Inferior on All Objectives)' : 'Dominated (Kalah di Semua Aspek)',
    crops: lang === 'en' ? ['Wet Season Paddy', 'Dry Season Paddy 1', 'Dry Season Fallow 2'] : ['Padi Sawah (MH)', 'Padi Gadu (MK1)', 'Lahan Bera (MK2)'],
    avgScore: 58,
    worstScore: 24,
    metrics: {
      waterDemand: lang === 'en' ? 'High (1,120 mm)' : 'Tinggi (1.120 mm)',
      stressDays: lang === 'en' ? '38 critical stress days' : '38 hari stres kritis',
      soilHealth: lang === 'en' ? 'Degraded (erosion in fallow)' : 'Rendah (erosi saat bera)',
      coverDays: lang === 'en' ? '210 canopy cover days' : '210 hari tutupan',
    },
    confidence: {
      level: 'high',
      label: lang === 'en' ? 'High' : 'Tinggi',
      reason: lang === 'en'
        ? 'Verified by 2018–2024 HLS NDVI phenology on Karangrau plots.'
        : 'Pola ini tercatat pada observasi fenologi HLS 2018–2024 di Banyumas.',
    },
    summary: lang === 'en'
      ? 'High returns in wet years, but suffers 60%+ complete crop failure during extreme El Niño drought years.'
      : 'Menghasilkan pendapatan saat musim basah, namun mengalami risiko gagal panen 60%+ pada fase kemarau El Niño ekstrem.',
  },
  {
    id: 'strat-opt-a',
    name: lang === 'en' ? 'Paddy (Wet) → Paddy (Dry 1) → Mungbean (Vima-1)' : 'Padi (Hujan) → Padi Gadu → Kacang Hijau (Vima-1)',
    badge: lang === 'en' ? 'Optimal Pareto Front' : 'Rekomendasi Utama',
    isBaseline: false,
    isDominated: false,
    paretoStatus: lang === 'en' ? 'Optimal (Pareto Frontier)' : 'Optimal (Pareto Frontier)',
    crops: lang === 'en' ? ['Wet Season Paddy', 'Dry Season Paddy 1', 'Mungbean (Vima-1)'] : ['Padi Sawah (MH)', 'Padi Gadu (MK1)', 'Kacang Hijau (MK2)'],
    avgScore: 86,
    worstScore: 74,
    metrics: {
      waterDemand: lang === 'en' ? 'Low (680 mm)' : 'Hemat (680 mm)',
      stressDays: lang === 'en' ? '6 controlled stress days' : '6 hari stres terkontrol',
      soilHealth: lang === 'en' ? 'Excellent (+38 kg N/ha fix)' : 'Sangat Baik (+38 kg N/ha)',
      coverDays: lang === 'en' ? '315 canopy cover days' : '315 hari tutupan',
    },
    confidence: {
      level: 'medium',
      label: lang === 'en' ? 'Moderate' : 'Sedang',
      reason: lang === 'en'
        ? 'Water requirements from FAO CropWat; local Vima-1 seed trials need extension verification.'
        : 'Data kebutuhan air dari FAO CropWat; uji coba varietas Vima-1 butuh verifikasi PPL setempat.',
    },
    summary: lang === 'en'
      ? 'Capitalizes on residual SMAP root-zone soil moisture; biological nitrogen fixation restores soil tilth.'
      : 'Memanfaatkan sisa kelembapan tanah root-zone SMAP di akhir kemarau; fiksasi nitrogen alami memperbaiki struktur tanah.',
  },
  {
    id: 'strat-opt-b',
    name: lang === 'en' ? 'Paddy (Wet) → Soybean (Grobogan) → Sorghum (Bioguma)' : 'Padi (Hujan) → Kedelai Grobogan → Sorgum Bioguma',
    badge: lang === 'en' ? 'Climate Diversification' : 'Alternatif Diversifikasi',
    isBaseline: false,
    isDominated: false,
    paretoStatus: lang === 'en' ? 'Water Conservation Trade-off' : 'Trade-off Hemat Air',
    crops: lang === 'en' ? ['Wet Season Paddy', 'Soybean (MK1)', 'Sorghum (MK2)'] : ['Padi Sawah (MH)', 'Kedelai (MK1)', 'Sorgum (MK2)'],
    avgScore: 79,
    worstScore: 81,
    metrics: {
      waterDemand: lang === 'en' ? 'Minimal (510 mm)' : 'Sangat Hemat (510 mm)',
      stressDays: lang === 'en' ? '2 minimal stress days' : '2 hari stres minimal',
      soilHealth: lang === 'en' ? 'Deep roots penetrate hardpan' : 'Baik (akar menembus padas)',
      coverDays: lang === 'en' ? '330 canopy cover days' : '330 hari tutupan',
    },
    confidence: {
      level: 'medium',
      label: lang === 'en' ? 'Moderate' : 'Sedang',
      reason: lang === 'en'
        ? 'Sorghum is highly drought-tolerant, but local market offtake in Banyumas must be confirmed.'
        : 'Sorgum sangat toleran kering, tetapi rantai serap pasar lokal Banyumas perlu dipastikan.',
    },
    summary: lang === 'en'
      ? 'Highest score in worst-case El Niño years; breaks brown planthopper pest cycles completely.'
      : 'Performa terbaik pada tahun El Niño terburuk; memutus total siklus wereng batang coklat dan menghemat air irigasi.',
  },
];

export const getHonestLimitations = (lang: Language) => [
  {
    id: 'decision-support',
    title: lang === 'en' ? 'This tool guides dialogue, it is not a final decree.' : 'Alat ini membantu menjelajah pilihan, bukan rekomendasi final.',
    desc: lang === 'en'
      ? 'Field Shift is engineered as an extension dialogue tool between farmers and agronomists, not an automated system dictating unilateral farm mandates.'
      : 'Sistem dirancang sebagai mitra diskusi antara petani dan penyuluh pertanian lapangan (PPL), bukan sistem otomatis yang menentukan keputusan tanam mutlak.',
  },
  {
    id: 'soil-estimation',
    title: lang === 'en' ? 'Soil health scores are agronomic rule-based estimates.' : 'Skor kesehatan tanah adalah estimasi berbasis aturan agronomi.',
    desc: lang === 'en'
      ? 'Values represent soil pedotransfer function estimates from ISRIC SoilGrids 250m, not direct laboratory chemical soil test coring on each parcel.'
      : 'Bukan hasil uji laboratorium kimia tanah langsung dari petak bersangkutan. Kapasitas tukar kation dan kandungan hara mengacu pada estimasi ISRIC SoilGrids 250m.',
  },
  {
    id: 'resolution-scale',
    title: lang === 'en' ? 'Coarse resolution datasets provide regional context only.' : 'Data beresolusi kasar hanya konteks wilayah.',
    desc: lang === 'en'
      ? 'NASA SMAP root-zone moisture (~9 km) and NASA POWER (~50 km) reflect broader basin atmospheric context, not micro-conditions in a specific parcel corner.'
      : 'Observasi lengas tanah NASA SMAP (~9 km) dan iklim NASA POWER (~50 km) mencerminkan kondisi iklim kawasan DAS, bukan kelembapan mikro di sudut petak pematang.',
  },
  {
    id: 'association-not-causation',
    title: lang === 'en' ? 'Satellite rotation evidence reflects empirical association, not causation.' : 'Bukti rotasi satelit bersifat asosiasi, bukan sebab-akibat.',
    desc: lang === 'en'
      ? 'Correlations between historical HLS surface reflectance and subsequent season performance are remote-sensing associations, not isolated double-blind trials.'
      : 'Korelasi antara pola tutupan lahan historis HLS dengan performa musim berikutnya adalah asosiasi empiris penginderaan jauh, bukan uji coba klinis agronomi terkontrol.',
  },
  {
    id: 'fao-defaults',
    title: lang === 'en' ? 'Crop parameters use FAO-56 defaults, not local variety calibration.' : 'Parameter tanaman memakai default FAO, belum dikalibrasi varietas lokal.',
    desc: lang === 'en'
      ? 'Crop coefficients (Kc) and water depletion fractions (p) follow FAO-56 standards. On-site verification with local cultivars remains essential.'
      : 'Koefisien tanaman (Kc) dan ambang batas stres air memakai standar FAO-56. Verifikasi masa tanam dan varietas lokal spesifik tetap wajib dikonfirmasi di lapangan.',
  },
];

export const VERIFIABLE_STATS: StatItem[] = [
  {
    number: '3+',
    label: 'Rotations Compared',
    detail: 'Side-by-side Pareto evaluation: Baseline, Recommended, and Climate Diversification.',
    source: 'Pareto Front Multi-Objective Rules',
  },
  {
    number: '20+',
    label: 'Years Daily Climate',
    detail: 'Daily time-series archives from NASA POWER AG and GPM IMERG since year 2000.',
    source: 'NASA POWER & GPM IMERG V07',
  },
  {
    number: '2015–25',
    label: 'Satellite Observations',
    detail: 'Multi-year HLS 30m NDVI phenology and ECOSTRESS water stress assimilation.',
    source: 'NASA HLS 30m & ECOSTRESS 70m',
  },
  {
    number: '26',
    label: 'Datasets Audited',
    detail: 'Rigorous open audit across Earth observation, pedology, and agrometeorology sources.',
    source: 'Field Shift Provenance Registry',
  },
];

# Plan: FE-05 · Integrasi Fetch Data Backend API & Model Rekomendasi Rotasi Tanaman

**Source Issue**: [Issue #23: FE-05 · Integrasi Fetch Data Backend API & Model Rekomendasi Rotasi Tanaman](https://github.com/TimSantai/nasa-spaceapp/issues/23)
**Source PR Backend**: [PR #33: feat: integrate real data and geolocation updates](https://github.com/TimSantai/nasa-spaceapp/pull/33)
**Branch Target**: `feat/FE-05-backend-data-integration`
**Complexity**: Medium

---

## 1. Summary
Mengimplementasikan integrasi frontend modern berbasis **TanStack Query (React Query)** yang menghubungkan antarmuka FieldShift (3D Map HUD & Workspace Analisis) dengan API backend FastAPI (`/api/v1/fields` dan `/api/v1/rotations/compare`). 

Mengadopsi pola *seamless stale-while-revalidate* dengan snapshot data nyata NASA POWER / HWSD sebagai `initialData` agar aplikasi langsung aktif seketika tanpa loading blocking, debounced reactive scenario calculation (300ms), caching cerdas berbasis query keys, serta feedback visual *subtle in-place updating* tanpa layout shifts.

---

## 2. Patterns to Mirror

| Category | Source File & Line | Pattern |
|---|---|---|
| API Client Envelope | `src/api/fieldshift.ts:23-40` | Typed `Envelope<T>` (`{ success, data, error }`) dengan `AbortSignal.timeout(8000)`. |
| Domain Type Adapters | `src/api/fieldshift.ts:49-51`, `107-165` | `toField` dan `toStrategies` memetakan schema backend DTO (`FieldProfileOut`, `ComparisonOut`) ke UI domain entities (`FieldProfile`, `Strategy`). |
| Scoring Engine | `src/lib/scoring.ts:1-30` | `applyWeights(strategies, weights)` untuk dynamic client-side Pareto score recalculation berbobot (O(1)). |
| Safe Guard Patterns | `src/App.tsx:17-25` | `isFieldProfile` type guard dan fallback `activePlot = selectedField ?? fields[0]`. |
| Unit Testing | `src/lib/deepLink.test.ts` | Test suite mandiri menggunakan Node test runner bawaan (`node --experimental-strip-types --test`). |

---

## 3. Files to Change

| File | Action | Purpose |
|---|---|---|
| `frontend-nasa/src/main.tsx` | UPDATE | Menginisialisasi `QueryClient` dan membungkus `<App />` dengan `<QueryClientProvider>`. |
| `frontend-nasa/src/api/queryClient.ts` | CREATE | Konfigurasi singleton `QueryClient` dengan `staleTime: 5 min`, `gcTime: 30 min`, retry logic, dan network error handling. |
| `frontend-nasa/src/features/rotations/useRotationsQuery.ts` | CREATE | Custom hooks TanStack Query: `useFieldsQuery()`, `useSiteInfoQuery()`, dan `useStrategiesQuery()` dengan `keepPreviousData` dan debounced scenario hashing. |
| `frontend-nasa/src/features/rotations/useDebounce.ts` | CREATE | Reusable hook `useDebounce<T>(value, delay)` untuk menahan trigger request saat dragging slider skenario. |
| `frontend-nasa/src/App.tsx` | UPDATE | Mengganti `useEffect` fetching manual dengan `useFieldsQuery` dan `useStrategiesQuery`, menyinkronkan status `dataMode` ('live' \| 'snapshot') dan `isFetching` status. |
| `frontend-nasa/src/features/strategy-comparison/StrategyBoard.tsx` | UPDATE | Menambahkan indikator status visual subtle (`isFetching` shimmering badge "Memperbarui strategi simulasi...") tanpa mengganti card (mencegah layout jump). |
| `frontend-nasa/src/features/map/FloatingMapHeader.tsx` | UPDATE | Menampilkan badge status data satelit yang interaktif (e.g. `🟢 NASA Live` vs `⚡ Snapshot Cached`) yang dapat diklik untuk membuka modal sumber data. |
| `frontend-nasa/src/features/rotations/rotationsQuery.test.ts` | CREATE | Unit test untuk validasi debounce, query keys, fallback snapshot data, dan adapter data. |

---

## 4. Implementation Tasks

### Task 1: QueryClient & Infrastructure Setup
- **Action**: Buat `src/api/queryClient.ts` dan bungkus aplikasi di `src/main.tsx` dengan `QueryClientProvider`.
- **Mirror**: Konfigurasi standar TanStack Query v5 dengan `staleTime: 1000 * 60 * 5` (5 menit) dan `refetchOnWindowFocus: false`.
- **Validate**: `npm --prefix frontend-nasa run build` & cek app render di browser.

### Task 2: Custom React Query Hooks (`useFieldsQuery`, `useStrategiesQuery`)
- **Action**:
  - Implementasikan hook `useDebounce` untuk menahan frekuensi request slider skenario (300ms).
  - Buat hook `useFieldsQuery()` dengan `initialData: MOCK_FIELDS` dan fallback transparan ke snapshot jika backend unreachable.
  - Buat hook `useStrategiesQuery({ site, phase, fieldId, scenario, baseline })` dengan query key berstruktur `['strategies', site, phase, fieldId, debouncedScenario, baselineKey]`.
  - Gunakan `placeholderData: keepPreviousData` agar kartu strategi lama tetap terlihat selama request baru berjalan.
- **Mirror**: `src/api/fieldshift.ts` adapter functions `toField` dan `toStrategies`.
- **Validate**: `npm --prefix frontend-nasa test`.

### Task 3: App.tsx Harmonization with React Query
- **Action**:
  - Refactor `App.tsx` untuk mengonsumsi data dari `useFieldsQuery` dan `useStrategiesQuery`.
  - Hubungkan `isFetching` dan `dataMode` ke status header dan workspace.
  - Pertahankan arsitektur `selectedField: null` (regional basin overview) dan search deep-linking hash yang sudah lolos uji.
- **Mirror**: Immutability dan guards di `App.tsx:17-25`.
- **Validate**: `npm --prefix frontend-nasa test` & `npm --prefix frontend-nasa run lint`.

### Task 4: In-Place Visual Feedback & Data Source Indicator
- **Action**:
  - Tambahkan indikator shimmering/subtle badge `"Memperbarui rekomendasi..."` pada `StrategyBoard` saat `isFetching && isPlaceholderData`.
  - Perjelas badge status pada `FloatingMapHeader` (`Live NASA API` / `Cached Snapshot`) dengan tooltip informatif dan link ke modal 26 Data Sources.
- **Mirror**: Desain palet AgriPluse (`#237F8E`, `#E3F1F3`, frosted glass).
- **Validate**: Cek tampilan visual dan responsiveness tanpa jumping layout.

### Task 5: Testing & Verification
- **Action**: Tulis unit test di `rotationsQuery.test.ts` untuk memastikan:
  - Cache key mengisolasi parameter iklim dan field ID secara presisi.
  - Debounce bekerja dengan benar.
  - Fallback offline data snapshot terpanggil dengan aman saat backend offline.
- **Validate**: `npm --prefix frontend-nasa test` (100% pass) dan `npm --prefix frontend-nasa run build`.

---

## 5. Validation Commands
```bash
# 1. Run unit tests
npm --prefix frontend-nasa test -- --run

# 2. Run ESLint checks
npm --prefix frontend-nasa run lint

# 3. Verify TypeScript types and Vite production build
npm --prefix frontend-nasa run build
```

---

## 6. Risks & Mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| Slider iklim memicu banjir HTTP request ke backend | Low | Ditahan dengan `useDebounce` (300ms) sebelum query key berubah. |
| Layar berkedip atau layout jumping saat parameter diubah | Low | Menggunakan `placeholderData: keepPreviousData` dari React Query v5. |
| Backend offline saat pengujian lokal | High | Transparansi fallback otomatis ke `snapshot.json` (output nyata NASA POWER & HWSD tersimpan). |
| Race condition saat berpindah petak dengan cepat | Low | React Query membatalkan promise yang out-of-date via query keys dan AbortController. |

---

## 7. Acceptance Criteria
- [ ] `QueryClientProvider` aktif dan mengelola state caching server.
- [ ] Perubahan slider skenario iklim dan rotasi dasar mengalir reaktif dengan debounce 300ms ke backend tanpa layout jump.
- [ ] Status koneksi (`Live API` vs `Offline Snapshot`) tampil elegan di header dan informatif bagi user.
- [ ] Zero regression pada 3D Map Viewport, HUD navigasi, dan search deep linking.
- [ ] Seluruh unit test, linting, dan build lulus 100%.

# Implementation status: all 86 scenarios

**Source:** `src/config/scenarioMatrix.ts` (base + variant matrix), `src/app/routes/ScenarioPage.tsx`, `src/app/routes/picker-variants/`, `src/components/picker-adapters/`.

Picker variants exist only for DS1, DS2, DS3, DS6. Month-year and year-only (DS4, DS5) have no picker variants (dropdown-only bases; no logical day-picker variant).

---

## Summary

| Category | Count | UI / Adapter |
|----------|-------|--------------|
| **Base scenarios** (no picker variant) | 6 | App’s own components (SimpleCalendar, CalendarPopover, dropdowns) |
| **Picker variants with real embedded picker** | 8 | Flatpickr (4) + React Datepicker (4) |
| **Picker variants with fallback inputs** | 72 | FallbackAdapter (native/text From–To or range inputs) |

**Total: 6 + 80 = 86 scenarios.**

---

## Table 1: Base scenarios + variant scenarios with status = Real

Base scenarios use the app’s own calendar UI; Real variants use an embedded third-party picker (Flatpickr or React Datepicker).

| # | Scenario ID | Base / variant | Adapter / implementation |
|---|-------------|----------------|---------------------------|
| 1 | `presets` | Base | App UI — PresetsScenario (SimpleCalendar + presets) |
| 2 | `from-to` | Base | App UI — FromToScenario (CalendarPopover) |
| 3 | `dual-calendar` | Base | App UI — DualCalendarScenario (two SimpleCalendars) |
| 4 | `month-year` | Base | App UI — MonthYearScenario (dropdowns) |
| 5 | `year-only` | Base | App UI — YearOnlyScenario (dropdown) |
| 6 | `inline-calendar` | Base | App UI — InlineCalendarScenario (inline SimpleCalendar) |
| 7 | DS1-FLATPICKR | Variant | **FlatpickrAdapter** — Presets layout, range + inline for custom |
| 8 | DS1-REACT_DATEPICKER | Variant | **ReactDatepickerAdapter** — Presets layout, range + inline for custom |
| 9 | DS2-FLATPICKR | Variant | **FlatpickrAdapter** — From/To layout, two single-date pickers |
| 10 | DS2-REACT_DATEPICKER | Variant | **ReactDatepickerAdapter** — From/To layout, two single-date pickers |
| 11 | DS3-FLATPICKR | Variant | **FlatpickrAdapter** — Dual layout, one range picker (non-inline) |
| 12 | DS3-REACT_DATEPICKER | Variant | **ReactDatepickerAdapter** — Dual layout, one range picker |
| 13 | DS6-FLATPICKR | Variant | **FlatpickrAdapter** — Inline layout, range + inline |
| 14 | DS6-REACT_DATEPICKER | Variant | **ReactDatepickerAdapter** — Inline layout, range + inline |

**Total: 6 base + 8 variant = 14 scenarios with Real / app UI.**

---

## Table 2: Variant scenarios with status = Fallback (with reason)

These variants use **FallbackAdapter** because no embedded adapter is implemented for that picker type. The UI is one or two native/text date inputs (no third-party calendar widget).

| # | Scenario ID | Picker (display name) | Reason for fallback |
|---|-------------|------------------------|----------------------|
| 1 | DS1-PIKADAY | Pikaday | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 2 | DS1-AIR_DATEPICKER | Air Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 3 | DS1-JQUERY_UI | jQuery UI Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 4 | DS1-BOOTSTRAP_UX | Bootstrap Datepicker (uxsolutions) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 5 | DS1-DATERANGEPICKER | DateRangePicker (Dan Grossman) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 6 | DS1-LITEPICKER | Litepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 7 | DS1-MUI | MUI DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 8 | DS1-ANTD | Ant Design DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 9 | DS1-REACT_DAY_PICKER | React Day Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 10 | DS1-ANGULAR_MATERIAL | Angular Material Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 11 | DS1-PRIMENG | PrimeNG DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 12 | DS1-KENDO | Kendo UI Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 13 | DS1-SYNCFUSION | Syncfusion DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 14 | DS1-DEVEXPRESS | DevExpress Date Editor | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 15 | DS1-CARBON | Carbon Design DatePicker (IBM) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 16 | DS1-CLARITY | Clarity Datepicker (VMware) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 17 | DS1-SEMANTIC_UI | Semantic UI Calendar | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 18 | DS1-MOBISCROLL | Mobiscroll Date Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 19 | DS1-IONIC | Ionic DateTime Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 20 | DS2-PIKADAY | Pikaday | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 21 | DS2-AIR_DATEPICKER | Air Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 22 | DS2-JQUERY_UI | jQuery UI Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 23 | DS2-BOOTSTRAP_UX | Bootstrap Datepicker (uxsolutions) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 24 | DS2-DATERANGEPICKER | DateRangePicker (Dan Grossman) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 25 | DS2-LITEPICKER | Litepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 26 | DS2-MUI | MUI DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 27 | DS2-ANTD | Ant Design DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 28 | DS2-REACT_DAY_PICKER | React Day Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 29 | DS2-ANGULAR_MATERIAL | Angular Material Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 30 | DS2-PRIMENG | PrimeNG DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 31 | DS2-KENDO | Kendo UI Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 32 | DS2-SYNCFUSION | Syncfusion DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 33 | DS2-DEVEXPRESS | DevExpress Date Editor | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 34 | DS2-CARBON | Carbon Design DatePicker (IBM) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 35 | DS2-CLARITY | Clarity Datepicker (VMware) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 36 | DS2-SEMANTIC_UI | Semantic UI Calendar | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 37 | DS2-MOBISCROLL | Mobiscroll Date Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 38 | DS2-IONIC | Ionic DateTime Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 39 | DS3-PIKADAY | Pikaday | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 40 | DS3-AIR_DATEPICKER | Air Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 41 | DS3-JQUERY_UI | jQuery UI Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 42 | DS3-BOOTSTRAP_UX | Bootstrap Datepicker (uxsolutions) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 43 | DS3-DATERANGEPICKER | DateRangePicker (Dan Grossman) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 44 | DS3-LITEPICKER | Litepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 45 | DS3-MUI | MUI DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 46 | DS3-ANTD | Ant Design DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 47 | DS3-REACT_DAY_PICKER | React Day Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 48 | DS3-ANGULAR_MATERIAL | Angular Material Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 49 | DS3-PRIMENG | PrimeNG DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 50 | DS3-KENDO | Kendo UI Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 51 | DS3-SYNCFUSION | Syncfusion DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 52 | DS3-DEVEXPRESS | DevExpress Date Editor | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 53 | DS3-CARBON | Carbon Design DatePicker (IBM) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 54 | DS3-CLARITY | Clarity Datepicker (VMware) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 55 | DS3-SEMANTIC_UI | Semantic UI Calendar | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 56 | DS3-MOBISCROLL | Mobiscroll Date Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 57 | DS3-IONIC | Ionic DateTime Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 58 | DS6-PIKADAY | Pikaday | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 59 | DS6-AIR_DATEPICKER | Air Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 60 | DS6-JQUERY_UI | jQuery UI Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 61 | DS6-BOOTSTRAP_UX | Bootstrap Datepicker (uxsolutions) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 62 | DS6-DATERANGEPICKER | DateRangePicker (Dan Grossman) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 63 | DS6-LITEPICKER | Litepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 64 | DS6-MUI | MUI DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 65 | DS6-ANTD | Ant Design DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 66 | DS6-REACT_DAY_PICKER | React Day Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 67 | DS6-ANGULAR_MATERIAL | Angular Material Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 68 | DS6-PRIMENG | PrimeNG DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 69 | DS6-KENDO | Kendo UI Datepicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 70 | DS6-SYNCFUSION | Syncfusion DatePicker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 71 | DS6-DEVEXPRESS | DevExpress Date Editor | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 72 | DS6-CARBON | Carbon Design DatePicker (IBM) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 73 | DS6-CLARITY | Clarity Datepicker (VMware) | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 74 | DS6-SEMANTIC_UI | Semantic UI Calendar | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 75 | DS6-MOBISCROLL | Mobiscroll Date Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |
| 76 | DS6-IONIC | Ionic DateTime Picker | No embedded adapter; FallbackAdapter (native/text inputs) used. |

**Reason (all rows):** Only **FLATPICKR** and **REACT_DATEPICKER** have embedded adapters in `picker-adapters/`. All other picker types are unmapped and resolve to **FallbackAdapter**, which renders one or two native/text date inputs instead of the third-party calendar widget.

**Total: 76 fallback scenarios** (DS1, DS2, DS3, DS6 × 19 pickers each; 21 pickers in registry minus 2 Real = 19 fallback pickers).

---

## 1. Base scenarios (6) — route: `/statements/:scenarioId`

Implemented with the app’s built-in UI (no third-party date picker library).

| # | Scenario ID | Route slug | Implementation |
|---|-------------|------------|----------------|
| 1 | `presets` | `/statements/presets` | **PresetsScenario** — preset buttons + SimpleCalendar in PickerContainer; custom range toggles calendar |
| 2 | `from-to` | `/statements/from-to` | **FromToScenario** — two fields with CalendarPopover (SimpleCalendar) for From/To |
| 3 | `dual-calendar` | `/statements/dual-calendar` | **DualCalendarScenario** — two SimpleCalendars side-by-side in PickerContainer |
| 4 | `month-year` | `/statements/month-year` | **MonthYearScenario** — month + year dropdowns only (no day picker) |
| 5 | `year-only` | `/statements/year-only` | **YearOnlyScenario** — single fiscal-year dropdown |
| 6 | `inline-calendar` | `/statements/inline-calendar` | **InlineCalendarScenario** — single inline SimpleCalendar for range in PickerContainer |

---

## 2. Picker-variant scenarios (80) — route: `/statements/:picker/:baseScenario`

Each variant is **DS&lt;n&gt;-&lt;PICKER&gt;** (e.g. `DS1-FLATPICKR`). Variants exist only for DS1, DS2, DS3, DS6. Layout is chosen by **base scenario**; the actual date control is chosen by **picker type** (adapter or fallback).

### Adapter resolution (`getPickerAdapterComponent(pickerType)`)

- **FLATPICKR** → **FlatpickrAdapter** (real)
- **REACT_DATEPICKER** → **ReactDatepickerAdapter** (real)
- **All other 19 picker codes** → **FallbackAdapter** (one or two native/text inputs; no embedded third-party widget)

### By base scenario (DS1, DS2, DS3, DS6 only)

| Base | Layout component | Uses adapter? | Scenario count |
|------|------------------|---------------|----------------|
| **DS1** (Presets) | VariantPresetsLayout | Yes (range, inline for custom) | 20 |
| **DS2** (From–To) | VariantFromToLayout | Yes (two single-date) | 20 |
| **DS3** (Dual calendar) | VariantDualLayout | Yes (one range, non-inline) | 20 |
| **DS6** (Inline calendar) | VariantInlineLayout | Yes (one range, inline) | 20 |

---

## 3. Per-variant status (80 rows)

Picker registry order: FLATPICKR, PIKADAY, AIR_DATEPICKER, JQUERY_UI, BOOTSTRAP_UX, DATERANGEPICKER, LITEPICKER, REACT_DATEPICKER, MUI, ANTD, REACT_DAY_PICKER, ANGULAR_MATERIAL, PRIMENG, KENDO, SYNCFUSION, DEVEXPRESS, CARBON, CLARITY, SEMANTIC_UI, MOBISCROLL, IONIC.

**Legend:**  
- **Real** = Flatpickr or React Datepicker adapter (embedded widget).  
- **Fallback** = FallbackAdapter (native/text inputs only).

| Scenario ID | Base | Picker | Status |
|-------------|------|--------|--------|
| DS1-FLATPICKR | Presets | Flatpickr | Real |
| DS1-PIKADAY | Presets | Pikaday | Fallback |
| DS1-AIR_DATEPICKER | Presets | Air Datepicker | Fallback |
| DS1-JQUERY_UI | Presets | jQuery UI Datepicker | Fallback |
| DS1-BOOTSTRAP_UX | Presets | Bootstrap Datepicker | Fallback |
| DS1-DATERANGEPICKER | Presets | DateRangePicker | Fallback |
| DS1-LITEPICKER | Presets | Litepicker | Fallback |
| DS1-REACT_DATEPICKER | Presets | React Datepicker | Real |
| DS1-MUI | Presets | MUI DatePicker | Fallback |
| DS1-ANTD | Presets | Ant Design DatePicker | Fallback |
| DS1-REACT_DAY_PICKER | Presets | React Day Picker | Fallback |
| DS1-ANGULAR_MATERIAL | Presets | Angular Material | Fallback |
| DS1-PRIMENG | Presets | PrimeNG DatePicker | Fallback |
| DS1-KENDO | Presets | Kendo UI Datepicker | Fallback |
| DS1-SYNCFUSION | Presets | Syncfusion DatePicker | Fallback |
| DS1-DEVEXPRESS | Presets | DevExpress Date Editor | Fallback |
| DS1-CARBON | Presets | Carbon Design (IBM) | Fallback |
| DS1-CLARITY | Presets | Clarity (VMware) | Fallback |
| DS1-SEMANTIC_UI | Presets | Semantic UI Calendar | Fallback |
| DS1-MOBISCROLL | Presets | Mobiscroll | Fallback |
| DS1-IONIC | Presets | Ionic DateTime | Fallback |
| DS2-FLATPICKR | From–To | Flatpickr | Real |
| DS2-PIKADAY | From–To | Pikaday | Fallback |
| DS2-AIR_DATEPICKER | From–To | Air Datepicker | Fallback |
| DS2-JQUERY_UI | From–To | jQuery UI Datepicker | Fallback |
| DS2-BOOTSTRAP_UX | From–To | Bootstrap Datepicker | Fallback |
| DS2-DATERANGEPICKER | From–To | DateRangePicker | Fallback |
| DS2-LITEPICKER | From–To | Litepicker | Fallback |
| DS2-REACT_DATEPICKER | From–To | React Datepicker | Real |
| DS2-MUI | From–To | MUI DatePicker | Fallback |
| DS2-ANTD | From–To | Ant Design DatePicker | Fallback |
| DS2-REACT_DAY_PICKER | From–To | React Day Picker | Fallback |
| DS2-ANGULAR_MATERIAL | From–To | Angular Material | Fallback |
| DS2-PRIMENG | From–To | PrimeNG DatePicker | Fallback |
| DS2-KENDO | From–To | Kendo UI Datepicker | Fallback |
| DS2-SYNCFUSION | From–To | Syncfusion DatePicker | Fallback |
| DS2-DEVEXPRESS | From–To | DevExpress Date Editor | Fallback |
| DS2-CARBON | From–To | Carbon Design (IBM) | Fallback |
| DS2-CLARITY | From–To | Clarity (VMware) | Fallback |
| DS2-SEMANTIC_UI | From–To | Semantic UI Calendar | Fallback |
| DS2-MOBISCROLL | From–To | Mobiscroll | Fallback |
| DS2-IONIC | From–To | Ionic DateTime | Fallback |
| DS3-FLATPICKR | Dual calendar | Flatpickr | Real |
| DS3-PIKADAY | Dual calendar | Pikaday | Fallback |
| DS3-AIR_DATEPICKER | Dual calendar | Air Datepicker | Fallback |
| DS3-JQUERY_UI | Dual calendar | jQuery UI Datepicker | Fallback |
| DS3-BOOTSTRAP_UX | Dual calendar | Bootstrap Datepicker | Fallback |
| DS3-DATERANGEPICKER | Dual calendar | DateRangePicker | Fallback |
| DS3-LITEPICKER | Dual calendar | Litepicker | Fallback |
| DS3-REACT_DATEPICKER | Dual calendar | React Datepicker | Real |
| DS3-MUI | Dual calendar | MUI DatePicker | Fallback |
| DS3-ANTD | Dual calendar | Ant Design DatePicker | Fallback |
| DS3-REACT_DAY_PICKER | Dual calendar | React Day Picker | Fallback |
| DS3-ANGULAR_MATERIAL | Dual calendar | Angular Material | Fallback |
| DS3-PRIMENG | Dual calendar | PrimeNG DatePicker | Fallback |
| DS3-KENDO | Dual calendar | Kendo UI Datepicker | Fallback |
| DS3-SYNCFUSION | Dual calendar | Syncfusion DatePicker | Fallback |
| DS3-DEVEXPRESS | Dual calendar | DevExpress Date Editor | Fallback |
| DS3-CARBON | Dual calendar | Carbon Design (IBM) | Fallback |
| DS3-CLARITY | Dual calendar | Clarity (VMware) | Fallback |
| DS3-SEMANTIC_UI | Dual calendar | Semantic UI Calendar | Fallback |
| DS3-MOBISCROLL | Dual calendar | Mobiscroll | Fallback |
| DS3-IONIC | Dual calendar | Ionic DateTime | Fallback |
| DS6-FLATPICKR | Inline calendar | Flatpickr | Real |
| DS6-REACT_DATEPICKER | Inline calendar | React Datepicker | Real |
| DS6-PIKADAY … DS6-IONIC (other 18) | Inline calendar | — | Fallback |

---

## 4. Complete list: all 86 scenario IDs and status

**Base (6):** `presets` · `from-to` · `dual-calendar` · `month-year` · `year-only` · `inline-calendar` — all **Base (app UI)**.

**Variants (80):** For base DS1, DS2, DS3, DS6 only and each picker P in the registry: **DS1-P, DS2-P, DS3-P, DS6-P** — Real if P ∈ {FLATPICKR, REACT_DATEPICKER}; else Fallback. DS4 (month-year) and DS5 (year-only) have no picker variants.

So: 8 Real, 72 Fallback, 6 Base. **Total: 86.**

---

## 5. Where it's implemented in code

- **Base (6):** `ScenarioPage.tsx` → `PresetsScenario`, `FromToScenario`, `DualCalendarScenario`, `MonthYearScenario`, `YearOnlyScenario`, `InlineCalendarScenario`.
- **Variants (80):** `ScenarioPage.tsx` → `PickerVariantScene(scenarioId)` → `picker-variants/PickerVariantScene.tsx` switches on `metadata.baseScenario` (DS1, DS2, DS3, DS6) to pick layout; each layout uses `getPickerAdapterComponent(pickerType)` from `picker-adapters/index.tsx`.
- **Generic fallback:** If a scenario id is unknown or not base and not variant, `GenericScenarioContent()` is shown.

---

## 6. Counts at a glance

- **Real embedded picker:** 8 — DS1, DS2, DS3, DS6 × FLATPICKR and REACT_DATEPICKER.
- **Fallback (inputs only):** 72 — DS1, DS2, DS3, DS6 × the other 19 pickers.
- **Base (app UI):** 6.

**Total: 6 + 80 = 86 scenarios.**

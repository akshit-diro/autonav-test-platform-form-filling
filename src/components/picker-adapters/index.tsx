import type { ComponentType } from 'react'
import type { PickerAdapterProps } from './types'
import { AirDatepickerAdapter } from './AirDatepickerAdapter'
import { FlatpickrAdapter } from './FlatpickrAdapter'
import { ReactDatepickerAdapter } from './ReactDatepickerAdapter'
import { ReactDayPickerAdapter } from './ReactDayPickerAdapter'
import { PikadayAdapter } from './PikadayAdapter'
import { LitepickerAdapter } from './LitepickerAdapter'
import { JQueryUIDatepickerAdapter } from './JQueryUIDatepickerAdapter'
import { BootstrapUXAdapter } from './BootstrapUXAdapter'
import { DateRangePickerAdapter } from './DateRangePickerAdapter'
import { MuiDatepickerAdapter } from './MuiDatepickerAdapter'
import { AntdDatepickerAdapter } from './AntdDatepickerAdapter'
import { PrimeNGDatepickerAdapter } from './PrimeNGDatepickerAdapter'
import { AngularMaterialAdapter } from './AngularMaterialAdapter'
import { KendoDatepickerAdapter } from './KendoDatepickerAdapter'
import { SyncfusionDatepickerAdapter } from './SyncfusionDatepickerAdapter'
import { FallbackAdapter } from './FallbackAdapter'

const PICKER_ADAPTER_MAP: Record<string, ComponentType<PickerAdapterProps>> = {
  AIR_DATEPICKER: AirDatepickerAdapter,
  BOOTSTRAP_UX: BootstrapUXAdapter,
  FLATPICKR: FlatpickrAdapter,
  REACT_DATEPICKER: ReactDatepickerAdapter,
  REACT_DAY_PICKER: ReactDayPickerAdapter,
  PIKADAY: PikadayAdapter,
  LITEPICKER: LitepickerAdapter,
  JQUERY_UI: JQueryUIDatepickerAdapter,
  DATERANGEPICKER: DateRangePickerAdapter,
  MUI: MuiDatepickerAdapter,
  ANTD: AntdDatepickerAdapter,
  PRIMENG: PrimeNGDatepickerAdapter,
  ANGULAR_MATERIAL: AngularMaterialAdapter,
  KENDO: KendoDatepickerAdapter,
  SYNCFUSION: SyncfusionDatepickerAdapter,
}

export type PickerType = string

export function getPickerAdapterComponent(pickerType: string): ComponentType<PickerAdapterProps> {
  return PICKER_ADAPTER_MAP[pickerType] ?? FallbackAdapter
}

export { AirDatepickerAdapter, BootstrapUXAdapter, FlatpickrAdapter, ReactDatepickerAdapter, ReactDayPickerAdapter, PikadayAdapter, LitepickerAdapter, JQueryUIDatepickerAdapter, DateRangePickerAdapter, MuiDatepickerAdapter, AntdDatepickerAdapter, PrimeNGDatepickerAdapter, AngularMaterialAdapter, KendoDatepickerAdapter, SyncfusionDatepickerAdapter, FallbackAdapter }
export type { PickerAdapterProps, PickerAdapterMode } from './types'

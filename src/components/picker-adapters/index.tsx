import type { ComponentType } from 'react'
import type { PickerAdapterProps } from './types'
import { FlatpickrAdapter } from './FlatpickrAdapter'
import { ReactDatepickerAdapter } from './ReactDatepickerAdapter'
import { ReactDayPickerAdapter } from './ReactDayPickerAdapter'
import { PikadayAdapter } from './PikadayAdapter'
import { LitepickerAdapter } from './LitepickerAdapter'
import { FallbackAdapter } from './FallbackAdapter'

const PICKER_ADAPTER_MAP: Record<string, ComponentType<PickerAdapterProps>> = {
  FLATPICKR: FlatpickrAdapter,
  REACT_DATEPICKER: ReactDatepickerAdapter,
  REACT_DAY_PICKER: ReactDayPickerAdapter,
  PIKADAY: PikadayAdapter,
  LITEPICKER: LitepickerAdapter,
}

export type PickerType = string

export function getPickerAdapterComponent(pickerType: string): ComponentType<PickerAdapterProps> {
  return PICKER_ADAPTER_MAP[pickerType] ?? FallbackAdapter
}

export { FlatpickrAdapter, ReactDatepickerAdapter, ReactDayPickerAdapter, PikadayAdapter, LitepickerAdapter, FallbackAdapter }
export type { PickerAdapterProps, PickerAdapterMode } from './types'

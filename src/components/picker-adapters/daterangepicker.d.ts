/**
 * Type declaration for daterangepicker jQuery plugin (Dan Grossman).
 * Plugin augments jQuery with .daterangepicker().
 */
import type moment from 'moment'

export interface DaterangepickerLocaleOptions {
  format?: string
  firstDay?: number
  [key: string]: unknown
}

export interface DaterangepickerOptions {
  startDate?: moment.Moment | Date | string
  endDate?: moment.Moment | Date | string
  minDate?: moment.Moment | Date | string
  maxDate?: moment.Moment | Date | string
  singleDatePicker?: boolean
  autoUpdateInput?: boolean
  locale?: DaterangepickerLocaleOptions
  [key: string]: unknown
}

declare global {
  interface JQuery {
    daterangepicker(options?: DaterangepickerOptions, callback?: (start: moment.Moment, end: moment.Moment, label: string) => void): JQuery
    daterangepicker(method: 'setStartDate', date: moment.Moment | Date | string): JQuery
    daterangepicker(method: 'setEndDate', date: moment.Moment | Date | string): JQuery
  }
}

export {}

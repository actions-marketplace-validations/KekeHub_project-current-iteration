import {Dayjs} from 'dayjs'

export type Settings = SingleSelect & IterationSelect

export interface IterationSelect {
  configuration: {
    duration: number
    start_day: number
    iterations: Iteration[]
  }
}

export interface Iteration {
  id: string
  title: string
  duration: number
  start_date: Dayjs
  title_html: string
}

export interface SingleSelect {
  options: SingleSelectOption[]
}

export interface SingleSelectOption {
  id: string
  name: string
  name_html: string
}

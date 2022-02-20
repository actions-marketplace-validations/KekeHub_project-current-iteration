import {IterationSelect, Settings} from './settings'

export interface Field {
  id: string
  name: string
  settings?: Settings
}

export interface IteratorField {
  id: string
  name: string
  settings: IterationSelect
}

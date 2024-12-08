import { makeAutoObservable } from "mobx";
import { ReceptionStore } from "./reception.store";
import { Request, Undef } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";


export const suggest_apikey = '8a2b4c15-2dd5-446b-913b-246f1759bed5'

class SuggestitionStore {
  constructor(readonly root: ReceptionStore) {
    makeAutoObservable(this, {}, { autoBind: true }) 
  }

  list: GeoSuggest['results'] = []
  setList = (list: GeoSuggest['results']) => { this.list = list }
  
  geoSuggest = new Request(async (state, setState, text: string) => {
    setState('LOADING')
    this.setList([])
    const body: Undef<GeoSuggest> = await http.get(
      'https://suggest-maps.yandex.ru/v1/suggest', {
      apikey: suggest_apikey,
      print_address: 1,
      types:'house',
      text,
    })
    if(body?.results) {
      this.setList(body.results)
      setState('COMPLETED')
    } else {
      setState('FAILED')
      logger.log('Не нашли подсказки', 'geoSuggest')
    }
  })
}

export default SuggestitionStore;

export type GeoSuggest = {
  suggest_reqid: string,
  results: Array<{
    title: {
      /** "улица Рабкоров, 20" */
      text: string,
      hl: {
        begin: number,
        end: number
      }[]
    },
    subtitle: {
      /** "Уфа, Республика Башкортостан" */ 
      text: string,
      hl: {
        begin: number,
        end: number
      }[]
    },
    tags: string[],
    distance: {
      value: number,
      text: string
    },
    address: {
      /** Республика Башкортостан, Уфа, улица Рабкоров, 20А */
      formatted_address: string,
      component: {
        name: string,
        kind: ["COUNTRY" | "PROVINCE" | "LOCALITY" | "STREET" | "HOUSE"]
      }[]
    }
  }>
}
import { makeAutoObservable } from "mobx";
import { Request } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import { ReceptionStore } from "./reception.store";

class EmployeesStore {
  constructor(readonly parrent: ReceptionStore) {
    makeAutoObservable(this)
  }


  /** это сами сотрудники, в основном повара */
  cooks: Cook[] = []
  setCooks(cooks: Cook[]) { this.cooks = cooks }

  /** api скачать поваров */
  loadCooks = new Request(async (state, setState, orgID: number) => {
    setState('LOADING')
    try {
      const data: [Cook[]] = await http.get('/getShopInfo/' + orgID);
      data[0]
        ? this.setCooks(data[0])
        : this.setCooks([])
      
      setState('COMPLETED')
    } catch (err) {
      logger.error(err, 'reception')
      setState('FAILED')
    }
  })

  /* api отзывы на повара */
  loadCookReviews = new Request(async (
    state,
    setState,
    cook: Cook
  ) => {
    const point = this.parrent.OrgForMenu
    try{
      setState('LOADING')
      const response: any = await http.get(`getShopInfo/${point}/${cook.UserId}`)
      setState('COMPLETED')
      return Array.isArray(response)
        ? response
        : []
    } catch(e) {
      setState('FAILED')
    }
  })
  /** popup для просмотра повара и отзывов */
  watchCockPopup = new Popup<Cook, CookReview[]>({
    onOpen: async (cook, save) => {
      const reviews = await this.loadCookReviews.run(cook)
      if(reviews?.[0]) save(reviews[0])
    },
  })
}

export default EmployeesStore


/** Работник */
export type Cook = {
  UserId: string,
  Rating: number,
  FirstName: string,
  NameWork: string,
  Image: string
}



/** отзыв на каждое блюдо работника */
export type CookReview = { 
  Rating: number
  /** название категории */
  Category: string,
  /** название блюда */
  Course: string,
  /** название сотрудника */
  FIO: string,
  /** 2023-08-15T15:53:23.745Z */
  Date: string, 
  /** "79174308652" */
  Phone: string,
}

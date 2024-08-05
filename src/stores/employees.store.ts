import { makeAutoObservable } from "mobx";
import { Optional, Request } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import { ReceptionStore } from "./reception.store";

class EmployeesStore {
  constructor(readonly parrent: ReceptionStore) {
    makeAutoObservable(this)
  }
  cooks: Cook[] = []

  loadCooks = new Request(async (state, setState, orgID: number) => {
    setState('LOADING')
    try {
      const data: [Cook[]] = await http.get('/getShopInfo/' + orgID);
      this.cooks = [];
      data[0]?.forEach((cock) =>
        this.cooks.push(cock)
      )
      setState('COMPLETED')
    } catch (err) {
      logger.error(err, 'reception')
      setState('FAILED')
    }
  })

  
  async watchCook(cook: Cook) {
    this.selectedCock = cook
    this.loadCookReviews.run(cook)
    this.watchCockModal.open()
  }
  async closeCookWatch() {
    this.selectedCock = null
    this.selectedCockReviews = []
    this.watchCockModal.close()
  }

  loadCookReviews = new Request(async (
    state,
    setState,
    cook: Cook
  ) => {
    const point = this.parrent.OrgForMenu
    try{
      setState('LOADING')
      this.selectedCockReviews = []
      const response: any = await http.get(`getShopInfo/${point}/${cook.UserId}`);
      response.forEach((element: any) => {
        this.selectedCockReviews.push(element)
      });
      setState('COMPLETED')
    } catch(e) {
      setState('FAILED')
    }
  })

  otziviModal = new Popup();
  watchCockModal = new Popup();
  selectedCock: Optional<Cook> = null;
  selectedCockReviews: CookReviews[] = [];
}

export default EmployeesStore


/** Работник */
export type Cook = {
  UserId: string,
  Rating: number,
  FirstName: string,
  NameWork: string,
}



/** отзыв на каждое блюдо работника */
export type CookReviews = { 
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

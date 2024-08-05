import { makeAutoObservable } from "mobx";
import { Optional, Request, Undef } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import { ReceptionStore } from "./reception.store";


class MenuStore {
  constructor(readonly parrent: ReceptionStore) {
    makeAutoObservable(this)
  }

  
  categories: CategoryCourse[] = []
  /** выбранное блюдо, которое откроется в отдельном окошке */
  selectedCourse: Optional<CourseItem> = null;
  watchCourse(course: Optional<CourseItem>) {
    logger.log('Просматриваем блюдо ' + course?.Name, 'Main-Page-Store')
    this.selectedCourse = course;
    this.itemModal.open();
  }
  popular: CourseItem[] = []
  selections: Selection[] = []


  watchSelectionPopup = new Popup()
  selectedCollection: Optional<Selection> = null
  watchSelection(collection: Selection) {
    this.selectedCollection = collection
    this.watchSelectionPopup.open()
  }
  closeSelection() {
    this.selectedCollection = null
    this.watchSelectionPopup.close()
  }

  loadMenu = new Request(async (state, setState, orgID: number) => {
    setState('LOADING')
    try {
      const data: Undef<V3_userInfoResponse> = await http.get('/getUserMenu_v3/' + orgID);
      this.categories = [];
      this.popular = [];
      this.selections = [];
      if(data?.BaseMenu && data?.PopularMenu) {
        data.BaseMenu.forEach(category =>
          this.categories.push(category)
        )
        data.PopularMenu.forEach(couse =>
          this.popular.push(couse)
        )
        data.SelectionMenu.forEach(selection =>
          this.selections.push(selection)
        )
      }
      setState('COMPLETED');
    } catch (err) {
      logger.error(err, 'reception')
      setState('FAILED')
    }
  })

  itemModal = new Popup()
  otziviModal = new Popup()
  watchCockModal = new Popup()

  
  selectedCourseReviews: CourseOtzyv[] = []
  async watchOtzivi(course: CourseItem) {
    logger.log('Просматриваем отзывы', 'Main-Page-Store')
    this.selectedCourse = course;
    this.loadCourseReviews.run(course);
    this.otziviModal.open();
  }

  closeWatchOtzivi() {
    this.selectedCourse = null;
    this.selectedCourseReviews = [];
    this.otziviModal.close();
  }

  loadCourseReviews = new Request(async (
    state,
    setState,
    { VCode }: CourseItem
  ) => {
    try{
      setState('LOADING')
      this.selectedCourseReviews = []
      const orgId = this.parrent.OrgForMenu
      const response: Undef<CourseOtzyv[]> = await http.get(`getCourseRatingOrg/${VCode}/${orgId}`);
      if(response?.length) {
        response.forEach(otziv => {
          this.selectedCourseReviews.push(otziv)
        });
      }
      
      setState('COMPLETED')
    } catch(e) {
      setState('FAILED')
    }
  })
}

export default MenuStore



type V3_userInfoResponse = { 
  BaseMenu: CategoryCourse[]
  PopularMenu: CourseItem[]
  SelectionMenu: Selection[]
}

type Selection = {
  Name: string,
  VCode: string,
  Description: string,
  CourseList: CourseItem[],
  Image: string,
  Image2:string 
}

/** Тип блюда */
 export type CourseItem = {
  VCode: number,
  Name: string,
  CatVCode: number,
  Price: number,
  Quality: number,
  /**блюдо готовится на точке, работает без остатко */
  NoResidue: boolean,
  /** текущий остаток на точке */
  EndingOcResidue: number,
  CourseDescription: string,
  Weigth: string,
  Images: undefined | string[],
  CompressImages: undefined | string[],
}

/** Тип категории с блюдами */
type CategoryCourse = {
  VCode: number,
  Name: string,
  MenuVCode: number,
  CourseList: CourseItem[],
  /** пока нигде не используется */
  Quality: number,
}



type CourseOtzyv = {
  /** 2023-09-08T04:38:41.173Z */
  Date: string,
  /** "Жанна" */
  FIO: string,
  /** "79899559625" */
  Phone: string,
  /** "5" */
  Rating: string,
}
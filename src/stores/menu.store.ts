import { makeAutoObservable } from "mobx";
import { Optional, Request, Searcher, Undef } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import { ReceptionStore } from "./reception.store";


class MenuStore {
  constructor(readonly parrent: ReceptionStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }
  
  /** все блюда по категориям */
  categories: CategoryCourse[] = []
  setCategories(c: CategoryCourse[]) { this.categories = c }

  /** популярные блюда */
  popular: CourseItem[] = []
  setPopular(p: CourseItem[]) { this.popular = p }

  /** подборки */
  selections: Selection[] = []
  setSelections(s: Selection[]) { this.selections = s }

  getSelection = (vcode: string) => {
    return this.selections.find(item => item.VCode === vcode)
  }

  /** stories */
  stories: WebHistoty[] = []
  setStories(s: WebHistoty[]) { this.stories = s }


  loadMenu = new Request(async (state, setState, orgID: number) => {
    setState('LOADING')
    try {
      const data: Undef<V3_userInfoResponse> = await http.get('/getUserMenu_v3/' + orgID);
      if(data?.BaseMenu && data?.PopularMenu) {
        this.setCategories(data.BaseMenu)
        this.setPopular(data.PopularMenu)
        this.setSelections(data.SelectionMenu)
        this.setStories(data.WebHistoty)
      }
      setState('COMPLETED');
    } catch (err) {
      logger.error(err, 'reception')
      setState('FAILED')
    }
  })

  /** попап для просмотра подборки */
  selectionPopup = new Popup<Selection>()

  /** попап для просмотра блюда */
  coursePopup = new Popup<CourseItem, CourseReview[]>({
    onOpen: async (course, save) => { 
      const reviews = await this.loadCourseReviews.run(course)
      if(reviews?.[0]) save(reviews[0])
    },
  })

  /** попап для просмотра отзывов */
  courseReviewsPopup = new Popup<CourseItem, CourseReview[]>({
    onOpen: async (course, save) => { 
      const reviews = await this.loadCourseReviews.run(course)
      if(reviews?.[0]) save(reviews[0])
    },
  })

  /** попап для просмотра категории */
  categoryPopup = new Popup<CategoryCourse>()

  /** фиксированная менюшка с категориями */
  categoriesBar = new Popup()

  /** api отзывы на блюдо */
  loadCourseReviews = new Request(async (
    state,
    setState,
    { VCode }: CourseItem
  ) => {
    try{
      setState('LOADING')
      const orgId = this.parrent.OrgForMenu
      const response: Undef<[CourseReview[]]> = await http.get(`getCourseRatingOrg/${VCode}/${orgId}`)
      setState('COMPLETED')
      return response?.length
        ? response
        : []
    } catch(e) {
      setState('FAILED')
    }
  })

  dishSearcher = new Searcher(() => this.allDishes)
  get allDishes() {
    const result: CourseItem[] = []
    this.categories.forEach(category => 
      category.CourseList.forEach(couse => 
        result.push(couse)
      )
    )
    return result;
  }

  
  /** категория блюд которая видна на экране */
  visibleCategory: Optional<string> = null;
  setVisibleCategory(VCode: Optional<string>) {
    this.visibleCategory = VCode;
  }

  getDishByID(id: number | string) {
    let all: CourseItem[] = []
    this.categories.forEach(cat => 
      cat.CourseList.forEach(dish => 
        all.push(dish)
      )
    )
    return all.find(dish => dish.VCode == id)
  }
}

export default MenuStore



type V3_userInfoResponse = { 
  BaseMenu: CategoryCourse[]
  PopularMenu: CourseItem[]
  SelectionMenu: Selection[]
  WebHistoty: WebHistoty[]
}

export type WebHistoty = {
  NameHistory: string,
  ImageFront: string,
  listSlides: {
    link: Optional<string>,
    image: string
  }[]
}

export type Selection = {
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
  priceWithDiscount: any
  priceWithDiscountOld: any
}

/** Тип категории с блюдами */
export type CategoryCourse = {
  VCode: number,
  Name: string,
  MenuVCode: number,
  CourseList: CourseItem[],
  /** пока нигде не используется */
  Quality: number,
  /** "2A1315B1-2430-4817-8806-31FD61E5B7F3" | null */
  Image: Optional<string>
}



type CourseReview = {
  /** 2023-09-08T04:38:41.173Z */
  Date: string,
  /** "Жанна" */
  FIO: string,
  /** "79899559625" */
  Phone: string,
  /** "5" */
  Rating: string,
}
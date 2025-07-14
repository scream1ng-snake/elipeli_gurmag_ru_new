import { makeAutoObservable, reaction } from "mobx"
import moment from "moment"
import { Optional, Request } from "../features/helpers"
import { http } from "../features/http"
import { logger } from "../features/logger"
import Popup from "../features/modal"
import { CartStore } from "./cart.store"

/** класс для работы со слотами при доставке */
class Slots {
  constructor(private readonly cart: CartStore) {
    makeAutoObservable(this)
    setInterval(this.checkAvailableSlot, 500)

    this.getSlots.run()
  }

  selectedSlot: Optional<Slot> = null
  setSelectedSlot = (VCode: string) => { 
    const slot = this.computedSlots.find(s => s.VCode === VCode)
    if(slot) this.selectedSlot = slot 
  }


  private list: Slot[] = []
  private setList(slots: Slot[]) {
    this.list = slots
  }

  private availbaleSlots: Slot[] = []
  private isSlotActive = (slot: Slot) => {
    const [eHH, eMM] = moment(slot.EndTimeOfWork)
      .format('HH:mm')
      .split(':')
      .map(Number)

    const [nowHH, nowMM] = moment()
      .format('HH:mm')
      .split(':')
      .map(Number)

    const { fullCookTime, packageTime, deliveryTime } = this.cart

    return (nowHH * 60 + nowMM + fullCookTime + packageTime + deliveryTime) < (eHH * 60 + eMM)
  }

  getTimeString = (slot: Slot) =>
    moment(slot.Start).format('HH:mm') +
    ' - ' +
    moment(slot.End).format('HH:mm')

  private getSlots = new Request(async (state, setState) => {
    setState('LOADING')
    const slots: Slot[] = await http.get('/getActiveSlots')
    if (slots && Array.isArray(slots)) {
      this.setList(slots)
      this.checkAvailableSlot()
      setState('COMPLETED')
    } else {
      setState('FAILED')
      logger.error('Не удалось получить слоты')
    }
  })

  /** проверяем доступные слоты  */
  checkAvailableSlot = () => {
    const isToday = moment(this.cart.date).isSame(new Date(), 'day')
    if (isToday) {
      this.availbaleSlots = this.list.filter(this.isSlotActive)
      if (this.selectedSlot 
        && this.selectedSlot.VCode !== '-1'
        && !this.availbaleSlots.find(slot => slot.VCode === this.selectedSlot?.VCode)
      ) {
        this.selectedSlot = null
      }
    } else {
      this.availbaleSlots = this.list
    }
  }

  get computedSlots() {
    const isToday = moment(this.cart.date).isSame(new Date(), 'day')

    if(isToday) {
      const nearestSlot: Slot = { 
        VCode: '-1', 
        Name: 'Как можно быстрее',
        Start: '',
        End: '',
        EndTimeOfWork: '',
        StartCook: '',
      }
      return this.availbaleSlots.length
        ? [nearestSlot, ...this.availbaleSlots]
        : []
    } else {
      return this.availbaleSlots
    }
  }
}


type Slot = {
  /** example "6" */
  VCode: string,
  /** example "Вечер" */
  Name: string,
  /** example "1970-01-01T18:00:12.024Z" */
  Start: string,
  /** example "1970-01-01T21:00:14.726Z" */
  End: string,
  /** example "1970-01-01T17:00:22.619Z" */
  EndTimeOfWork: string,
  /** example "1970-01-01T17:00:22.588Z" */
  StartCook: string,
}

export default Slots
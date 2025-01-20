import { makeAutoObservable } from "mobx"
import { Optional } from "../features/helpers"
import LocationStore from "./location.store"
import Popup from "../features/modal"

/** адреса сохраненные локально и на бэке */
class SavedAdresses {
  private savedLocalKey = 'SAVED_ADDRS_LOCAL_KEY'

  /** адреса сохраненные в локал стораге */
  onLocal: Map<UUID, SavedAddressLocal> = new Map()
  
  /** адреса сохраненные на сервере */
  onServer: SavedAddress[] = []
  setServerAddresses(addresses: SavedAddress[]) { 
    this.onServer = addresses
  }

  addNewAddressToLocal = (address: SavedAddressLocal) => {
    this.onLocal.set(address.uuid, address)
    this.save()
  }

  private save = () => {
    localStorage.setItem(
      this.savedLocalKey, 
      JSON.stringify(Array.from(this.onLocal.entries()))
    )
  }

  page = new Popup()

  constructor(readonly location: LocationStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    
    const savedStr = localStorage.getItem(this.savedLocalKey)
    if(savedStr) {
      try {
        const data = new Map(JSON.parse(savedStr)) as Map<UUID, SavedAddressLocal>
        this.onLocal = data
      } catch (error) {
        console.error(error)
      }
    }
    this.page.open()
  }

  createNewLocalAddress = () => {
    const { location } = this
    const { reception } = location

    // location.inputingAddress = initial
    // reception.suggestitions.setList([])
    // location.inputingLocation = null
    // this.page.close()
  }
}
export default SavedAdresses

export type SavedAddress = {
  FullAddress: string,
  Default: Optional<number>,
  City: Optional<string>,
  street: string,
  house: string,
  /** Квартира */
  apartment?: Optional<string>,
  description?: Optional<string>,
  /** Подъезд */
  entrance?: Optional<string>,
  /** Этаж */
  storey?: Optional<string>,
  addrComment?: Optional<string>,
  incorrectAddress?: Optional<boolean>,
  lon: Optional<string>,
  lat: Optional<string>,
}

type UUID = string
export type SavedAddressLocal = SavedAddress & { uuid: UUID }
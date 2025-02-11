import { makeAutoObservable } from "mobx"
import { Optional, Request } from "../features/helpers"
import LocationStore from "./location.store"
import Popup from "../features/modal"
import { http } from "../features/http"

/** адреса сохраненные локально и на бэке */
class SavedAdresses {
  /** адреса сохраненные на сервере */
  onServer: Map<string, SavedAddress> = new Map()
  setServerAddresses(addresses: SavedAddress[]) { 
    this.onServer = new Map()
    addresses.forEach(addr => {
      this.onServer.set(addr.VCode, addr)
    })
  }



  page = new Popup()
  addressActions = new Popup()

  constructor(readonly location: LocationStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    this.page.open()
  }

  get isPending() {
    return this.editServerSavedAddress.state === 'LOADING'
      || this.deleteServerSavedAddress.state === 'LOADING'
  }
  

  async updateAddress() {
    const { InputingVcode, savedAdresses, inputingLocation, inputingAddress } = this.location
    const { road, house_number, entrance, storey, apartment, addrComment } = inputingAddress
    if(InputingVcode) {
      if(this.onServer.has(InputingVcode)) {
        await savedAdresses.editServerSavedAddress.run({
          fullAdress: this.location.addressToString(inputingAddress),
          city: null,
          street: road,
          house: house_number,
          apartment: apartment,
          description: '',
          entrance: entrance,
          storey: storey,
          addrComment: addrComment,
          lon: inputingLocation?.lon.toString(),
          lat: inputingLocation?.lat.toString(),
          defaultFlag: false,
          vcode: Number(InputingVcode)
        })
      } else {
        this.location.setInputingVcode(null)
        this.location.setConfirmedVcode()
      }
    }
  }

  editServerSavedAddress = new Request(async (state, setState, body: EditServerSavedAddr) => {
    try {
      setState('LOADING')
      const result: EditServerSavedAddrRes = await http.post('/TGUpdateClientAddress', body)
      if (result) {
        setState('COMPLETED')
        this.onServer.set(String(body.vcode), result)
      }
    } catch (error) {
      setState('FAILED')
      console.error(error)
    }
  })

  deleteServerSavedAddress = new Request(async (state, setState, vcode: string) => {
    try {
      setState('LOADING')
      const result: SavedAddress[] = await http.post('/TGDeleteClientAddress', { vcode })
      if(result && Array.isArray(result)) {
        this.setServerAddresses(result)
        setState('COMPLETED')
      }
    } catch (error) {
      setState('FAILED')
      console.error(error)
    }
  })
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
  VCode: string
}

type EditServerSavedAddr = {
  fullAdress: string,
  city: null,
  street: string,
  house: string,
  apartment: string | undefined,
  description: string | undefined,
  entrance: string | undefined,
  storey: string | undefined,
  addrComment: string | undefined,
  lon: string | undefined,
  lat: string | undefined,
  defaultFlag: boolean,
  vcode: number,
}

type EditServerSavedAddrRes = {
  FullAddress: string,
  Default: number,
  City: string,
  street: string,
  house: string,
  apartment: string,
  description: string,
  entrance: string,
  storey: string,
  addrComment: string,
  incorrectAddress: null,
  lon: string,
  lat: string,
  VCode: string,
}

type UUID = string
export type SavedAddressLocal = SavedAddress & { uuid: UUID }
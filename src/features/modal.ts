import { makeAutoObservable } from "mobx";
import { Optional, Undef } from "./helpers";

type PopupParams<Item, savedContentType = any> = Undef<{
  onOpen?: (item: Item, save: (content: savedContentType ) => void) => any
  onClose?: (item: Item) => any
}>
export default class Popup<I, I2 = any> {
  content: Optional<I> | Undef<I> = null
  private setContent = (content: Optional<I>) => {
    this.content = content
  }
  show = false
  constructor(readonly params?: PopupParams<I, I2>) {
    makeAutoObservable(this, {}, { autoBind: true });
  }
  open() {
    this.show = true
  }
  close() {
    this.show = false
    this.setContent(null)
    if(this.content) {
      this.params?.onClose?.(this.content)
      if(this.saved) this.saved = null
    }
  }
  watch(content: I) {
    this.setContent(content)
    this.params?.onOpen?.(content, this.saver)
    this.open()
  }

  saved: Optional<I2> = null
  private saver(content: I2) {
    this.saved = content
  }
}
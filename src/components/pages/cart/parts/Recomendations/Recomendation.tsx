import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useStore } from "../../../../../features/hooks"
import { RecomendationItemComponent } from "../../../main/parts/Menu/Categories/Categories"
import styles from '../../../main/parts/Menu/Categories/Categories.module.css'
const css: Record<string, CSSProperties> = {
  headText: {
    margin: '0px 14px 10px 25px',
    fontSize: 20
  }
}
const Recomendations: FC = observer(() => {
  const { cart, reception: { menu } } = useStore()
  const filtered_recomendations = menu.recomendations.filter(item => 
    !Boolean(cart.items.find(itemInCart => itemInCart.couse.VCode === item.VCode))
  )
  return <>
    {filtered_recomendations.length
      ? <h3 style={css.headText}>Добавить в заказ?</h3>
      : null
    }
    <div className={styles.recomendations_list}>
      {filtered_recomendations.map((recomendation) => {
        const cic = cart.countDiscountForCouses(recomendation)
        return <RecomendationItemComponent
          key={recomendation.VCode}
          course={recomendation}
          priceWithDiscount={cic.priceWithDiscount}
          haveCampaign={Boolean(cic.campaign)}
        />
      })}
    </div>
  </>
})
export default Recomendations
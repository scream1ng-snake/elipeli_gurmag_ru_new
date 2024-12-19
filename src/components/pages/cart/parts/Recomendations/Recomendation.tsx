import { Button, Image, Space } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useGoUTM, useStore } from "../../../../../features/hooks"
import config from "../../../../../features/config"
import { RecomendationItemComponent } from "../../../main/parts/Menu/Categories/Categories"
import styles from '../../../main/parts/Menu/Categories/Categories.module.css'
const css: Record<string, CSSProperties> = {
  headText: {
    margin: '22px 14px 10px 14px',
    fontSize: 18
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
      {filtered_recomendations.map((recomendation, index) =>
        <RecomendationItemComponent
          key={recomendation.VCode}
          course={recomendation}
        />
      )}
    </div>
  </>
})
export default Recomendations
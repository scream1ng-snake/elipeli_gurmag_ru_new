import { observer } from "mobx-react-lite";
import { FC } from "react";
import AdaptivePopup from "../common/Popup/Popup";
import { useStore } from "../../features/hooks";
import { Button, List, Space } from "antd-mobile";


const DeliveryPriceInfoPopup: FC = observer(() => {
  const { cart } = useStore()
  const { show, close } = cart.deliveryPriceInfoPopup
  return <AdaptivePopup 
    visible={show}
    onClose={close}
    noBottomNav
    noShtorka
    noCloseBtn
    bodyStyle={{
      borderRadius: 15,
      overflowY: 'hidden'
    }}
    mobileBodyStyle={{
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    }}
  >
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div 
        style={{
          width: 45,
          height: 5, 
          marginTop: 5,
          borderRadius: 100,
          background: 'rgba(179, 181, 180, 1)'
        }} 
      />
    </div>
    <p
      style={{
        fontFamily: 'Arial',
        fontWeight: '700',
        fontStyle: 'Bold',
        fontSize: '32px',
        lineHeight: '100%',
        margin: '18px 15px 0 15px'
      }}
    >
      Стоимость доставки
    </p>
    <p 
      style={{
        fontFamily: 'Arial',
        fontWeight: '400',
        fontStyle: 'Regular',
        fontSize: '16px',
        lineHeight: '19px',
        margin: '9px 16px 0 16px'
      }} 
    >
      Зависит от загрузки пекарни и суммы вашего заказа
    </p>
    <p 
      style={{
        fontFamily: 'Arial',
        fontWeight: '700',
        fontStyle: 'Bold',
        fontSize: '16px',
        lineHeight: '19px',
        margin: '18px 16px 0 16px'
      }}
    >
      Условия
    </p>
    <List 
      style={{
        "--padding-left": '16px',
        "--padding-right": '16px',
        fontFamily: 'Arial',
        fontWeight: '400',
        fontStyle: 'Regular',
        fontSize: '16px',
        lineHeight: '19px',
        "--border-inner": '1px solid rgba(185, 185, 185, 1)'
      }}
    >
      <List.Item>
        <Space className="w-100" justify='between'>
          <span>Заказ до 300 ₽</span>
          <span>299 ₽</span>
        </Space>
      </List.Item>
      <List.Item>
        <Space className="w-100" justify='between'>
          <span>Заказ до 300 ₽</span>
          <span>299 ₽</span>
        </Space>
      </List.Item>
      <List.Item>
        <Space className="w-100" justify='between'>
          <span>Заказ до 300 ₽</span>
          <span>299 ₽</span>
        </Space>
      </List.Item>
      <List.Item>
        <Space className="w-100" justify='between'>
          <span>Заказ до 300 ₽</span>
          <span>299 ₽</span>
        </Space>
      </List.Item>
    </List>
    <Button 
      shape='rounded'
      fill='solid' 
      style={{
        background: 'rgba(247, 187, 15, 1)',
        fontFamily: 'Arial',
        fontWeight: '700',
        fontStyle: 'Bold',
        fontSize: '20px',
        lineHeight: '100%',
        margin: '17px 15px',
        width: 'calc(100% - 30px)'
      }}
      onClick={close}
    >
      Понятно
    </Button>
  </AdaptivePopup>
})

export default DeliveryPriceInfoPopup
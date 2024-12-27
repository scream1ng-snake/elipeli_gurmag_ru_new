import { Card, Divider, List, NavBar, Space, Tag } from "antd-mobile"
import { observer } from "mobx-react-lite";
import moment from "moment";
import { FC } from "react";
import { WithChildren } from "../../../features/helpers";
import { useGoUTM, useStore } from "../../../features/hooks";
import config from "../../../features/config";
import BottomNav from "../../common/BottomNav/BottomNav";

const OrderStatusColors = {
  'Создан': 'default',
  'В работе': 'primary',
  'Сборка заказа': 'primary',
  'В пути': 'primary',
  'Оплачен': 'success',
  'Отменён': 'danger',
}
const PaymentStatusColors = {
  'Не оплачен': 'default',
  'Оплачен частично': 'warning',
  'Оплачен': 'success',
}

const W100 = { width: 'calc(100%)' }
const OrdersPage: FC = observer(() => {
  const { user } = useStore()
  const go = useGoUTM()
  const onBack = () => { go('/') }
  return (
    <div style={{ background: 'var(--tg-theme-secondary-bg-color)', minHeight: '100%' }}>
      <NavBar
        onBack={onBack}
        style={{
          borderBottom: 'solid 1px var(--adm-color-border)',
          background: 'var(--tg-theme-bg-color)',
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 1,
          
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15
        }}
      >
        История заказов
      </NavBar>
      <div style={{ height: '45px' }} />
      <Space direction="vertical" style={{ ...W100, marginTop: '0.75rem' }}>
        {[...user.orderHistory]
          .sort((a, b) => new Date(b.DocumentDate).getTime() - new Date(a.DocumentDate).getTime())
          .map(order =>
            <Card
              key={order.VCode}
              style={{
                width: 'calc(100% - 1.5rem)',
                border: '1px solid var(--adm-border-color)',
                margin: '0 0.75rem 0.25rem 0.75rem',
                background: 'var(--tg-theme-bg-color)',
                borderRadius: 15
              }}
              title={`Заказ от ${moment(order.DocumentDate).format('LLL')}`}
              extra={<span style={{ marginLeft: '0.25rem' }}>{`№ ${order.VCode}`}</span>}
              onClick={() => {
                user.watchHistoryOrderPopup.watch(order)
                go(String(order.VCode))
              }}
            >
              <Space style={W100} justify='between'>
                <Group>
                  <Span>Статус заказа:</Span>
                  <br />
                  <Tag
                    style={{ marginTop: '0.25rem' }}
                    color={OrderStatusColors[order.StatusOrder] || 'default'}
                  >
                    {order.StatusOrder}
                  </Tag>
                </Group>
                <Group>
                  <Span>Статус оплаты:</Span>
                  <br />
                  <Tag
                    style={{ marginTop: '0.25rem' }}
                    color={PaymentStatusColors[order.PaymentStatus] || 'default'}
                  >
                    {order.PaymentStatus}
                  </Tag>
                </Group>
              </Space>
              {order.FullAddress?.length && order.OrderType === 'С доставкой'
                ? (
                  <Group>
                    <Span>Адрес доставки:</Span>
                    <P>{order.FullAddress}</P>
                  </Group>
                ) : (
                  <Group>
                    <Span>Точка:</Span>
                    <P>{order.OrgName}</P>
                  </Group>
                )
              }

              {/* <Group>
                <Span>Дата получения:</Span>
                <P>{moment(order.DeliveryTime).format('LLL')}</P>
              </Group> */}

              <Scrollable>
                {order.Courses.map(item =>
                  <img
                    key={item.CourseCode}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginRight: '0.25rem'
                    }}
                    src={`${config.staticApi}/api/v2/image/Material?vcode=${item.CourseCode}&compression=true`}
                  />
                )}
              </Scrollable>
            </Card>
          )}
      </Space>
      <BottomNav />
    </div>
  )
})

const Span: FC<WithChildren> = ({ children }) =>
  <span style={{ fontWeight: '700', fontSize: '14px' }}>
    {children}
  </span>

const Group: FC<WithChildren> = ({ children }) =>
  <div style={{ marginBottom: '0.75rem' }}>
    {children}
  </div>

const P: FC<WithChildren> = ({ children }) =>
  <p style={{ marginTop: '0.5rem' }}>{children}</p>

const Scrollable: FC<WithChildren> = ({ children }) =>
  <div style={{
    display: 'flex',
    overflowX: 'scroll'
  }}>
    {children}
  </div>

export const WatchOrderDetailModal: FC = observer(() => {
  const { user } = useStore();
  const watchingOrder = user.watchHistoryOrderPopup.content
  const go = useGoUTM()
  const onBack = () => { go('/orders') }
  if (watchingOrder) {
    return (
      <div
        style={{
          background: 'var(--tg-theme-secondary-bg-color)',
          minHeight: '100vh',
        }}
      >
        <NavBar
          back='Заказы'
          onBack={onBack}
          style={{
            borderBottom: 'solid 1px var(--adm-color-border)',
            position: 'fixed',
            left: '0',
            right: '0',
            top: '0',
            background: 'var(--tg-theme-bg-color)',
            zIndex: '1',
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15
          }}
        >
          <div>
            <div>{`Заказ № ${watchingOrder.VCode}`}</div>
            <div style={{ fontSize: '12px' }}>
              {`от ${moment(watchingOrder.DocumentDate).format('LLL')}`}
            </div>
          </div>
        </NavBar>
        <div style={{ height: '45px' }} />
        <Card
          style={{
            width: 'calc(100% - 1.5rem)',
            border: '1px solid var(--adm-border-color)',
            margin: '0.75rem 0.75rem 0.25rem 0.75rem',
            background: 'var(--tg-theme-bg-color)',
            borderRadius:15
          }}
        >
          <Space style={W100} justify='between'>
            <Group>
              <Span>Статус заказа:</Span>
              <br />
              <Tag
                style={{ marginTop: '0.25rem' }}
                color={OrderStatusColors[watchingOrder.StatusOrder] || 'default'}
              >
                {watchingOrder.StatusOrder}
              </Tag>
            </Group>
            <Group>
              <Span>Статус оплаты:</Span>
              <br />
              <Tag
                style={{ marginTop: '0.25rem' }}
                color={PaymentStatusColors[watchingOrder.PaymentStatus] || 'default'}
              >
                {watchingOrder.PaymentStatus}
              </Tag>
            </Group>
          </Space>

          {watchingOrder.FullAddress?.length && watchingOrder.OrderType === 'С доставкой'
            ? (
              <Group>
                <Span>Адрес доставки:</Span>
                <P>{watchingOrder.FullAddress}</P>
              </Group>
            ) : (
              <Group>
                <Span>Точка:</Span>
                <P>{watchingOrder.OrgName}</P>
              </Group>
            )
          }
          {/* <Group>
            <Span>Дата получения:</Span>
            <P>{moment(watchingOrder.DeliveryTime).format('LLL')}</P>
          </Group> */}
          <Group>
            <Span>Сумма итого:</Span>
            <P>{watchingOrder.OrderCost + 'руб'}</P>
          </Group>
          <Divider>Блюда:</Divider>
          <List>
            {watchingOrder.Courses.map(item =>
              <List.Item
                key={item.CourseCode}
                style={{ fontSize: '14px' }}
                description={`${item.CourseCost} руб.`}
              >
                {`${item.CourseName} - ${item.CourseQuantity} шт.`}
              </List.Item>
            )}
          </List>

          <Divider>Получатель:</Divider>
          <Group>
            <Span>Номер телефона:</Span>
            <P>{user.info.Phone}</P>
          </Group>
        </Card>
        <div style={{ height: '55px' }} />
      </div>
    )
  } else {
    return null
  }
})


export default OrdersPage
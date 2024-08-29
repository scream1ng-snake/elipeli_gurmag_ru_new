import { FC, Fragment, useEffect, useMemo } from 'react'
import styles from '../form.module.css'
import { Form, Input, Button, Space } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useStore } from '../../../features/hooks'
import _ from 'lodash'
import Red from '../../special/RedText'
import { useNavigate } from 'react-router-dom'
import { logger } from '../../../features/logger'

interface InputAddress {
  road: string,
  house_number: string,

  frame?: string | undefined,
  entrance?: string | undefined,
  doorCode?: string | undefined,
  storey?: string | undefined,
  apartment?: string | undefined,
  addrComment?: string | undefined,
}
const InputAddressForm: FC<{ onContinue: () => void }> = observer(p => {
  const { reception } = useStore()
  const validator = yupResolver(addressSchema)
  const debounced = useMemo(
    () => 
    _.debounce(
      (form: InputAddress) => {
        logger.log(`debounce | form: ${JSON.stringify(form)}`, 'InputAddressForm')
        reception.setCordinatesByAddress(form)
      },
      900
    ),
    []
  )
  const form = useForm<InputAddress>({
    defaultValues: {
      road: '',
      house_number: '',

      frame: '',
      entrance: '',
      doorCode: '',
      storey: '',
      apartment: '',
      addrComment: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: (value, ctx, options) => {
      logger.log(`resolver | value: ${JSON.stringify(value)} | ctx: ${JSON.stringify(ctx)} | options: ${JSON.stringify(options)} |`, 'InputAddressForm')
      const promise = validator(value, ctx, options)
      //@ts-ignore
      promise.then(result => 
        (
          !Object.keys(result.errors).length
          && Object.keys(result.values).length
          && (
            options.names?.[0] === 'road'
            || options.names?.[0] === 'house_number'
          )
        )
          ? debounced(result.values)
          : debounced.cancel()
      )
      return promise
    }
  })
  const { control, formState: { errors } } = form
  const { setValue, getValues } = form
  useEffect(() => {
    setValue('road', reception.address.road)
    setValue('house_number', reception.address.house_number)

    
    setValue('frame', reception.address.frame)
    setValue('entrance', reception.address.entrance)
    setValue('doorCode', reception.address.doorCode)
    setValue('storey', reception.address.storey)
    setValue('apartment', reception.address.apartment)
    setValue('addrComment', reception.address.addrComment)
   
    form.clearErrors()
  }, [reception.address])
  /* useEffect(() => {
    if (reception.address) {
      setValue('frame', reception.address.frame)
      setValue('entrance', reception.address.entrance)
      setValue('doorCode', reception.address.doorCode)
      setValue('storey', reception.address.storey)
      setValue('apartment', reception.address.apartment)
      setValue('addrComment', reception.address.addrComment)
      
      form.clearErrors()
    }
  }, []) */
  return <Fragment>
    <div className={styles.city_label}>
      Уфа
    </div>
    <Form className='gur-form' layout='vertical' style={{ '--border-top': 'none' }}>
      <Space
        style={{ '--gap': '5px', width: 'calc(100vw - 32px)', margin: '8px 16px 8px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space'}
      >
        <Form.Item
          label={errors.road?.message
            ? <>{'Улица '}<Red>{'* ' + errors.road?.message}</Red></>
            : 'Улица'
          }
          name='road'
          className={styles.addr_from_input + ' gur-form__item'}
        >
          <Controller
            control={control}
            name='road'
            render={({ field }) => (
              <Input
                {...field}
                disabled={reception.reverseGeocoderApi.state === 'LOADING'}
                placeholder='Улица'
                clearable
              />
            )}
          />
        </Form.Item>
      </Space>
      <Space
        style={{ '--gap': '5px', width: 'calc(100vw - 42px)', margin: '0 16px 8px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space gur-space_3'}
      >
        <Form.Item
          label={errors.house_number?.message
            ? <>{'Дом '}<Red>{'* ' + errors.house_number?.message}</Red></>
            : 'Дом'
          }
          name='house_number'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
        >
          <Controller
            control={control}
            name='house_number'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='Дом'
                clearable
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={errors.frame?.message
            ? <>{'Корпус/литер '}<Red>{'* ' + errors.frame?.message}</Red></>
            : 'Корпус/литер'
          }
          name='frame'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
        >
          <Controller
            control={control}
            name='frame'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='Корпус/литер'
                clearable
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={errors.entrance?.message
            ? <>{'Подъезд '}<Red>{'* ' + errors.entrance?.message}</Red></>
            : 'Подъезд'
          }
          name='entrance'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
        >
          <Controller
            control={control}
            name='entrance'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='Подъезд'
                clearable
              />
            )}
          />
        </Form.Item>
      </Space>
      <Space
        style={{ '--gap': '5px', width: 'calc(100vw - 42px)', margin: '0 16px 8px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space gur-space_3'}
      >
        <Form.Item
          label={errors.doorCode?.message
            ? <>{'Код на двери '}<Red>{'* ' + errors.doorCode?.message}</Red></>
            : 'Код на двери'
          }
          name='doorCode'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
        >
          <Controller
            control={control}
            name='doorCode'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='Код на двери'
                clearable
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={errors.storey?.message
            ? <>{'Этаж '}<Red>{'* ' + errors.storey?.message}</Red></>
            : 'Этаж'
          }
          name='storey'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
        >
          <Controller
            control={control}
            name='storey'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='Этаж'
                clearable
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={errors.apartment?.message
            ? <>{'Квартира '}<Red>{'* ' + errors.apartment?.message}</Red></>
            : 'Квартира'
          }
          name='apartment'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
        >
          <Controller
            control={control}
            name='apartment'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='Квартира'
                clearable
              />
            )}
          />
        </Form.Item>
      </Space>
      <Space
        style={{ '--gap': '5px', width: 'calc(100vw - 32px)', margin: '0px 16px 8px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space'}
      >
        <Form.Item
          label={errors.addrComment?.message
            ? <>{'Комментарий '}<Red>{'* ' + errors.addrComment?.message}</Red></>
            : 'Комментарий'
          }
          name='addrComment'
          className={styles.addr_from_input + ' gur-form__item'}
        >
          <Controller
            control={control}
            name='addrComment'
            render={({ field }) => (
              <Input
                {...field}
                disabled={reception.reverseGeocoderApi.state === 'LOADING'}
                placeholder='Комментарий'
                clearable
              />
            )}
          />
        </Form.Item>
      </Space>
      <Form.Item>
        <Button
          color='primary'
          type="submit"
          fill='solid'
          shape='rounded'
          size='large'
          style={{ width: '100%' }}
          onClick={function() {
            const vals = getValues()
            console.log('vals', vals)
            reception.setAddress(vals)
            p.onContinue()
          }}
          disabled={
            Boolean(Object.keys(errors).length)
            || !reception.address.road.length
            || !reception.address.house_number.length
          }
        >
          Продолжить
        </Button>
      </Form.Item>
    </Form>
  </Fragment>
})
export default InputAddressForm

const addressSchema = yup.object().shape({
  road: yup
    .string()
    .required('Обязательное поле'),
  house_number: yup
    .string()
    .required('Обязательное поле'),
});

/* 
  "street": Улица
  "house": Дом 
  "frame":, Корпус/литер
  "entrance": Подъезд
  "doorCode": Код на двери
  "storey": Этаж
  "apartment": Квартира
  "addrComment": Комментарий к заказу
*/
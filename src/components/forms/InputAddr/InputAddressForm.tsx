import { FC, Fragment, useEffect, useMemo, useState } from 'react'
import styles from '../form.module.css'
import { Form, Input, Space, Checkbox } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { Controller, FieldErrors, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useStore } from '../../../features/hooks'
import _ from 'lodash'
import Red from '../../special/RedText'
import CustomButton from '../../special/CustomButton'
interface InputAddress {
  road: string,
  house_number: string,
  multiapartment?: boolean,

  frame?: string,
  entrance?: string,
  doorCode?: string,
  storey?: string,
  apartment?: string,
  addrComment?: string,
  incorrectAddr?: boolean,
}
const InputAddressForm: FC<{ onContinue: () => void }> = observer(p => {
  const [errors, setErrors] = useState<FieldErrors<InputAddress>>({})
  const { reception } = useStore()
  const simpleValidator = yupResolver(simpleAddressSchema)
  const fullValidator = yupResolver(fullAddressSchema)
  const debounced = useMemo(
    () => _.debounce(
      (form: InputAddress, formName: string | undefined) => {
        if (formName) {
          if (formName === 'road' || formName === 'house_number') {
            reception.setCordinatesByAddress(form)
          } else {
            reception.setAddressForAdditionalFields(form);
          }
        }
      },
      900
    ),
    []
  )
  const form = useForm<InputAddress>({
    criteriaMode: 'all',
    defaultValues: {
      road: undefined,
      house_number: '',
      multiapartment: true,

      frame: '',
      entrance: '',
      doorCode: '',
      storey: '',
      apartment: '',
      addrComment: '',
      incorrectAddr: false,
    },
    mode: 'all',
    reValidateMode: 'onChange',
    resolver: (value, ctx, options) => {
      const promise = value.multiapartment
        // @ts-ignore
        ? fullValidator(value, ctx, options)
        : simpleValidator(value, ctx, options)

      //@ts-ignore
      promise.then(result => {
        setErrors(result.errors)

        !Object.keys(result.errors).length
          && Object.keys(result.values).length

          ? debounced(result.values, options.names?.[0])
          : debounced.cancel()
      })
      return promise
    }
  })
  const { setValue, getValues, control } = form
  useEffect(() => {
    setValue('road', reception.address.road)
    setValue('house_number', reception.address.house_number)

    setValue('multiapartment', reception.address.multiapartment)
    setValue('frame', reception.address.frame)
    setValue('entrance', reception.address.entrance)
    setValue('doorCode', reception.address.doorCode)
    setValue('storey', reception.address.storey)
    setValue('apartment', reception.address.apartment)
    setValue('addrComment', reception.address.addrComment)

    setValue('incorrectAddr', reception.address.incorrectAddr)
    form.clearErrors()
  }, [reception.address])

  return <Fragment>
    <div className={styles.city_label}>
      Уфа
    </div>
    <Form 
      className='gur-form' 
      layout='vertical' 
      style={{ '--border-top': 'none' }}
    >
      <Space
        style={{ '--gap': '5px', width: 'calc(100vw - 32px)', margin: '8px 16px 8px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space'}
      >
        <Form.Item
          label={errors.road?.message
            ? <>{'Улица '}<Red>{'* ' + errors?.road?.message}</Red></>
            : 'Улица'
          }
          name='road'
          className='gur-form__item'
          style={errors.road?.message && redBorder}
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
        style={{ '--gap': '5px', width: 'calc(100vw - 32px)', margin: '8px 16px 8px' }}
        justify='between'
        align='center'
        className='gur-space'
      >
        
        <Form.Item
          label={errors.house_number?.message
            ? <>{'Дом '} <Red>{'* ' + errors?.house_number?.message}</Red></>
            : 'Дом'
          }
          name='house_number'
          className={styles.addr_from_input + ' gur-form__item'}
          style={errors.house_number?.message && redBorder}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
          extra={
            <Controller
              control={control}
              name='multiapartment'
              render={({ field }) => <>
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  ref={field.ref}
                  disabled={reception.reverseGeocoderApi.state === 'LOADING'}
                />
                <span style={{ margin: '0 0.5rem' }}>Многоквартирный</span>
              </>
              }
            />}
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
      </Space>
      <Space
        style={{ '--gap': '5px', width: 'calc(100vw - 42px)', margin: '0 16px 8px' }}
        justify='between'
        align='center'
        className='gur-space gur-space_2'
      >
        <Form.Item
          label={
            errors.frame?.message
              ? <>{'Дом '} <Red>{'* ' + errors?.frame?.message}</Red></>
              : 'Корпус/литер'
          }
          name='frame'
          className='gur-form__item'
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
          label={errors?.entrance?.message
            ? <>{'Подъезд '}<Red>{'* ' + errors.entrance?.message}</Red></>
            : 'Подъезд'
          }
          name='entrance'
          className={'gur-form__item'}
          style={errors.entrance?.message && redBorder}
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
          label={errors?.doorCode?.message
            ? <>{'Код на двери '}<Red>{'* ' + errors.doorCode?.message}</Red></>
            : 'Код на двери'
          }
          name='doorCode'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
          style={errors.doorCode?.message && redBorder}
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
          style={errors.storey?.message && redBorder}
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
          label={errors?.apartment?.message
            ? <>{'Квартира '}<Red>{'* ' + errors.apartment?.message}</Red></>
            : 'Квартира'
          }
          name='apartment'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={reception.reverseGeocoderApi.state === 'LOADING'}
          style={errors?.apartment?.message && redBorder}
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
        style={{ '--gap': '5px', width: 'calc(100vw - 32px)', margin: '0px 16px 0px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space'}
      >
        <Form.Item
          label={errors?.addrComment?.message
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
        <CustomButton
          text={'Доставить сюда'}
          onClick={function () {
            const vals = getValues()
            reception.setAddress(vals)
            p.onContinue()
          }}
          height={'35px'}
          maxWidth={'auto'}

          marginTop={'0px'}
          marginBottom={'0px'}
          marginHorizontal={'0px'}
          paddingHorizontal={'24px'}
          fontWeight={'400'}
          fontSize={'14.5px'}
          backgroundVar={'--gurmag-accent-color'}
          colorVar={'--gur-custom-button-text-color'}
          appendImage={null}
          disabled={
            Boolean(Object.keys(errors).length)
            || !reception.address.road.length
            || !reception.address.house_number.length
          }
        />
      </Form.Item>
    </Form>
  </Fragment>
})
export default InputAddressForm

const simpleAddressSchema = yup.object().shape({
  road: yup
    .string()
    .required('Обязательное поле'),
  house_number: yup
    .string()
    .required('Обязательное поле'),
})

const fullAddressSchema = yup.object().shape({
  road: yup
    .string()
    .required('Обязательное'),
  house_number: yup
    .string()
    .required('Обязательное'),
  entrance: yup
    .string()
    .required('Обязательное'),
  storey: yup
    .string()
    .required('Обязательное'),
  apartment: yup
    .string()
    .required('Обязательное'),
})

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

const redBorder = { border: '1px solid var(--adm-color-danger)' }
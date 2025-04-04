import { FC, Fragment, useEffect, useMemo, useState } from 'react'
import styles from '../form.module.css'
import { Form, Input, Space, Checkbox, Button, Dialog } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { Controller, FieldErrors, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useStore } from '../../../features/hooks'
import _ from 'lodash'
import Red from '../../special/RedText'
import CustomButton from '../../special/CustomButton'
import { Undef } from '../../../features/helpers'
import { Address, Location } from '../../../stores/location.store'
import { CITY_PREFIX } from '../../../stores/reception.store'
import { FullscreenLoading } from '../../common/Loading/Loading'
import { toJS } from 'mobx'

type InputAddress = Omit<Address, 'road' | 'house_number'> & { address: string }
const InputAddressForm: FC<{ onContinue: () => void }> = observer(p => {
  const [errors, setErrors] = useState<FieldErrors<InputAddress>>({})
  const { reception, reception: { suggestitions, Location }, user } = useStore()
  const simpleValidator = yupResolver(simpleAddressSchema)
  const fullValidator = yupResolver(fullAddressSchema)
  const [showSavedAddrs, setShowSavedAddrs] = useState(false)
  const debounced = useMemo(
    () => _.debounce(
      (form: InputAddress, formName: Undef<keyof InputAddress>) => {
        if (formName) {
          if (formName === 'address') {
            suggestitions.geoSuggest.run(CITY_PREFIX + form.address)
          } else {
            Location.setAdditionalFields(form)
          }
        }
        debounced.cancel()
      },
      500
    ),
    []
  )
  const form = useForm<InputAddress>({
    criteriaMode: 'all',
    defaultValues: {
      address: '',
      multiapartment: true,

      entrance: '',
      doorCode: '',
      storey: '',
      apartment: '',
      addrComment: '',
      incorrectAddr: false,
    },
    mode: 'onChange',
    // reValidateMode: 'none',
    resolver: (value, ctx, options) => {
      const promise = value.multiapartment
        // @ts-ignore
        ? fullValidator(value, ctx, options)
        : simpleValidator(value, ctx, options)

      //@ts-ignore
      promise.then(result => {
        setErrors(result.errors)

        if (!Object.keys(result.errors).length
          && Object.keys(result.values).length
        ) {
          debounced(result.values, options.names?.[0])
        } else {
          if (!('house_number' in result.errors) && !('road' in result.errors)) {
            debounced(value, options.names?.[0])
          } else {
            debounced.cancel()
          }
        }
      })
      return promise
    }
  })
  const { setValue, getValues, control } = form
  useEffect(() => {
    setValue('address', Location.inputingAddress.house_number && Location.inputingAddress.road
      ? Location.inputingAddress.road + ', ' + Location.inputingAddress.house_number
      : ''
    )

    if (Location.inputingAddress.multiapartment === undefined) {
      setValue('multiapartment', true)
    } else {
      setValue('multiapartment', Location.inputingAddress.multiapartment)
    }
    setValue('entrance', Location.inputingAddress.entrance)
    setValue('doorCode', Location.inputingAddress.doorCode)
    setValue('storey', Location.inputingAddress.storey)
    setValue('apartment', Location.inputingAddress.apartment)
    setValue('addrComment', Location.inputingAddress.addrComment)

    setValue('incorrectAddr', Location.inputingAddress.incorrectAddr)
    form.clearErrors()
  }, [Location.inputingAddress?.road, Location.inputingAddress?.house_number])


  const disabledButton = Boolean(Object.keys(errors).length)
    || !Location.inputingAddress.road.length
    || !Location.inputingAddress.house_number.length

  async function confirmAddr() {
    if(Location.InputingVcode) {
      await Location.savedAdresses.updateAddress()
    }
    Location.setConfirmedAddress()
    Location.setConfirmedLocation()
    Location.setConfirmedVcode()
  }
  return <Fragment>
    {Location.savedAdresses.isPending
      ? <FullscreenLoading />
      : null
    }
    <Space 
      style={{ 
        width: '100%',
        background: 'var(--tg-theme-bg-color)'
      }} 
      justify='between' 
      align='center'
    >
      <div className={styles.city_label}>
        Уфа
      </div>

      {Array.from(Location.savedAdresses.onServer.values()).length && user.loadUserInfo.state === 'COMPLETED'
        ? <Button 
          className='me-3' 
          size='small' 
          onClick={() => {
            if(form.formState.isDirty) {
              Dialog.show({
                content: 'Адрес не сохранен, вы уверены что хотите покинуть страницу?',
                closeOnAction: true,
                actions: [{
                  key: 'save',
                  text: 'Сохранить адрес',
                  onClick() {
                    confirmAddr()
                    Location.savedAdresses.page.open()
                  },
                  disabled: disabledButton
                }, {
                  key: 'close',
                  text: 'Закрыть',
                  bold: true,
                  danger: true
                }]
              })
            } else {
              Location.savedAdresses.page.open()
            }
          }}
        >
          Мои адреса
        </Button>
        : null
      }
    </Space>
    <Form
      className='gur-form'
      layout='vertical'
      style={{ '--border-top': 'none', position: 'relative' }}
    >
      <Space
        style={{ '--gap': '5px', width: 'calc(100% - 32px)', margin: '8px 16px 8px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space'}
      >
        <Form.Item
          label={errors.address?.message
            ? <>{'Улица и дом '}<Red>{'* ' + errors?.address?.message}</Red></>
            : 'Улица и дом'
          }
          name='address'
          className='gur-form__item'
          style={errors.address?.message && redBorder}
          clickable={false}
        >
          <Controller
            control={control}
            name='address'
            render={({ field }) => <>
              <Input
                {...field}
                onClick={() => {
                  setShowSavedAddrs(true)
                }}
                disabled={Location.reverseGeocoderApi.state === 'LOADING'}
                placeholder='Улица и дом'
                clearable
              />
            </>}
          />
        </Form.Item>

      </Space>
      {(!reception.suggestitions.list.length)
        ? null
        : <ul
          style={{
            listStyle: 'none',
            position: 'absolute',
            zIndex: 10000,
            background: 'var(--tg-theme-bg-color)',
            width: 'calc(100% - 32px)',
            margin: '8px 16px',
            borderBottom: '1px solid var(--gur-input-color)',
            borderLeft: '1px solid var(--gur-input-color)',
            borderRight: '1px solid var(--gur-input-color)',
            borderTop: 'none',
            maxHeight: 'calc(100% - 65px)',
            overflow: 'scroll',
            top: '47px',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          {/* {Location.savedAddrs.map((myAddr, index) =>
            <li
              key={index + 'myaddr'}
              style={{ padding: '8px 16px', fontSize: 12 }}
              onClick={e => { 
                Location.setAddrFromSaved(myAddr)
                setShowSavedAddrs(false)
                reception.suggestitions.setList([])
              }}
            >
              <span style={{ color: 'var(--тихий-текст)' }}>{'Недавно заказывали:  '}</span>
              {myAddr.FullAddress}
            </li>
          )} */}
          {reception.suggestitions.list.map((item, index) =>
            <li
              key={index + 'sug'}
              style={{ padding: '8px 16px', fontSize: 12 }}
              onClick={() => {
                const road = item.address.component.find(compt => compt.kind[0] === 'STREET')?.name
                const house_number = item.address.component.find(compt => compt.kind[0] === 'HOUSE')?.name
                if (road && house_number) {

                  reception.suggestitions.setList([])
                  setValue('address', item.title.text)
                  const rest = getValues()
                  const form: Address = {
                    road,
                    house_number,
                    ...rest
                  }
                  Location.setCordinatesByAddress(form)
                }
              }}
            >
              {item.title.text}
            </li>
          )}
        </ul>
      }
      <Space
        style={{ '--gap': '5px', width: 'calc(100% - 32px)', margin: '8px 24px 8px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space'}
      >
        <Controller
          control={control}
          name='multiapartment'
          render={({ field }) => <>
            <Checkbox
              checked={field.value}
              onChange={field.onChange}
              ref={field.ref}
              disabled={Location.reverseGeocoderApi.state === 'LOADING'}
            />
            <span style={{ margin: '0 0.5rem', fontSize: 14 }}>Многоквартирный дом</span>
          </>
          }
        />
      </Space>
      <Space
        style={{ '--gap': '5px', width: 'calc(100% - 42px)', margin: '0 16px 8px' }}
        justify='between'
        align='center'
        className='gur-space gur-space_2'
      >

        <Form.Item
          label={errors?.doorCode?.message
            ? <>{'Код на двери '}<Red>{'* ' + errors.doorCode?.message}</Red></>
            : 'Код на двери'
          }
          name='doorCode'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={Location.reverseGeocoderApi.state === 'LOADING'}
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
          label={errors?.entrance?.message
            ? <>{'Подъезд '}<Red>{'* ' + errors.entrance?.message}</Red></>
            : 'Подъезд'
          }
          name='entrance'
          className={'gur-form__item'}
          style={errors.entrance?.message && redBorder}
          disabled={Location.reverseGeocoderApi.state === 'LOADING'}
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
        style={{ '--gap': '5px', width: 'calc(100% - 42px)', margin: '0 16px 8px' }}
        justify={'between'}
        align={'center'}
        className={'gur-space gur-space_2'}
      >
        <Form.Item
          label={errors.storey?.message
            ? <>{'Этаж '}<Red>{'* ' + errors.storey?.message}</Red></>
            : 'Этаж'
          }
          name='storey'
          className={styles.addr_from_input + ' gur-form__item'}
          disabled={Location.reverseGeocoderApi.state === 'LOADING'}
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
          disabled={Location.reverseGeocoderApi.state === 'LOADING'}
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
        style={{ '--gap': '5px', width: 'calc(100% - 32px)', margin: '0px 16px 0px' }}
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
                disabled={Location.reverseGeocoderApi.state === 'LOADING'}
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
          onClick={() => {
            confirmAddr()
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
          disabled={disabledButton}
        />
      </Form.Item>
    </Form>
  </Fragment>
})
export default InputAddressForm

const simpleAddressSchema = yup.object().shape({
  address: yup
    .string()
    .required('Обязательное поле'),
})

const fullAddressSchema = yup.object().shape({
  address: yup
    .string()
    .required('Обязательное поле'),
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
const redBorder = { border: '1px solid var(--adm-color-danger)' }
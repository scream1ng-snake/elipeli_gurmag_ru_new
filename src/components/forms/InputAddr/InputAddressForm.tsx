import { FC, Fragment, useEffect, useMemo } from 'react'
import styles from './InputAddressForm.module.css'
import { Form, Input, Button, Toast } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { Controller, FieldErrors, SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { WithChildren } from '../../../features/helpers'
import { useStore } from '../../../features/hooks'
import _ from 'lodash'

interface InputAddress {
  road: string,
  house_number: string,
}
const InputAddressForm: FC = observer(() => {
  const { reception } = useStore()
  const validator = yupResolver(addressSchema)
  const debounced = useMemo(() => 
    _.debounce((form: InputAddress) => {
      reception.setCordinatesByAddress(form)
    }, 900)
  , [])
  const form = useForm<InputAddress>({
    defaultValues: {
      road: '',
      house_number: ''
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: (value, ctx, options) => {
      const promise = validator(value, ctx, options)
      //@ts-ignore
      promise.then(result => 
        !Object.keys(result.errors).length && Object.keys(result.values).length
          ? debounced(result.values)
          : debounced.cancel()
      )
      return promise
    }
  })
  const { control, formState: { errors }} = form
  const { setValue, handleSubmit } = form
  useEffect(() => {
    setValue('road', reception.address.road)
    setValue('house_number', reception.address.house_number)
    form.clearErrors()
  }, [reception.address])


  const Red: FC<WithChildren> = p =>
    <span style={{ color: 'var(--adm-color-danger)' }}>
      {p.children}
    </span>

  const onSubmit: SubmitHandler<InputAddress> =
    data => console.log(data);

  const onInvalidSubmit = (errors?: FieldErrors<InputAddress>) => {
    if (errors?.road && errors.house_number) {
      Toast.show('Укажите улицу и дом')
      errors.road.ref?.focus?.()
    } else if (errors?.road) {
      Toast.show('Укажите улицу')
      errors.road.ref?.focus?.()
    } else if (errors?.house_number) {
      Toast.show('Укажите дом')
      errors.house_number.ref?.focus?.()
    }
  }

  return <Fragment>
    <div className={styles.city_label}>
      Уфа
    </div>
    <Form layout='vertical' style={{ '--border-top': 'none' }}>
      <Form.Item
        label={errors.road?.message
          ? <>{'Улица '}<Red>{'* ' + errors.road?.message}</Red></>
          : 'Улица'
        }
        name='road'
        className={styles.addr_from_input}
      >
        <Controller
          control={control}
          name='road'
          render={({ field }) => (
            <Input
              {...field}
              disabled={reception.reverseGeocoderApi.state === 'LOADING'}
              placeholder='Введите улицу'
              clearable
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label={errors.house_number?.message
          ? <>{'Дом '}<Red>{'* ' + errors.house_number?.message}</Red></>
          : 'Дом'
        }
        name='house_number'
        className={styles.addr_from_input}
        disabled={reception.reverseGeocoderApi.state === 'LOADING'}
      >
        <Controller
          control={control}
          name='house_number'
          render={({ field }) => (
            <Input
              {...field}
              placeholder='Введите номер дома'
              clearable
            />
          )}
        />
      </Form.Item>
      <Form.Item>
        <Button
          color='primary'
          type="submit"
          fill='solid'
          shape='rounded'
          size='large'
          style={{ width: '100%' }}
          onClick={handleSubmit(onSubmit, onInvalidSubmit)}
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
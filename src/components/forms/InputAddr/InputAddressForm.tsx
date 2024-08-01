import { FC, Fragment, useEffect, useMemo } from 'react'
import styles from '../form.module.css'
import { Form, Input, Button } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useStore } from '../../../features/hooks'
import _ from 'lodash'
import Red from '../../special/RedText'
import { useNavigate } from 'react-router-dom'

interface InputAddress {
  road: string,
  house_number: string,
}
const InputAddressForm: FC = observer(() => {
  const navigate = useNavigate()
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
  const { control, formState: { errors } } = form
  const { setValue, getValues } = form
  useEffect(() => {
    setValue('road', reception.address.road)
    setValue('house_number', reception.address.house_number)
    form.clearErrors()
  }, [reception.address])

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
          onClick={function() {
            const vals = getValues()
            reception.setAddress(vals)
            reception.selectLocationPopup.close()
            navigate('/')
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
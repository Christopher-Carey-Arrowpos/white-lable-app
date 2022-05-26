import React, { Component, useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Name } from './FinalizeSteps/Name'
import { Address } from './FinalizeSteps/Address'
import { Final } from './FinalizeSteps/Final'
import { OrderType } from './FinalizeSteps/OrderType';
import axios from "axios";


export const FinalizeOrder = (props) => {
  const [time, setTime] = useState()
  const [serviceType, setServiceType] = useState()
  const [currentStep, setCurrentStep] = useState(0)
  const [user, setUser] = useState()
  const [errors, setErrors] = useState()
  const [edit,setEdit] = useState()
  const [name, setName] = useState()
  const [address, setAddress] = useState()
  const [discountMessageText, setDiscountMessageText] = useState();
  // const [name, setName] = useState(
  //   {
  //   email: "Chrisss@gmail.com",
  //   firstName: "Chris",
  //   lastName: "Guest",
  //   phone: "1231231234",
  // })
  // const [address, setAddress] = useState({
  //   address: "1221 Arrowhead Ct",
  //   address2: "",
  //   city: "Crown Point",
  //   state: "IN",
  //   zip: "46307",
  // })
  // ;

  function getErrors(mes) {
    setErrors(mes)
  }

  function changeStep(type, num,edit) {
    setEdit(null)
    if(edit){
      setEdit(true)
    }
    if (num >= 0) {
      setCurrentStep(num)
      return
    }
    if (type == "plus") {
      setCurrentStep(currentStep + 1)
    } else {
      if (currentStep >= 1) {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  useEffect(async () => {
    let gu= JSON.parse(await AsyncStorage.getItem('@guest_user_data'))
    let uu = JSON.parse(await AsyncStorage.getItem('@user_data'))
    if(gu){
      setName({
        email: gu.email,
        firstName: gu.first_name,
        lastName: gu.last_name,
        phone: gu.phone,
      })

    }
    if (uu) {
      setName({
        email: uu.user.email,
        firstName: uu.user.first_name,
        lastName: uu.user.last_name,
        phone: uu.user.phone,
      })
    }
    setUser(JSON.parse(await AsyncStorage.getItem('@user_data')))
  }, []);

  //if discount exists in storage, automatically apply it.

  async function checkCode() {
    const base_url = await AsyncStorage.getItem('@base_url');
    const slug = await AsyncStorage.getItem('@store_slug');
    const token = await AsyncStorage.getItem('@storage_Key');
    let code = await AsyncStorage.getItem('@discount_code');
    axios.post(`https://${base_url}/${slug}/cart/discounts/add/api`, {
          code: code
        },
        {
          headers: {
            'X-CSRF-TOKEN': token,
            'credentials': 'same-origin',
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest"
          }
        })
        .then(async function (response) {
          console.log(response);
          //tell the user we applied the discount.
          setDiscountMessageText(`Coupon code ${code} has been applied!`);
        })
        .catch(function (error) {
          console.log(error);
          //let the user know that something went wrong.
          setDiscountMessageText(`Something went wrong applying your discount code.`);
        });
  }

  checkCode();

  return (
    <View style={{ padding: 10 }}>
      <View>
        {errors &&
          <View style={{marginBottom:7,borderBottomWidth:1,borderBottomColor:'lightgray'}}>
            <Text style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{errors} -Please Try Again</Text>
          </View>
        }
        <View style={{}}>
          {discountMessageText && <Text>{discountMessageText}</Text>}
          {currentStep == 0 ?
            <OrderType
              changeStep={changeStep}
              setServiceType={(r) => setServiceType(r)}
              setTime={(t) => setTime(t)}
              getErrors={getErrors}
            />
            : null
          }
          {currentStep == 2 ?
            <Address
              changeStep={changeStep}
              setAddress={(d) => setAddress(d)}
              data={address}
              user={user}
              getErrors={getErrors}
              edit={edit}
              serviceType={serviceType}
            />
            : null
          }
          {currentStep == 1 ?
            <Name
              changeStep={changeStep}
              setName={(d) => setName(d)}
              data={name}
              user={user}
              getErrors={getErrors}
            />
            : null
          }
          {currentStep == 3 ?
            <Final
              cart={props.route.params}
              name={name}
              address={address}
              serviceType={serviceType}
              time={time}
              user={user}
              getErrors={getErrors}
              changeStep={changeStep}
              getCart={props.getCart}
            />
            : null
          }
        </View>
      </View>
    </View>
  )
}

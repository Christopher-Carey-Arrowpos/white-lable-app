import React, { Component, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Text, View, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Button, Card, H1, Icon } from 'native-base'
import config from '../../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from "react-hook-form";
import ToggleSwitch from 'toggle-switch-react-native'
import axios from "axios";


export const EditAddress = (props) => {
    const [user, setUser] = useState()
    const [address, setAddress] = useState()
    const [isDefault, setIsDefault] = useState()
    const [storeDefault, setStoreDefault] = useState()
    const { reset, control, handleSubmit, formState: { errors } } = useForm();
    const [inputRef, setInputRef] = useState([])

    let gh;


    function onSubmit(data) {
        if (!isDefault) {
            let ii = user.addresses.filter(a => a.default)[0]
            setStoreDefault(ii)
            gh = ii
        }
        UpdateAddress(data)
    }

    async function UpdateAddress(data) {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.put(`https://${base_url}/${slug}/user/addresses/${props.route.params.id}/update/api`, {
            display_name: data.display_name,
            address: data.address,
            address2: data.address2,
            city: data.city,
            state: data.state,
            zip: data.zip,
            user_id: user.user.id
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
            .then(function (response) {
                getUserInfo(response)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                // props.getErrors(error.response)
            });
    }

    async function getUserInfo(data) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/user/history/api`, {
            user_id: data.data.user_id
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
                if (gh) {
                    response.data.addresses.filter(a => a.id == gh.id)[0].default = true
                } else {
                    response.data.addresses.filter(a => a.id == address.id)[0].default = true
                }
                await AsyncStorage.setItem('@user_data', JSON.stringify(response.data))
                props.navigation.goBack()
                // props.route.params.refresh()
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                // props.getErrors(error.response)
            });
    }

    function refresh() {
        AsyncStorage.getItem("@user_data")
            .then((value) => {
                setUser(JSON.parse(value))
                setAddress(JSON.parse(value).addresses.filter(a => a.id == props.route.params.id)[0])
                JSON.parse(value).addresses.filter(a => a.id == props.route.params.id)[0].default && setIsDefault(true)
            })
    }

    function setRR(i, num) {
        console.log(i)
        let oo = inputRef.filter(a => a.id == num)[0]
        console.log(oo)
        if (!oo && i != null) {
            setInputRef([...inputRef, { "id": num, "rr": i }])

        }

    }

    useLayoutEffect(() => {
        refresh()
    }, []);

    return (
        address ?
            <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 10 }}>
                    <H1 style={{ fontWeight: 'bold' }}>Address</H1>
                </View>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            value={value}
                            placeholder={'Nick Name'}
                            placeholderTextColor={'gray'}
                            onSubmitEditing={(r) => inputRef.filter(a => a.id == 2)[0].rr.focus()}
                            // ref={(i) => setRR(i, 2)}
                            returnKeyType={"next"}
                        />
                    )}
                    name="display_name"
                    defaultValue={address ? address.display_name : ""}
                />
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            value={value}
                            placeholder={'Address'}
                            placeholderTextColor={'gray'}
                            onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                            ref={(i) => setRR(i, 2)}
                            returnKeyType={"next"}
                            autoCompleteType={'street-address'}
                            textContentType={'fullStreetAddress'}
    
                        />
                    )}
                    name="address"
                    rules={{ required: true }}
                    defaultValue={address ? address.address : ""}
                />
                {errors.address && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            value={value}
                            placeholder={'Address 2'}
                            placeholderTextColor={'gray'}
                            onSubmitEditing={(r) => inputRef.filter(a => a.id == 4)[0].rr.focus()}
                            ref={(i) => setRR(i, 3)}
                            returnKeyType={"next"}
                        />
                    )}
                    name="address2"
                    defaultValue={address ? address.address2 : ""}
                />
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={{ borderBottomWidth: 1, color: 'black' ,minHeight: 50}}
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            value={value}
                            placeholder={'City'}
                            placeholderTextColor={'gray'}
                            onSubmitEditing={(r) => inputRef.filter(a => a.id == 5)[0].rr.focus()}
                            ref={(i) => setRR(i, 4)}
                            returnKeyType={"next"}
                            textContentType={'addressCity'}
    
                        />
                    )}
                    name="city"
                    rules={{ required: true }}
                    defaultValue={address ? address.city : ""}
                />
                {errors.city && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            value={value}
                            placeholder={'State'}
                            placeholderTextColor={'gray'}
                            onSubmitEditing={(r) => inputRef.filter(a => a.id == 6)[0].rr.focus()}
                            ref={(i) => setRR(i, 5)}
                            returnKeyType={"next"}
                            textContentType={'addressState'}

                        />
                    )}
                    name="state"
                    rules={{ required: true }}
                    defaultValue={address ? address.state : ""}
                />
                {errors.state && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            value={value}
                            placeholder={'Zip'}
                            maxLength={5}
                            keyboardType={'number-pad'}
                            placeholderTextColor={'gray'}
                            // onSubmitEditing={(r) => inputRef.filter(a => a.id == 6)[0].rr.focus()}
                            ref={(i) => setRR(i, 6)}
                            returnKeyType={"done"}
                            autoCompleteType={'postal-code'}
                            textContentType={'postalCode'}
    
                        />
                    )}
                    name="zip"
                    rules={{ required: true }}
                    defaultValue={address ? address.zip : ""}
                />
                {errors.zip && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                <ToggleSwitch
                    style={{ marginTop: 10 }}
                    isOn={isDefault ? true : false}
                    onColor="red"
                    offColor="lightgray"
                    label='Make Default?'
                    labelStyle={{ flexDirection: 'column', color: config.SECONDARY_COLOR, fontWeight: "900" }}
                    size='medium'
                    onToggle={() => setIsDefault(!isDefault)}
                />
                <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT, marginTop: 50 }} onPress={handleSubmit(onSubmit)}>
                    <Text style={{ color: 'white' }}>Update Account</Text>
                </Button>
            </View>
            :
            null
    )
}
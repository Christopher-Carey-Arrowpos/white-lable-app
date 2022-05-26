import React, { Component, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Text, View, TouchableWithoutFeedback, ScrollView, TextInput } from 'react-native';
import { Button, Card, H1, Icon } from 'native-base'
import config from '../../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
// import DatePicker from 'react-native-date-picker'
import { set } from 'react-hook-form';
import { useForm, Controller } from "react-hook-form";
// import TextInputMask from 'react-native-text-input-mask';
import ToggleSwitch from 'toggle-switch-react-native'
import axios from "axios";
import { MaskedTextInput } from "react-native-mask-text";




export const UserAccountSettings = (props) => {
    const [user, setUser] = useState()
    const { reset, control, handleSubmit, formState: { errors } } = useForm();
    const [inputRef, setInputRef] = useState([])



    function onSubmit(data) {
        // props.setName(data)
        // props.changeStep("plus")
        UpdateUser(data)
    }


    async function UpdateUser(data) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/user/profile`, {
            user_id: user.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone
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
                getUserInfo()
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
            .then(async function (response) {
                let uu = user
                uu.user = response.data.user

                await AsyncStorage.setItem('@user_data', JSON.stringify(uu))
                props.navigation.goBack()
                // props.route.params.refresh()
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                // props.getErrors(error.response)
            });
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
        AsyncStorage.getItem("@user_data")
            .then((value) => {
                setUser(JSON.parse(value))
            })

    }, []);

    return (

        <View style={{ padding: 20 }}>
            {user &&
                <ScrollView>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 10 }}>
                            <H1 style={{ fontWeight: 'bold' }}>Name</H1>
                        </View>
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'First Name'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 2)[0].rr.focus()}
                                    returnKeyType={"next"}
                                    autoCompleteType={'name'}
                                    textContentType={'name'}
            
        
                                />
                            )}
                            name="firstName"
                            rules={{ required: true }}
                            defaultValue={user.user ? user.user.first_name : ""}
                        />
                        {errors.firstName && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Last Name'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                                    ref={(i) => setRR(i, 2)}
                                    returnKeyType={"next"}
                                />
                            )}
                            name="lastName"
                            rules={{ required: true }}
                            defaultValue={user.user ? user.user.last_name : ""}
                        />
                        {errors.lastName && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Email'}
                                    keyboardType={'email-address'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 4)[0].rr.focus()}
                                    ref={(i) => setRR(i, 3)}
                                    returnKeyType={"next"}
                                    autoCompleteType={'email'}
                                    textContentType={'email'}
            
        
                                />
                            )}
                            name="email"
                            rules={{ required: true }}
                            defaultValue={user.user ? user.user.email : ""}
                        />
                        {errors.email && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <MaskedTextInput
                                    onBlur={onBlur}
                                    style={{ borderBottomWidth: 1, flex: .5, color: 'black',minHeight: 50 }}
                                    value={value}
                                    onChangeText={(formatted, extracted) => onChange(extracted)}
                                    placeholder={'Phone'}
                                    mask={"(999) 999 999"}
                                    keyboardType={'number-pad'}
                                    placeholderTextColor={'gray'}
                                    // onSubmitEditing={(r) => inputRef.filter(a => a.id == 5)[0].rr.focus()}
                                    ref={(i) => setRR(i, 4)}
                                    returnKeyType={"next"}
                                    autoCompleteType={'tel'}
                                    textContentType={'telephoneNumber'}
            
        
                                />
                            )}
                            name="phone"
                            rules={{ required: true }}
                            defaultValue={user.user ? user.user.phone : ""}
                        />
                        {errors.phone && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                    </View>

                    {/* <ToggleSwitch
                        style={{ marginTop: 10 }}
                        isOn={user.user.uses_rewards == 0 ? false : true}
                        onColor="red"
                        offColor="lightgray"
                        label='Use Rewards?'
                        labelStyle={{ flexDirection: 'column', color: config.SECONDARY_COLOR, fontWeight: "900" }}
                        size='medium'
                        onToggle={() => console.log("response")}
                    /> */}

                    <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT, marginTop: 50 }} onPress={handleSubmit(onSubmit)}>
                        <Text style={{ color: 'white' }}>Update Account</Text>
                    </Button>

                </ScrollView>
            }

        </View>

    )
}
import React, { Component, useState, useEffect } from 'react';
import { Text, View, TextInput } from 'react-native';
import { Button } from 'native-base'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
// import TextInputMask from 'react-native-text-input-mask';
import { useForm, Controller } from "react-hook-form";
import { MaskedTextInput } from "react-native-mask-text";



export const UserReg = (props) => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const [btn, setBtn] = useState()
    const [inputRef, setInputRef] = useState([])


    function onSubmit(data) {
        logout(data)
            
      
    }

    async function logout(data) {
        props.set_spin(true)
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.get(`https://${base_url}/${slug}/logout`,
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
                console.log(response)
                addUser(data)

            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.set_spin(false)
                props.getErrors(error.response.data.friendly.name)
            });
    }

    async function addUser(data) {
        props.set_spin(true)
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/user/create/api`, {
            is_guest: false,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: data.password,
            phone: data.phone,
       
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
                console.log(response)
                loginUser(data)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.set_spin(false)
                props.getErrors(error.response.data.friendly.name)
            });
    }

    async function loginUser(data) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/login/api`, {
            email: data.email,
            password: data.password,
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
                console.log(response)
                await AsyncStorage.setItem("@remember_token",JSON.stringify({"token":response.data.remember_token,"user_id":response.data.user.id}))
                getUserInfo(response)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.set_spin(false)
                props.getErrors(error.response)
            });
    }

    async function getUserInfo(data) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/user/history/api`, {
            user_id: data.data.user.id
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
                console.log(response)
                props.setTheUser(response.data)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.set_spin(false)
                props.getErrors(error.response)

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

    useEffect(() => {
        setTimeout(() => {
            console.log(inputRef)
        }, 3000);
    }, [])

    return (
        <View >
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={{ borderBottomWidth: 1, flex: .5, color: 'black',minHeight: 50 }}
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        value={value}
                        placeholder={'First Name'}
                        // onSubmitEditing={(r) => btn.props.onPress()}
                        onFocus={() => props.getErrors(null)}
                        placeholderTextColor={'gray'}
                        onSubmitEditing={(r) => inputRef.filter(a => a.id == 2)[0].rr.focus()}
                        returnKeyType = {"next"}
                        autoCompleteType={'name'}
                        textContentType={'name'}

                    />
                )}
                name="firstName"
                rules={{ required: true }}
                defaultValue=""
            />
            {errors.firstName && <Text>This is required.</Text>}
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={{ borderBottomWidth: 1, flex: .5, color: 'black',minHeight: 50 }}
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        value={value}
                        placeholder={'Last Name'}
                        // onSubmitEditing={(r) => btn.props.onPress()}
                        onFocus={() => props.getErrors(null)}
                        placeholderTextColor={'gray'}
                        onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                        ref={(i) => setRR(i, 2)}
                        returnKeyType = {"next"}
                        autoCompleteType={'name'}
                        textContentType={'name'}

                    />
                )}
                name="lastName"
                rules={{ required: true }}
                defaultValue=""
            />
            {errors.lastName && <Text>This is required.</Text>}
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={{ borderBottomWidth: 1, flex: .5, color: 'black',minHeight: 50 }}
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        value={value}
                        placeholder={'Email'}
                        keyboardType={'email-address'}
                        // onSubmitEditing={(r) => btn.props.onPress()}
                        onFocus={() => props.getErrors(null)}
                        placeholderTextColor={'gray'}
                        onSubmitEditing={(r) => inputRef.filter(a => a.id == 4)[0].rr.focus()}
                        ref={(i) => setRR(i, 3)}
                        returnKeyType = {"next"}
                        autoCompleteType={'email'}
                        textContentType={'email'}

                    />
                )}
                name="email"
                rules={{ required: true }}
                defaultValue=""
            />
            {errors.emailName && <Text>This is required.</Text>}
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <MaskedTextInput
                        onBlur={onBlur}
                        style={{ borderBottomWidth: 1, flex: .5, color: 'black',minHeight: 50 }}
                        value={value}
                        onChangeText={(formatted, extracted) => onChange(extracted)}
                        placeholder={'Phone'}
                        mask={"(999) 999 9999"}
                        keyboardType={'number-pad'}
                        // onSubmitEditing={(r) => btn.props.onPress()}
                        onFocus={() => props.getErrors(null)}
                        placeholderTextColor={'gray'}
                        onSubmitEditing={(r) => inputRef.filter(a => a.id == 5)[0].rr.focus()}
                        ref={(i) => setRR(i, 4)}
                        returnKeyType = {"next"}
                        autoCompleteType={'tel'}
                        textContentType={'telephoneNumber'}

                    />
                )}
                name="phone"
                rules={{ required: true }}
                defaultValue=""
            />
            {errors.phone && <Text>This is required.</Text>}
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={{ borderBottomWidth: 1, flex: .5, color: 'black',minHeight: 50 }}
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        value={value}
                        placeholder={'Password'}
                        onSubmitEditing={(r) => btn.props.onPress()}
                        onFocus={() => props.getErrors(null)}
                        placeholderTextColor={'gray'}
                        ref={(i) => setRR(i, 5)}
                        returnKeyType = {"done"}
                        autoCompleteType={'password'}
                        textContentType={'password'}

                    />
                )}
                name="password"
                rules={{ required: true }}
                defaultValue=""
            />
            {errors.password && <Text>This is required.</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button onPress={handleSubmit(onSubmit)} ref={(button) => setBtn(button)} style={{ backgroundColor: 'gray', padding: 20, marginTop: 20, borderRadius: 20 }}>
                    <Text style={{ color: "white" }}>Register</Text>
                </Button>
                <Text style={{ fontWeight: 'bold', marginTop: 30, marginLeft: 10 }} onPress={() => props.signUp()}>Have Account?</Text>
            </View>
        </View>
    )
}
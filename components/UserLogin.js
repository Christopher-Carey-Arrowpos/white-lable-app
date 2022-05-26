import React, { Component, useState, useEffect } from 'react';
import { Text, View, TextInput } from 'react-native';
import { Button } from 'native-base'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
//userlogin.js


export const UserLogin = (props) => {
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [btn, setBtn] = useState()
    const [inputRef, setInputRef] = useState([])



    function login() {
        logout()
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
                login()


            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.set_spin(false)
                props.getErrors(error.response.data.friendly.name)
            });
    }

    async function login() {
        props.set_spin(true)
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/login/api`, {
                email: email,
                password: password,
                remember_me:true
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
                await AsyncStorage.setItem("@remember_token",JSON.stringify({"token":response.data.remember_token,"user_id":response.data.user.id}))
                console.log(response)
                getUserInfo(response)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.set_spin(false)
                props.getErrors(error.response.data.friendly.name)
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
                props.getCart()
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.getErrors(error.response.data.friendly.description)
                props.set_spin(false)
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

    useEffect(async () => {
    }, [])

    return (
        <View >
            <TextInput
                style={{ borderBottomColor: "lightgray", borderBottomWidth: 1,color:'black',minHeight: 50,fontSize: 30,textAlign: 'center' }}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType={'email-address'}
                onFocus={()=>props.getErrors(null)}
                placeholderTextColor={'gray'}
                onSubmitEditing={(r) => inputRef.filter(a => a.id == 2)[0].rr.focus()}
                returnKeyType = {"next"}
                autoCompleteType={'email'}
                textContentType={'emailAddress'}

            />
            <TextInput
                style={{ borderBottomColor: "lightgray", borderBottomWidth: 1,color:'black',minHeight: 50,fontSize: 30,textAlign: 'center'  }}
                selectionColor={'red'}
                onChangeText={setPassword}
                placeholder="Enter Password"
                onFocus={()=>props.getErrors(null)}
                placeholderTextColor={'gray'}
                onSubmitEditing={(r) => btn.props.onPress()}
                ref={(i) => setRR(i, 2)}
                returnKeyType = {"done"}
                autoCompleteType={'password'}
                textContentType={'password'}
                autoComplete={'password'}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Button onPress={() => login()} ref={(button) => setBtn(button)} style={{ backgroundColor: config.SECONDARY_COLOR, padding: 20, marginTop: 20, borderRadius: 20,width: '100%',justifyContent: "center" }}>
                    <Text style={{ color: "white",fontSize: 25 }}>Login</Text>
                </Button>
                {/* <Text style={{ fontWeight: 'bold', marginTop: 20, marginLeft: 10 }} onPress={() => props.signUp()}>SIGN UP</Text> */}
            </View>
        </View>
    )
}

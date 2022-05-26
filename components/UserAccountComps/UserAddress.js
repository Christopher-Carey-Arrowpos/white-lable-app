import React, { Component, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Text, View, TouchableWithoutFeedback } from 'react-native';
import { Card, H1, Icon } from 'native-base'
import config from '../../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native';
import axios from "axios";


export const UserAddress = (props) => {
    const [user, setUser] = useState()


    async function makeDefault(id) {
        let uu = user
        let rep = uu.addresses.filter(a => a.default)[0]
        rep && delete rep.default;
        let address = uu.addresses.filter(a => a.id == id)[0]
        address.default = true
        await AsyncStorage.setItem('@user_data', JSON.stringify(uu))
        props.route.params.refes()
        refresh()
    }

    async function DelAddress(item){
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/user/addresses/destroy/api`, {
            address_id: item.id
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
            });
    }

    async function getUserInfo() {
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
                await AsyncStorage.setItem('@user_data', JSON.stringify(response.data))
                props.route.params.refes()
                refresh()
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
            })
    }

    useLayoutEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async () => {
            AsyncStorage.getItem("@user_data")
                .then((value) => {
                    setUser(JSON.parse(value))
                })
        });
        return unsubscribe;
    }, []);

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 10 }}>
                <H1 style={{ fontWeight: 'bold' }}>Address</H1>
            </View>
            <ScrollView>
                {user &&
                    user.addresses &&
                    user.addresses.map((item, i) => (
                        <TouchableWithoutFeedback key={i} style={{}}>
                            <Card style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        {item.default &&
                                            <Icon style={{ color: 'green' }} type="Entypo" name="star" />
                                        }
                                        {item.display_name}
                                    </Text>
                                    <Text>{item.address}</Text>
                                    <Text>{item.city} {item.state} {item.zip}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableWithoutFeedback style={{ backgroundColor: 'red' }} onPress={() => DelAddress(item)}>
                                        <Icon style={{ fontSize: 25,color: config.SECONDARY_COLOR }} type="AntDesign" name="delete" />
                                    </TouchableWithoutFeedback>
                                    <TouchableWithoutFeedback style={{ backgroundColor: 'red' }} onPress={() => props.navigation.navigate('EditAddress', { "refresh": refresh, "id": item.id })}>
                                        <Text style={{  }}>
                                        <Icon style={{ fontSize: 22,color: config.SECONDARY_COLOR }} type="FontAwesome5" name="edit" />
                                            </Text>
                                    </TouchableWithoutFeedback>
                                    {item.default ?
                                        <TouchableWithoutFeedback style={{ backgroundColor: 'red' }}>
                                            <Text style={{ color: "rgba(255, 255, 255, 0)" }} > SET DEFAULT</Text>
                                        </TouchableWithoutFeedback>
                                        :
                                        <TouchableWithoutFeedback style={{ backgroundColor: 'red', padding: 10 }} onPress={() => makeDefault(item.id)}>
                                            <Text style={{ color: config.SECONDARY_COLOR }} >SET DEFAULT</Text>
                                        </TouchableWithoutFeedback>
                                    }
                                </View>
                            </Card>
                        </TouchableWithoutFeedback>
                    ))
                }
                <TouchableWithoutFeedback onPress={() => props.navigation.navigate('NewAddress')}>
                    <Card style={{ padding: 20, flexDirection: 'row' }}>
                        <Icon style={{}} type="Entypo" name="squared-plus" />
                        <Text>Add New Address</Text>
                    </Card>
                </TouchableWithoutFeedback>
            </ScrollView>
        </View>
    )
}
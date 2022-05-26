import React, { Component, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Button, Card, H1, Icon, Picker } from 'native-base'
import { Text, View, TouchableWithoutFeedback } from 'react-native';
import config from '../../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
// import { Picker as SelectPicker } from '@react-native-picker/picker';
import moment from 'moment'


export const OrderType = (props) => {
    const [serviceType, setServiceType] = useState()
    const [time, setTime] = useState("asap")
    const [types, setTypes] = useState()
    const [dateTime, setDateTime] = useState(moment())
    const [dates, setDates] = useState()
    const [hours, setHours] = useState()
    const [errors, setErrors] = useState()


    function SubmitOptions() {
        setErrors(null)
        if (time == 'asap') {
            props.setServiceType(serviceType)
            props.setTime(dateTime)
            props.changeStep("plus")
            DeferredDateClear()

        } else {
            DeferredCheck()
        }
    }

    async function DeferredDateClear() {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.get(`https://${base_url}/${slug}/store/deferred/dates/clear`, {
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
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                setErrors(error.response.data.message)
            });
    }

    async function DeferredCheck() {
        console.log(dateTime)
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/store/deferred/check`, {
            service_type_id: serviceType.id,
            date_to_check: dateTime,
            business_date: moment(dateTime, "MM/DD/YYYY HH:mm A").format("YYYY-MM-DD")
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
                props.setServiceType(serviceType)
                props.setTime(dateTime)
                props.changeStep("plus")
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                setErrors(error.response.data.message)
            });
    }

    async function getDeferred() {
        setTime('later')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/store/deferred/dates`, {
            service_type_id: serviceType.id
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
                setDates(response.data)
                setHours(response.data.first_date_hours)
                setDateTime(response.data.first_date_hours[0])
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }

    async function getDeferredHours(date) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/store/deferred/hours`, {
            service_type_id: serviceType.id,
            deferred_date: date,
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
                setHours(response.data.hours)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }

    useLayoutEffect(() => {
        const getTheStuff = async () => {
            AsyncStorage.getItem("@home_location")
                .then((value) => {
                    setTypes(JSON.parse(value).service_types)
                    setServiceType(JSON.parse(value).service_types[0])
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        getTheStuff()
    }, []);

    return (
        <View style={{ padding: 10 }}>
            <View style={{}}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }} >
                    {types &&
                        types.map((item, i) => (
                            <TouchableWithoutFeedback key={i} onPress={() => { setServiceType(item), setTime("asap"), setErrors(null) }}>
                                <Card style={{ alignItems: 'center', padding: 20, width: 150, backgroundColor: "white", borderColor: serviceType && serviceType.id == item.id ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR, borderWidth: 2, elevation: serviceType && serviceType.id == item.id ? 20 : 0 }}>
                                    {item.pos_id == 1 ?
                                        <Icon style={{ fontSize: 20, color: serviceType && serviceType.id == item.id ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR }} type="FontAwesome5" name="car-side" />
                                        :
                                        <Icon style={{ fontSize: 20, color: serviceType && serviceType.id == item.id ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR }} type="FontAwesome5" name="walking" />
                                    }
                                    <H1 style={{ color: serviceType && serviceType.id == item.id ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR, textAlign: "center" }}>{item.name}</H1>
                                    {serviceType && serviceType.id == item.id &&
                                    <Text style={{color:config.SECONDARY_ACCENT,fontFamily: 'AppRegular'}}>(Selected)</Text>
                                    }

                                </Card>
                            </TouchableWithoutFeedback>
                        ))}
                </View>
                <View style={{ borderBottomWidth: 1, marginTop: 20, marginBottom: 20 }}></View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }} >
                    <TouchableWithoutFeedback onPress={() => setTime('asap')}>
                        <Card style={{ alignItems: 'center', padding: 20, width: 150, backgroundColor: "white", borderColor: time && time == 'asap' ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR, borderWidth: 2, elevation: time && time == 'asap' ? 20 : 0 }}>
                            <Icon style={{ fontSize: 20, color: time && time == "asap" ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR }} type="MaterialIcons" name="access-time" />
                            <H1 style={{ color: time && time == "asap" ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR, textAlign: "center" }}>ASAP</H1>
                            {time && time == "asap" &&
                                <Text style={{color:config.SECONDARY_ACCENT,fontFamily: 'AppRegular'}}>(Selected)</Text>
                            }
                        </Card>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={getDeferred}>
                        <Card style={{ alignItems: 'center', padding: 20, width: 150, backgroundColor: "white", borderColor: time && time == 'later' ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR, borderWidth: 2, elevation: time && time == 'later' ? 20 : 0 }}>
                            <Icon style={{ fontSize: 20, color: time && time == 'later' ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR }} type="AntDesign" name="calendar" />
                            <H1 style={{ color: time && time == 'later' ? config.SECONDARY_ACCENT : config.SECONDARY_COLOR, textAlign: "center" }}>Later</H1>
                            {time && time == 'later' &&
                                <Text style={{color:config.SECONDARY_ACCENT,fontFamily: 'AppRegular'}}>(Selected)</Text>
                            }
                        </Card>
                    </TouchableWithoutFeedback>
                </View>
                <View style={{ marginTop: 10 }}>
                    {errors &&
                        <Text style={{ color: 'red', textAlign: 'center',fontFamily: 'AppRegular' }}>{errors}</Text>
                    }
                    {dates &&
                        time == 'later' &&
                        <View>
                            <View style={{ borderBottomWidth: 1 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 15,fontFamily: 'AppRegular' }}><Icon style={{ fontSize: 20 }} type="AntDesign" name="calendar" />  Pick Date</Text>
                                <Picker
                                    note
                                    mode="dropdown"
                                    style={{}}
                                    // selectedValue={dates.first_date}
                                    // onValueChange={(d) => console.log(d)}
                                    onValueChange={(d) => getDeferredHours(d)}
                                >
                                    {dates.dates.map((item, i) => (
                                        <Picker.Item key={i} label={item} value={item} />
                                    ))}
                                </Picker>
                            </View>
                            {hours &&
                                <View style={{ borderBottomWidth: 1 }}>
                                    <Text style={{ fontWeight: 'bold',fontFamily: 'AppRegular' }}><Icon style={{ fontSize: 20 }} type="MaterialIcons" name="access-time" />  Pick Time</Text>
                                    <Picker
                                        note
                                        mode="dropdown"
                                        style={{}}
                                        // selectedValue={this.state.selected}
                                        onValueChange={(r) => setDateTime(r)}
                                    >
                                        {hours.map((item, i) => (
                                            <Picker.Item key={i} label={item} value={item} />
                                        ))}
                                    </Picker>
                                </View>
                            }
                        </View>
                    }
                </View>
                <View style={{ justifyContent: 'center', flexDirection: 'row', marginTop: 40 }}>
                    <Button style={{ padding: 20, backgroundColor: 'white', borderWidth: 1, borderColor: config.SECONDARY_ACCENT }} onPress={SubmitOptions}>
                        <H1 style={{ color: config.SECONDARY_ACCENT }}>Continue</H1>
                    </Button>
                </View>
            </View>
        </View>
    )
}

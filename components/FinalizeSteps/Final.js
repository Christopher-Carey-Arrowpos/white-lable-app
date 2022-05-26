import React, { Component, useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableWithoutFeedback, Modal, Image } from 'react-native';
import { Button, Icon, H2, Card, CardItem, Grid, Col, H1 } from 'native-base'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config.json'
import axios from "axios";
import { WebView } from 'react-native-webview';
// import Spinner from 'react-native-spinkit';
import { useNavigation } from '@react-navigation/native';
import { CreditComp } from './CreditComp'
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { EnterOffer } from './EnterOffer';

import { Flow } from 'react-native-animated-spinkit'


export const Final = (props) => {
    const [firstHalf, setFirstHalf] = useState('first-half')
    const [secondHalf, setSecondHalf] = useState('second-half')
    const [paymentType, setPaymentType] = useState()
    const [guestResponse, setGuestResponse] = useState()
    const [modal, setModal] = useState(false)
    const [address, setAddress] = useState()
    const [waitConfirm, setWaitConfirm] = useState(false)
    const [complete, setComplete] = useState(false)
    const navigation = useNavigation();
    const [user, setUser] = useState()
    const [showCredit, setShowCredit] = useState(false)
    const [showOffer,setShowOffer] = useState(false)


    async function SetServiceType(type) {
        type == 'cash' && setWaitConfirm(true), setModal(false)
        let data = props.serviceType.pos_id === 1 ?
            {
                service_type_id: props.serviceType.id,
                address: address ? address.address : null,
                address2: address ? address.address2 : null,
                city: address ? address.city : null,
                state: address ? address.state : null,
                zip: address ? address.zip : null,
                curbside_sms: false,
                user_id: user && user.id
            }
            :
            {
                service_type_id: props.serviceType.id,
                curbside_sms: false,
                user_id: user && user.id
            };
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/cart/setServiceType/api`, data,
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
                if (type == 'cash') {
                    finalizeOrder(type)
                } else {
                    setShowCredit(true)
                }
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                // setShowCredit(true)
                setWaitConfirm(false)
                setModal(false)
                props.getErrors(error.response.data.friendly ? error.response.data.friendly.name : error.response.data.message)
            });
    }


    async function finalizeOrder(type) {
        let order_object = props.serviceType.pos_id === 1 ?
            {
                payment_type: type,
                address_id: address.id,
                comment: null,
                cart_id: props.cart.id,
                user_id: user && user.id
            }
            :
            {
                payment_type: type,
                cart_id: props.cart.id,
                user_id: user && user.id
            }
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/cart/finalize/api`, order_object,
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
                if (response.data.deferred_datetime) {
                    setComplete(true)
                    props.getCart()
                } else {
                    confirmOrder(response.data.reference)
                }

            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                setWaitConfirm(false)
                setModal(false)
                props.getErrors(error.response.data.friendly.name)
            });
    }

    function confirmOrder(reference) {
        Pusher.logToConsole = true;
        var pusher = new Pusher("swACx0hWNb", {
            wsHost: 'pusher.arrowpos.com',
            wsPort: '6969',
            wssPort: '6969',
            cluster: 'mt1',
            enabledTransports: ['ws', 'wss'],
        });
        let echo = new Echo({
            broadcaster: 'pusher',
            host: 'ws://pusher.arrowpos.com:6969',
            client: pusher,
        });
        echo.channel('order_update_event')
            .listen('OrderUpdateEvent', e => {
                try {
                    let order = JSON.parse(e.message);
                    console.log(order)
                    if (order.reference === reference) {
                        setComplete(true)
                        props.getCart()
                        pusher.disconnect()
                    }
                } catch (e) {
                    console.log('junk message');
                }
            });

    }

    async function addUser(data) {
        console.log(props.address)
        console.log(props.name)
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/user/create/api`, {
            is_guest: true,
            first_name: props.name.firstName,
            last_name: props.name.lastName,
            email: props.name.email,
            phone: props.name.phone,
            address: props.address ? {
                address: props.address.address,
                city: props.address.city,
                state: props.address.state,
                zip: props.address.zip
            } : null
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
                await AsyncStorage.setItem('@guest_user_data', JSON.stringify(response.data))
                setUser(response.data)
                if (response.data.addresses) {
                    setAddress(response.data.addresses[0])
                }


                setModal(true)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.getErrors(error.response.data.friendly.name)
            });
    }

    async function getUserInfo(data) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/user/history/api`, {
            user_id: data.data.id
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
                await AsyncStorage.setItem('@guest_user_data', JSON.stringify(response.data))
                setUser(response.data)
                setAddress(response.data.addresses[0])
                setModal(true)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.getErrors(error.response.data.friendly.name)
            });
    }

    async function onSubmit() {
        let gu = JSON.parse(await AsyncStorage.getItem('@guest_user_data'))
        if (gu) {
            setUser(gu)
            if (gu.addresses > 0) {
                setAddress(gu.addresses[0])
            }

            setModal(true)
            return
        }
        if (!user) {
            addUser()
        } else {
            setModal(true)
        }
    }

    useEffect(() => {
        props.user && setUser(props.user.user)
        props.address && setAddress(props.address)
    }, [])

    return (
        <View style={{ height: '100%' }}>
            {showOffer &&
                <EnterOffer
                    showOffer={showOffer}
                    exit={() => setShowOffer(false)}
                    />
            }
            {showCredit &&
                <CreditComp
                    showCredit={showCredit}
                    cart={props.cart}
                    address={address}
                    user={user}
                    exit={() => setShowCredit(false)}
                    getCart={props.getCart}
                />
            }
            <Modal
                animationType="slide"
                transparent={true}
                visible={waitConfirm}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(110, 110, 110, 0.65)",
                }}>
                    <View style={{
                        margin: 20,
                        backgroundColor: "white",
                        borderRadius: 20,
                        padding: 35,
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5
                    }}>
                        {complete ?
                            <View>
                                <H1 style={{ textAlign: 'center', color: config.PRIMARY_COLOR }}>Thank You!!</H1>
                                <Image
                                    source={{ uri: 'https://emoji.discord.st/emojis/14bfac17-f7fa-4b90-bd91-768fd2e83a1b.gif' }}
                                    style={{ width: 200, height: 200, marginLeft: 'auto', marginRight: 'auto' }}
                                />
                                <Button
                                    onPress={() => navigation.navigate('Home')}
                                    style={{ backgroundColor: config.PRIMARY_COLOR, padding: 10, marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}
                                >
                                    <H1 style={{ color: 'white' }}>HOME</H1>
                                </Button>
                            </View>
                            :
                            <View>
                                <Text style={{ textAlign: 'center',fontFamily: 'AppRegular' }}>Confirming Order</Text>
                                {/* <Spinner isVisible={true} size={200} type={"ThreeBounce"} color={config.PRIMARY_COLOR} /> */}
                                <Flow  size={200}  color={config.PRIMARY_COLOR}></Flow>
                            </View>
                        }
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modal}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(110, 110, 110, 0.65)",
                }}>
                    <View style={{
                        margin: 20,
                        backgroundColor: "white",
                        borderRadius: 20,
                        padding: 35,
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5
                    }}>

                        <View>
                            <View >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: .5, borderBottomColor: 'lightgray' }}>
                                    <H2 style={{ textAlign: 'center' }}>Choose Payment Type</H2>
                                    <Icon onPress={() => setModal(false)} style={{ textAlign: 'center', color: 'red', marginLeft: 30 }} type="AntDesign" name="close" />
                                </View>
                                <View style={{  marginLeft: 'auto', marginRight: 'auto',flexDirection:'row',justifyContent:'space-around',width:'100%' }}>
                                    {props.serviceType.allow_credit == 1 &&
                                        <TouchableWithoutFeedback onPress={() => SetServiceType("credit")} >
                                            <Card style={{ alignItems: 'center',borderRadius:100/2, padding: 10, width: 100,height:100,borderWidth:1,borderColor: config.SECONDARY_COLOR , marginTop: 20 }}>
                                                <Icon style={{ color: config.SECONDARY_COLOR }} type="FontAwesome" name="credit-card" />
                                                <H1 style={{ color: config.SECONDARY_COLOR, textAlign: "center" }}>Credit</H1>
                                            </Card>
                                        </TouchableWithoutFeedback>
                                    }
                                    {props.serviceType.allow_cash == 1 &&
                                        <TouchableWithoutFeedback onPress={() => SetServiceType("cash")}>
                                            <Card style={{ alignItems: 'center',borderRadius:100/2, padding: 10, width: 100,height:100,borderWidth:1,borderColor: config.SECONDARY_COLOR , marginTop: 20 }}>
                                                <Icon style={{ color: config.SECONDARY_COLOR  }} type="MaterialIcons" name="attach-money" />
                                                <H1 style={{ color: config.SECONDARY_COLOR, textAlign: "center" }}>Cash</H1>
                                            </Card>
                                        </TouchableWithoutFeedback>
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                    onPress={onSubmit}
                    style={{ backgroundColor: config.SECONDARY_COLOR, padding: 10 }}
                >
                    <H1 style={{ color: 'white' }}>Submit</H1>
                </Button>
                <Button
                    onPress={()=>setShowOffer(true)}
                    style={{ borderWidth: 1, borderColor: config.PRIMARY_COLOR, backgroundColor: "white", padding: 10, }}
                >
                    <H1 style={{ color: config.PRIMARY_COLOR }}>Add Offer</H1>
                </Button>
            </View>
            <ScrollView
                persistentScrollbar={true}
            >
                <View style={{ width: '100%' }}>
                    <Card style={{ padding: 10, backgroundColor: config.ACCENT_COLOR }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomColor: 'white', borderBottomWidth: .5 }}>
                            <Text style={{ fontWeight: 'bold', color: 'white',fontFamily: 'AppRegular' }}>{props.serviceType.name} - </Text>
                            <Text style={{ fontWeight: 'bold', color: 'white',fontFamily: 'AppRegular' }}>{props.time == 'asap' ? "ASAP" : "Time"}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
                            <TouchableWithoutFeedback onPress={() => props.user ? {} : props.changeStep(null, 1)}>
                                <View >
                                    {!props.user ?
                                        <Text style={{ color: 'white', borderBottomWidth: 1, borderBottomColor: 'gray', textAlign: 'center',fontFamily: 'AppRegular' }} ><Icon style={{ fontSize: 15, color: "white" }} type="AntDesign" name="edit" />  EDIT</Text>
                                        :
                                        <Text style={{ color: "rgba(255, 255, 255, 0)", borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0)", textAlign: 'center',fontFamily: 'AppRegular' }} ><Icon style={{ fontSize: 15, color: "rgba(255, 255, 255, 0)" }} type="AntDesign" name="edit" />  EDIT</Text>
                                    }
                                    <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>{props.name.firstName} {props.name.lastName}</Text>
                                    <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>{props.name.email}</Text>
                                    <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>{props.name.phone}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            {props.serviceType.name != 'Pickup' &&
                                <TouchableWithoutFeedback onPress={() => props.changeStep(null, 2, "edit")}>
                                    <View>
                                        <Text style={{ color: 'white', borderBottomWidth: 1, borderBottomColor: 'gray', textAlign: 'center',fontFamily: 'AppRegular' }} ><Icon style={{ fontSize: 15, color: "white" }} type="AntDesign" name="edit" />  EDIT</Text>
                                        <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>{props.address.display_name}</Text>
                                        <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>{props.address.address}</Text>
                                        {props.address.address2 != "" &&
                                            <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>{props.address.address_two}</Text>
                                        }
                                        <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>{props.address.city} {props.address.state} {props.address.zip}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            }
                        </View>
                    </Card>
                </View>
                {props.cart &&
                    props.cart.lines.map((item, i) => (
                        <TouchableWithoutFeedback key={i}>
                            <Card>
                                <CardItem style={{ flexDirection: 'column' }}>
                                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View>
                                            {!item.addon_id ?
                                                <Text style={{fontFamily: 'AppRegular'}}>{item.quantity} x {item.friendly_name ? item.friendly_name : item.name}</Text>
                                                :
                                                <Text style={{fontFamily: 'AppRegular'}}>+ Addon {item.friendly_name ? item.friendly_name : item.name}</Text>
                                            }
                                        </View>
                                        <View><Text style={{fontFamily: 'AppRegular'}}>{(item.subtotal * item.quantity).toFixed(2)}</Text></View>
                                    </View>
                                    <View style={{ width: "100%", marginLeft: 40 }}>
                                        {item.modifications.whole &&
                                            item.modifications.whole.map((x, i) => (
                                                <View key={i}>
                                                    <Text style={{fontFamily: 'AppRegular'}}>- {x.size == "extra" ? "Extra " + x.name : x.name}</Text>
                                                </View>
                                            ))
                                        }
                                        <Grid>
                                            <Col>
                                                {item.modifications[firstHalf] &&
                                                    <View >
                                                        <Text style={{ fontWeight: 'bold',fontFamily: 'AppRegular' }}><Icon style={{ color: config.PRIMARY_COLOR, transform: [{ rotate: '180deg' }] }} type="MaterialCommunityIcons" name="circle-slice-4" /> Left</Text>
                                                        {item.modifications[firstHalf].map((x, i) => (
                                                            <Text style={{fontFamily: 'AppRegular'}} key={i}>- {x.size == "extra" ? "Extra " + x.name : x.name}</Text>
                                                        ))}
                                                    </View>
                                                }
                                            </Col>
                                            <Col>
                                                {item.modifications[secondHalf] &&
                                                    <View >
                                                        <Text style={{ fontWeight: 'bold',fontFamily: 'AppRegular' }}>Right <Icon style={{ color: config.PRIMARY_COLOR }} type="MaterialCommunityIcons" name="circle-slice-4" /> </Text>
                                                        {item.modifications[secondHalf].map((x, i) => (
                                                            <Text style={{fontFamily: 'AppRegular'}} key={i}>- {x.size == "extra" ? "Extra " + x.name : x.name}</Text>
                                                        ))}
                                                    </View>
                                                }
                                            </Col>
                                        </Grid>
                                    </View>
                                </CardItem>
                            </Card>
                        </TouchableWithoutFeedback>
                    ))}
            </ScrollView>
            {props.cart &&
                <View style={{ width: '100%' }}>
                    <Card style={{ flexDirection: 'column', justifyContent: 'space-between', padding: 10, alignItems: 'center', backgroundColor: config.ACCENT_COLOR }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "100%" }}>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', fontSize: 20,fontFamily: 'AppRegular' }}>Subtotal:</Text>
                            </View>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', textAlign: 'right', fontSize: 20,fontFamily: 'AppRegular' }}>${props.cart.subtotal.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "100%" }}>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', fontSize: 20,fontFamily: 'AppRegular' }}>Tax:</Text>
                            </View>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', textAlign: 'right', fontSize: 20,fontFamily: 'AppRegular' }}>${props.cart.tax.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "100%" }}>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', fontSize: 20,fontFamily: 'AppRegular' }}>Total:</Text>
                            </View>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', textAlign: 'right', fontSize: 20,fontFamily: 'AppRegular' }}>${props.cart.total.toFixed(2)}</Text>
                            </View>
                        </View>
                    </Card>
                </View>
            }
        </View>
    )
}

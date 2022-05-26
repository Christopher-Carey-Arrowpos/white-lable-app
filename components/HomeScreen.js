import React, { Component, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Dimensions, KeyboardAvoidingView, Alert, Linking } from 'react-native';
import { Button, Icon, Card, H1, H2} from 'native-base'
import { UserLogin } from './UserLogin'
import config from '../config.json'
import moment from 'moment'
import { Tooltip } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserReg } from './UserReg'
// import Spinner from 'react-native-spinkit';
import AnimateNumber from 'react-native-countup'
import axios from "axios";
// import Video from 'react-native-video';
import * as Device from 'expo-device';
import { Flow } from 'react-native-animated-spinkit'
import { Video } from 'expo-av';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

console.log('stuff')
console.log(Device);



export const HomeScreen = (props) => {
    const [item, setItem] = useState()
    const [user, setUser] = useState()
    const [signUp, setSignUp] = useState()
    const [spin, setSpin] = useState()
    const [showSignup, setShowSignUp] = useState()
    const [showLogin, setShowLogin] = useState(false)
    const [errors, setErrors] = useState()
    const [expOffers, setExpOffers] = useState()
    const [splashVid, setSplashVid] = useState(config.SPLASH_VIDEO)

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        if (config.USES_PUSH) {
            registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

            // This listener is fired whenever a notification is received while the app is foregrounded
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                setNotification(notification);
            });

            // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log(response);
            });

            return () => {
                Notifications.removeNotificationSubscription(notificationListener.current);
                Notifications.removeNotificationSubscription(responseListener.current);
            };
        }
    }, []);

    async function registerForPushNotificationsAsync() {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;

            //handle sending the token to the notification service
            if (config.USES_PUSH) {
                let home_location = JSON.parse(await AsyncStorage.getItem('@home_location'));
                axios.post(config.PUSH_ENDPONT, {
                    arrow_store_id: home_location.arrow_store_id,
                    expo_push_token: token,
                    device_manufacturer: Device.manufacturer
                }).then(function (res) {

                }).catch(function (err) {
                    //do nothing, can't stop operation.
                    console.log(err);
                })
            }


        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    }




    function toProper(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    function getErrors(mes) {
        setErrors(mes)
    }

    async function logout() {
        await AsyncStorage.removeItem('@user_data')
        await AsyncStorage.removeItem('@remember_token')
        setUser(null)
        props.logout()

    }

    async function setTheUser(data) {
        await AsyncStorage.setItem('@user_data', JSON.stringify(data))
        setUser(data)
        setShowSignUp(false)
        setShowLogin(false)
        setSpin(false)
        props.login()

    }



    async function login() {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        let ut = JSON.parse(await AsyncStorage.getItem('@remember_token'))

        axios.post(`https://${base_url}/${slug}/login/token/api`, {
            remember_token: ut.token,
            user_id: ut.user_id

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
                await AsyncStorage.setItem("@remember_token", JSON.stringify({ "token": response.data.remember_token, "user_id": response.data.user.id }))
                getUserInfo(response)
            })
            .catch(function (error) {
                logout()

                // props.set_spin(false)
                // props.getErrors(error.response.data.friendly.description)
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
                setTheUser(response.data)
                props.getCart()
            })
            .catch(function (error) {
                props.getErrors(error.response.data.friendly.description)
                props.set_spin(false)
            });
    }






    useLayoutEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async () => {
            let uu = JSON.parse(await AsyncStorage.getItem('@user_data'))
            let location = JSON.parse(await AsyncStorage.getItem('@home_location'))
            let ut = JSON.parse(await AsyncStorage.getItem('@remember_token'))

            axios.post(`https://portal.arrowpos.com/locations/getappstatus`, {
                arrow_store_id: location.arrow_store_id
            })
                .then(async function (response) {
                    if (response.data.status == "disabled") {
                        Alert.alert("Sorry", `We’re working on a few things right now. Please call us at ${location.phone} to place your order.`, [
                            { text: "Ok", onPress: () => props.navigation.navigate('StoreLocation', { screen: 'StoreLocations' }) },
                        ]);
                    }

                    if (response.data.status == "ok") {
                        setItem(JSON.parse(await AsyncStorage.getItem('@home_location')))
                        if (ut) {
                            login()
                        }
                        if (uu) {
                            setUser(uu)
                            setShowSignUp(false)
                            setShowLogin(false)
                            setSpin(false)
                            props.login()
                            if (uu.offers.length > 0) {
                                let arr = []
                                uu.offers.map((item, i) => {
                                    let now = moment().format('M/D/YYYY')
                                    let exp = moment(item.ExpDate)
                                    let dif = moment(item.ExpDate).diff(moment(), 'days')
                                    console.log(dif)
                                    if (dif <= 7) {
                                        arr.push(item)
                                    }
                                })
                                setExpOffers(arr)
                            }
                        }
                    }

                    if (response.data.status == "needs_update") {
                        if (Device.osName == "Android") {
                            Linking.openURL(`https://play.google.com/store/apps/details?id=${response.data.app_pkg_name}`)
                        } else {
                            Linking.openURL(`https://apps.apple.com/tr/app/${response.data.app_pkg_name.split(".")[1]}`)
                        }
                    }
                })
                .catch(async function (error) {
                    console.log(error);
                    console.log(error.response);
                    console.log(error.response.data.error)
                    setItem(JSON.parse(await AsyncStorage.getItem('@home_location')))
                    let ut = JSON.parse(await AsyncStorage.getItem('@remember_token'))
                    if (ut) {
                        login()
                    }
                    if (uu) {
                        setUser(uu)
                        setShowSignUp(false)
                        setShowLogin(false)
                        setSpin(false)
                        props.login()


                        if (uu.offers.length > 0) {
                            let arr = []
                            uu.offers.map((item, i) => {
                                let now = moment().format('M/D/YYYY')
                                let exp = moment(item.ExpDate)
                                let dif = moment(item.ExpDate).diff(moment(), 'days')
                                if (dif <= 7) {
                                    arr.push(item)
                                }
                            })
                            setExpOffers(arr)
                        }
                    }


                });
        });
        return unsubscribe;
    })

    return (
        <View style={{ padding: 20 }}>
            {splashVid == "true" &&
                <Video
                    source={require('../VIDEO/Splash.mp4')}
                    // rate={1.0}
                    // volume={1.0}
                    // isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    isLooping
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        height: Dimensions.get('window').height
                    }}
                />
            }

            <ScrollView>
                <KeyboardAvoidingView
                    behavior="padding"
                >
                    {item &&
                        <View style={{ alignItems: 'center', flex: 1, backgroundColor: splashVid == 'true' ? "rgba(255, 255, 255, .5) " : null, borderRadius: 20, marginBottom: 20 }}>
                            <Text style={{ textAlign: 'center', fontWeight: '700',fontFamily: 'AppBold' }}> {item.address && toProper(item.address)}</Text>
                            <Text style={{ textAlign: 'center', fontWeight: '700',fontFamily: 'AppBold' }}> {item.city && toProper(item.city)}, {item.state && item.state} {item.zip && item.zip}</Text>
                            {item[`${moment().format('dddd').toLowerCase()}_display_hours`].match(/Am/gi) ?
                                <Tooltip
                                    height={200}
                                    width={200}
                                    withOverlay={false}
                                    skipAndroidStatusBar={true}
                                    popover={
                                        <View>
                                            <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold',fontFamily: 'AppBold' }}>DAILY HOURS</Text>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>Mon</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>Tues</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>Wed</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>Thur</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>Fri</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>Sat</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>Sun</Text>
                                                </View>
                                                <View style={{ marginLeft: 15 }} >
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>{item.monday_display_hours}</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>{item.tuesday_display_hours}</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>{item.wednesday_display_hours}</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>{item.thursday_display_hours}</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>{item.friday_display_hours}</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>{item.saturday_display_hours}</Text>
                                                    <Text style={{ color: 'white',fontFamily: 'AppBold' }}>{item.sunday_display_hours}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 15 }}>
                                                <Icon style={{ color: "white", fontSize: 30 }} type="MaterialCommunityIcons" name="truck-fast" />
                                                <Text>Delivery</Text>
                                                <Icon style={{ color: "white", fontSize: 30 }} type="Ionicons" name="car" />
                                                <Text>Curbside</Text>
                                            </View>
                                        </View>
                                    }>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                        <Text style={{ textAlign: 'center', marginTop: 10 }}>Open {item[`${moment().format('dddd').toLowerCase()}_display_hours`]}</Text>
                                        <Icon style={{ color: "orange", marginTop: 7, marginLeft: 15 }} type="Entypo" name="info-with-circle" />
                                    </View>
                                </Tooltip>
                                :
                                <Text style={{ textAlign: 'center', marginTop: 10 }}>Hours Not Available</Text>
                            }
                            <Text onPress={() => props.navigation.navigate('StoreLocation', { screen: 'StoreLocations' })} style={{ color: config.SECONDARY_COLOR, textAlign: 'center', marginTop: 9 }}>CHANGE STORE</Text>
                        </View>
                    }
                    {/* </Card> */}
                    {/* <Card style={{ padding: 15, borderRadius: 20, justifyContent: 'space-between', flexDirection: 'row' }}> */}
                    {/* <Icon style={{ fontSize: 40, color: config.SECONDARY_ACCENT }} type="FontAwesome" name="user-circle" /> */}

                    {user &&
                        <View style={{ flex: 1,backgroundColor:"rgba(255, 255, 255, .5) " }}>
                            <View style={{ borderBottomWidth: .5 }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Welcome {user.user.first_name} {user.user.last_name}</Text>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                {user.addresses.filter(a => a.default)[0] ?
                                    <View>
                                        <Text>{user.addresses.filter(a => a.default)[0].display_name}</Text>
                                        <Text>{user.addresses.filter(a => a.default)[0].address}</Text>
                                        <Text>{user.addresses.filter(a => a.default)[0].city} {user.addresses.filter(a => a.default)[0].state} {user.addresses.filter(a => a.default)[0].zip} </Text>
                                    </View>
                                    :
                                    null
                                }
                                <Text onPress={logout} style={{ color: config.SECONDARY_COLOR, textAlign: 'center', marginTop: 9 }}>LOGOUT</Text>

                                {/* <Text onPress={logout} style={{ color: config.SECONDARY_COLOR }}>LOGOUT</Text> */}
                            </View>
                        </View>
                    }

                    {!showSignup &&
                        !showLogin &&
                        !user &&
                        <View style={{ flex: 1 }}>
                            <Button style={{ width: 200, marginLeft: 'auto', marginRight: 'auto', padding: 5, backgroundColor: config.PRIMARY_COLOR, justifyContent: 'center' }} onPress={() => { setShowSignUp(true), setShowLogin(false) }} >
                                <H2 style={{ color: 'white', fontSize: 20, fontWeight: 'bold',fontFamily: 'AppBold' }}>SIGN UP</H2>
                            </Button>
                            <Button style={{ width: 200, marginTop: 20, marginLeft: 'auto', marginRight: 'auto', padding: 5, backgroundColor: config.PRIMARY_COLOR, justifyContent: 'center' }} onPress={() => { setShowLogin(true), setShowSignUp(false) }} >
                                <H2 style={{ color: 'white', fontSize: 20, fontWeight: 'bold',fontFamily: 'AppBold' }}>LOG IN</H2>
                            </Button>
                            <Button style={{ width: 200, marginTop: 20, marginLeft: 'auto', marginRight: 'auto', padding: 5, backgroundColor: config.PRIMARY_COLOR, justifyContent: 'center' }} onPress={() => props.navigation.navigate('Order')} >
                                <H2 style={{ color: 'white', fontSize: 17, fontWeight: 'bold',fontFamily: 'AppBold' }}>CONTINUE AS GUEST</H2>
                            </Button>
                        </View>
                    }

                    {showSignup &&
                        <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, .75) ", borderRadius: 20, padding: 10 }}>
                            {!spin ?
                                <View style={{ marginTop: 15 }}>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <Icon style={{ color: 'red' }} onPress={() => { setShowSignUp(false) }} type="MaterialCommunityIcons" name="close" />
                                    </View>
                                    {/* {errors &&
                                        <Text style={{ textAlign: 'center', color: 'red' }}>{errors}</Text>
                                    } */}
                                    <UserReg
                                        set_spin={(d) => setSpin(d)}
                                        setTheUser={setTheUser}
                                        signUp={() => setSignUp(false)}
                                        getErrors={getErrors}
                                        logout={logout} />
                                </View>
                                :
                                // <Spinner isVisible={true} type={"ThreeBounce"} style={{ marginLeft: 'auto', marginRight: 'auto' }}  size={200}  color={config.PRIMARY_COLOR} />
                                <Flow style={{ marginLeft: 'auto', marginRight: 'auto' }} size={200} color={config.PRIMARY_COLOR}></Flow>
                            }
                        </View>
                    }

                    {showLogin &&
                        <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, .75) ", borderRadius: 20, padding: 10 }}>
                            {!spin ?
                                <View style={{ marginTop: 15 }}>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <Icon style={{ color: 'red' }} onPress={() => { setShowLogin(false) }} type="MaterialCommunityIcons" name="close" />
                                    </View>
                                    {errors &&
                                        <Text style={{ textAlign: 'center', color: 'red' }}>{errors}</Text>
                                    }
                                    <UserLogin
                                        set_spin={(d) => setSpin(d)}
                                        setTheUser={setTheUser}
                                        signUp={() => setSignUp(true)}
                                        getErrors={getErrors}
                                        getCart={props.getCart}
                                    />
                                </View>
                                :
                                // <Spinner style={{ marginLeft: 'auto', marginRight: 'auto' }} isVisible={true} size={200} type={"ThreeBounce"} color={config.PRIMARY_COLOR} />
                                <Flow style={{ marginLeft: 'auto', marginRight: 'auto' }} size={200} color={config.PRIMARY_COLOR}></Flow>

                            }
                        </View>
                    }

                    {/* </Card> */}
                    {user ?
                        user.offers.length != 0 ?

                        <Card style={{ padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Icon style={{ fontSize: 40, color: config.SECONDARY_ACCENT }} type="Ionicons" name="pricetag" />
                            <TouchableOpacity onPress={() => props.navigation.navigate('Home', { screen: 'Offers', "params": [null] })}>
                                <View>

                                    <Text style={{ fontWeight: 'bold', borderBottomWidth: .5 }}>Current Offers</Text>

                                    <H1 style={{ textAlign: 'center' }}>{user.offers.length}</H1>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => props.navigation.navigate('Home', { screen: 'Offers', params: [expOffers] })}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', borderBottomWidth: .5 }}>Offers Expiring Soon</Text>
                                    <H1 style={{ textAlign: 'center' }}>{expOffers && expOffers.length}</H1>
                                </View>
                            </TouchableOpacity>
                        </Card>
                        :

                        <TouchableOpacity>
                        <Card style={{ padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Icon style={{ fontSize: 40, color: config.SECONDARY_ACCENT }} type="Ionicons" name="pricetag" />
                            <View>

                                <Text style={{ fontWeight: 'bold', borderBottomWidth: .5 }}>Current Offers</Text>

                                <Text style={{ textAlign: 'center' }}>No offers at this time</Text>
                            </View>
                            <View></View>
                        </Card>
                    </TouchableOpacity>



                        :
                        null
                    }
                    {user ?
                        user.orders.length != 0 ?

                        <TouchableOpacity onPress={() => props.navigation.navigate('RepeatOrders')}>
                            <Card style={{ padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Icon style={{ fontSize: 40, color: config.SECONDARY_ACCENT }} type="Ionicons" name="repeat" />
                                <View>

                                    <Text style={{ fontWeight: 'bold', borderBottomWidth: .5 }}>Number of Orders</Text>

                                    <H1 style={{ textAlign: 'center' }}>{user.orders.length}</H1>
                                </View>
                                <View></View>
                            </Card>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity>
                            <Card style={{ padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Icon style={{ fontSize: 40, color: config.SECONDARY_ACCENT }} type="Ionicons" name="repeat" />
                                <View>

                                    <Text style={{ fontWeight: 'bold', borderBottomWidth: .5 }}>Number of Orders</Text>

                                    <Text style={{ textAlign: 'center' }}>No order at this time</Text>
                                </View>
                                <View></View>
                            </Card>
                        </TouchableOpacity>
                        :
                        null
                    }
                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    )
}

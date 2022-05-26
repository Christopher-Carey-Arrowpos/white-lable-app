import Bugsnag from '@bugsnag/expo';
// Bugsnag.start();
//App.js

import 'react-native-gesture-handler';
import React, { Component, useState, useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { groupBy } from 'lodash'
import {View, Image, Dimensions, Text} from 'react-native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Spinnerr from 'react-native-spinkit';
import { Icon, Spinner } from 'native-base'
import config from './config.json'
// import Geolocation from '@react-native-community/geolocation';

import { Flow } from 'react-native-animated-spinkit'

import { CategoryList } from './components/CategoryList'
import { HomeScreen } from './components/HomeScreen'
import { CategoryItemList } from './components/CategoryItemList'
import { StoreLocator } from './components/StoreLocator'
import { Cart } from './components/Cart'
import { LocationSelection } from './components/LocationSelection'
import { ItemComp } from './components/ItemComp';
import { UserAccount } from './components/UserAccount'
import { EditItemComp } from './components/EditItemComp'
import { FinalizeOrder } from './components/FinalizeOrder'
import { UserAddress } from './components/UserAccountComps/UserAddress'
import { UserAccountSettings } from './components/UserAccountComps/UserAccountSetting'
import { EditAddress } from './components/UserAccountComps/EditAddress'
import { NewAddress } from './components/UserAccountComps/NewAddress'
import { Offers } from './components/Offers'
import { GiftCard } from './components/GiftCard'
import { RepeatOrders } from './components/RepeatOrders'
import * as Location from 'expo-location';
import {Video} from "expo-av";
import CustomFonts from "./fonts/CustomFonts";
// import DefaultFonts from "./fonts/DefaultFonts";
import * as Font from "expo-font";
require('./fonts/default fonts/OpenSans-ExtraBold.ttf')

async function DefaultFonts() {
    //this use of generic names let's us customize the the app font without changing it in every place.
    //do not commit this file, or change App-{style} if you wish to customize fonts change the require.
    return await Font.loadAsync({
        AppEditItem: require('./branded fonts/AvenirLTStd-Roman.otf'),
        AppBold: require('./default fonts/Montserrat-SemiBold.otf'),
        AppRegular: require('./branded fonts/Brandon_reg.otf'),
        AppHeading: require('./branded fonts/TrendSansFour.otf'),
    });
}


function App(props) {
    config.USES_CUSTOM_FONT ? CustomFonts() : DefaultFonts(); //this is to allow for custom importing of company fonts.
    const [categories, setCategories] = useState();
    const [cart, setCart] = useState()
    const [homeLocationChk, setHomeLocationChk] = useState()
    const [allDone, SetAllDone] = useState(false)
    const [multiLocation, setMultiLocation] = useState()
    const [user, setUser] = useState();
    const [splashVid, setSplashVid] = useState(config.SPLASH_VIDEO);

    async function getLocations() {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        let _this = this
        axios.get(`https://${base_url}/api/locations`,
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

                if (config.STORE_ID) {
                    let store = response.data.locations.filter(a => a.arrow_store_id == config.STORE_ID)[0]

                    axios.get(`https://${base_url}/${store.urlslug}/store/service_types/api`)
                        .then(async function (responsee) {


                            store.service_types = responsee.data


                            console.log(store)
                            await AsyncStorage.setItem('@store_slug', store.urlslug)
                            await AsyncStorage.setItem('@home_location', JSON.stringify(store))
                            await AsyncStorage.setItem('@locations', JSON.stringify(response.data.locations))

                            setMultiLocation(false)
                            checkIfHome()
                        })
                        .catch(function (error) {
                            console.log(error);
                            console.log(error.response);
                        });

                    return



                }


                if (response.data.locations.length == 1) {

                    axios.get(`https://${base_url}/${response.data.locations[0].urlslug}/store/service_types/api`)
                        .then(async function (responsee) {
                            response.data.locations[0].service_types = responsee.data

                            await AsyncStorage.setItem('@store_slug', response.data.locations[0].urlslug)
                            await AsyncStorage.setItem('@home_location', JSON.stringify(response.data.locations[0]))
                            await AsyncStorage.setItem('@locations', JSON.stringify(response.data.locations))

                            setMultiLocation(false)
                            checkIfHome()
                        })
                        .catch(function (error) {
                            console.log(error);
                            console.log(error.response);
                        });






                } else {
                    await AsyncStorage.setItem('@locations', JSON.stringify(response.data.locations))
                    setMultiLocation(true)
                    SetAllDone(true)
                }
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }

    async function getApi(load) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.get(`https://${base_url}/${slug}/menu/api`)
            .then(async function (response) {
                console.log(response)
                setCategories(response.data.categories)
                await AsyncStorage.setItem('@categories', JSON.stringify(response.data.categories))
                let locations = JSON.parse(await AsyncStorage.getItem('@locations'))
                // console.log(locations)
                if (config.STORE_ID || locations.length == 1) {
                    setMultiLocation(false)
                } else {
                    setMultiLocation(true)
                }
                getCart(load)
            })
            .catch(function (error) {
                console.log(error.response)
                console.log(error);
            });
    }

    async function getToken(load) {
        await AsyncStorage.removeItem('@categories')
        setCategories(null)
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.get(`https://${base_url}/store/token/get`)
            .then(async function (response) {
                console.log(response)
                await AsyncStorage.setItem('@storage_Key', response.data)
                getApi(load)
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    // FYMyaNPrysTOYTEfRUnA8OVFVjfMQbqJLo8fhhwx
    // 5P7EtNdera5pPz8Kr0HcmxsxmRat8j3Jx2AWwblr

    async function getCart(load) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        let _this = this
        axios.get(`https://${base_url}/${slug}/cart/api`)
            .then(async function (response) {
                if (response.data.cart.lines.length > 0) {
                    response.data.cart.lines.map(item => {
                        let grouped = groupBy(item.modifications, 'portion');
                        item.modifications = grouped
                    })
                }
                await AsyncStorage.setItem('@cart', JSON.stringify(response.data.cart))
                setCart(response.data.cart)
                load && SetAllDone(true)
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    async function checkIfHome() {
        let chkHomeStore = await AsyncStorage.getItem('@home_location')
        console.log(chkHomeStore)
        setHomeLocationChk(JSON.parse(chkHomeStore))
        if (chkHomeStore) {
            AsyncStorage.getItem("@user_data")
                .then((value) => {
                    setUser(JSON.parse(value))
                })

            getToken(true)
        } else {
            getGeo()
        }
    }

    async function login() {
        AsyncStorage.getItem("@user_data")
            .then((value) => {
                setUser(JSON.parse(value))
            })
        // await AsyncStorage.removeItem('@user_data')
        // setUser(null)


    }
    async function logout() {

        await AsyncStorage.removeItem('@user_data')
        setUser(null)


    }

    async function getGeo() {
        await AsyncStorage.setItem('@base_url', config.BASE_URL)

        let foregroundStatus = await Location.requestForegroundPermissionsAsync()
        console.log(foregroundStatus)

        if (foregroundStatus.status == "granted") {
            let status = await Location.getCurrentPositionAsync();
            console.log(status)
            console.log(status.coords.latitude)
            await AsyncStorage.setItem('@cords', JSON.stringify({ "lat": status.coords.latitude, "long": status.coords.longitude }))
            getLocations()



        } else {

            axios.get(`https://freegeoip.app/json/`)
                .then(async function (response) {
                    console.log(response.data)
                    await AsyncStorage.setItem('@cords', JSON.stringify({ "lat": response.data.latitude, "long": response.data.longitude }))
                    getLocations()


                })
                .catch(function (error) {
                    console.log(error);
                });




            // await AsyncStorage.setItem('@cords', "1")
            // getLocations()

        }



        // Geolocation.getCurrentPosition(
        //   async (info) => {
        //     console.log(info)
        //     await AsyncStorage.setItem('@cords', JSON.stringify({ "lat": info.coords.latitude, "long": info.coords.longitude }))
        // getLocations()
        //   },
        //   async (error) => {
        //     console.log(error)
        // await AsyncStorage.setItem('@cords', "1")
        // getLocations()
        //   },
        // );
    }

    useEffect(async () => {
        checkIfHome()
    }, [])

    const Tabs = createBottomTabNavigator()
    const MenuStack = createStackNavigator()
    const HomeStack = createStackNavigator()
    const LocationStack = createStackNavigator()
    const CartStack = createStackNavigator()
    const UserStack = createStackNavigator()
    const GiftCardStack = createStackNavigator()


    const UserStackScreen = React.useMemo(() =>
        () => (
            <UserStack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: config.PRIMARY_COLOR },
                    // headerRight: () => (<Image style={{ height: 45, width: 150, marginRight: 5 }} resizeMode="contain" source={{ uri: config.LOGO }} />),
                    headerTitleStyle: { color: 'white',fontFamily: "AppHeading", fontSize: 25 },
                    headerTitleAlign: 'center'
                }}>
                <UserStack.Screen name={"UserAccount"} options={{ title: 'Account' }} component={UserAccount} />
                <UserStack.Screen
                    name='Address'
                    options={{ title: 'Address',
                        headerTitleStyle: {
                            fontFamily: "AppHeading",
                            fontSize: 25
                        }
                    }}>
                    {(props) => <UserAddress {...props} />}
                </UserStack.Screen>
                <UserStack.Screen
                    name='AccountSettings'
                    options={{ title: 'Account Settings',
                        headerTitleStyle: {
                            fontFamily: "AppHeading",
                            fontSize: 25
                        }
                    }}>
                    {(props) => <UserAccountSettings {...props} />}
                </UserStack.Screen>
                <UserStack.Screen
                    name='EditAddress'
                    options={{ title: 'Edit Address',
                        headerTitleStyle: {
                            fontFamily: "AppHeading",
                            fontSize: 25
                        }
                    }}>
                    {(props) => <EditAddress {...props} />}
                </UserStack.Screen>
                <UserStack.Screen
                    name='NewAddress'
                    options={{ title: 'Add Address',
                        headerTitleStyle: {
                            fontFamily: "AppHeading",
                            fontSize: 25
                        }
                    }}>
                    {(props) => <NewAddress {...props} />}
                </UserStack.Screen>
            </UserStack.Navigator>
        ), []
    )

    const MenuStackScreen = React.useMemo(() =>
        () => (
            <MenuStack.Navigator
                screenOptions={{
                    headerTintColor: 'white',
                    headerStyle: { backgroundColor: config.PRIMARY_COLOR },
                    // headerRight: () => (<Image style={{ height: 45, width: 150, marginRight: 5 }} source={{ uri: config.LOGO }} />),
                    headerTitleStyle: { color: 'white' },
                    headerTitleAlign: 'center'
                }}>
                <MenuStack.Screen
                    name='Order'
                    options={{ title: 'Order',
                    headerTitleStyle: {
                        fontFamily: "AppHeading",
                        fontSize: 25
                    }
                    }}>
                    {(props) => <CategoryList {...props} />}
                </MenuStack.Screen>
                <MenuStack.Screen name={"CategoryItemList"} component={CategoryItemList} options={({ route }) => ({ title: route.params.name,headerTitleStyle: {fontFamily: "AppHeading", fontSize: 25} })} />
                <MenuStack.Screen name={"ItemComp"} component={ItemComp} initialParams={{ cart: getCart }} options={({ route }) => ({ title: route.params.name,headerTitleStyle: {fontFamily: "AppHeading", fontSize: 25} })} />
            </MenuStack.Navigator>
        ), []
    )

    const CartStackScreen = React.useMemo(() =>
        () => (
            <CartStack.Navigator
                screenOptions={{
                    headerTintColor: 'white',
                    headerStyle: { backgroundColor: config.PRIMARY_COLOR },
                    // headerRight: () => (<Image style={{ height: 45, width: 150, marginRight: 5 }} resizeMode="contain" source={{ uri: config.LOGO }} />),
                    headerTitleStyle: { color: 'white', },
                    headerTitleAlign: 'center'
                }}>
                <CartStack.Screen
                    name='Cart'
                    options={{ title: 'Cart',
                        headerTitleStyle: {
                            fontFamily: "AppHeading",
                            fontSize: 25
                        }
                    }}>
                    {(props) => <Cart {...props} initialParams={{ cart: getCart }} />}
                </CartStack.Screen>
                <CartStack.Screen
                    name='EditItem'
                    options={{ title: 'Edit',
                        headerTitleStyle: {
                            fontFamily: "AppEditItem",
                        }
                    }}>
                    {(props) => <EditItemComp {...props} />}
                </CartStack.Screen>
                <CartStack.Screen
                    name='Finalize'
                    options={{ title: 'Finalize',
                        headerTitleStyle: {
                            fontFamily: "AppHeading",
                        }
                    }}>
                    {(props) => <FinalizeOrder {...props} getCart={getCart} />}
                </CartStack.Screen>
            </CartStack.Navigator>
        ), []
    )

    const HomeStackScreen = React.useMemo(() =>
        () => (
            <HomeStack.Navigator
                screenOptions={{
                    headerTintColor: 'white',
                    headerStyle: { backgroundColor: config.PRIMARY_COLOR },
                    headerRight: () => (<Image style={{ height: 45, width: 150, marginRight: 5 }} resizeMode="contain" source={{ uri: config.LOGO }} />),
                    headerTitleStyle: { color: 'white' },
                    headerTitleAlign: 'left'
                }}>
                <HomeStack.Screen
                    name='HomeScreen'
                    options={{ title: 'Home',
                        headerTitleStyle: {
                            fontFamily: 'AppHeading'
                        }
                    }}>
                    {(props) => <HomeScreen {...props} getCart={getCart} login={login} logout={logout} />}
                </HomeStack.Screen>
                <HomeStack.Screen
                    name='Offers'
                    options={{ title: 'Offers',
                        headerTitleStyle: {
                            fontFamily: 'AppHeading'
                        }
                    }}>
                    {(props) => <Offers {...props} />}
                </HomeStack.Screen>
                <HomeStack.Screen
                    name='RepeatOrders'
                    options={{ title: 'Repeat Orders',
                        headerTitleStyle: {
                            fontFamily: 'AppHeading'
                        }
                    }}>
                    {(props) => <RepeatOrders {...props} initialParams={{ cart: getCart }} />}
                </HomeStack.Screen>
            </HomeStack.Navigator>
        ), []
    )

    const LocationStackScreen = React.useMemo(() =>
        () => (
            <LocationStack.Navigator
                screenOptions={{
                    headerTintColor: 'white',
                    headerStyle: { backgroundColor: config.PRIMARY_COLOR },
                    headerTitleStyle: { color: 'white' },

                    // headerTitleAlign: 'left'
                }}>
                <LocationStack.Screen
                    name='StoreLocations'
                    options={{

                        title: 'Locations',
                        headerTitleStyle: {
                            fontFamily: 'AppHeading',
                            fontSize: 25
                        },
                        // headerRight: () => (<Image style={{ height: 45, width: 150, marginRight: 5 }} resizeMode="contain" source={{ uri: config.LOGO }} />),

                    }}>
                    {(props) => <StoreLocator {...props} />}
                </LocationStack.Screen>
                <LocationStack.Screen
                    name={"LocationSelection"}
                    options={({ route }) => ({
                        title: route.params.name, headerTitleAlign: 'center'
                    })}  >
                    {(props) => <LocationSelection {...props} getGoods={getToken} />}
                </LocationStack.Screen>
            </LocationStack.Navigator>
        ), []
    )

    const GiftCardScreen = React.useMemo(() =>
        () => (
            <GiftCardStack.Navigator
                screenOptions={{
                    headerTintColor: 'white',
                    headerStyle: { backgroundColor: config.PRIMARY_COLOR },
                    // headerRight: () => (<Image style={{ height: 45, width: 150, marginRight: 5 }} resizeMode="contain" source={{ uri: config.LOGO }} />),
                    headerTitleStyle: { color: 'white' },
                    headerTitleAlign: 'center'
                }}>
                <GiftCardStack.Screen
                    name='E-Gift'
                    options={{

                        title: 'E-Gift',
                        headerTitleStyle: {
                            fontFamily: 'AppHeading',
                            fontSize: 25
                        }
                        // headerRight: () => (<Image style={{ height: 45, width: 150, marginRight: 5 }} resizeMode="contain" source={{ uri: config.LOGO }} />),

                    }}>
                    {(props) => <GiftCard {...props} />}
                </GiftCardStack.Screen>
            </GiftCardStack.Navigator>
        ), []
    )

    return (
        allDone ?
            <NavigationContainer >
                <Tabs.Navigator
                    initialRouteName={homeLocationChk ? "Home" : "StoreLocation"}
                    tabBarOptions={{
                        style: { backgroundColor: config.PRIMARY_COLOR, opacity: 1 },
                        activeTintColor: config.SECONDARY_ACCENT,
                        inactiveTintColor: 'white',
                    }}>

                    <Tabs.Screen
                        name="Home"
                        component={HomeStackScreen}

                        options={{
                            title: 'Home',
                            unmountOnBlur: true,
                            tabBarIcon: ({ color, size }) => (
                                <Icon type="FontAwesome" name="home" style={{ color: color }} />
                            ),
                        }} />

                    <Tabs.Screen
                        name="Order"
                        component={MenuStackScreen}
                        options={{
                            unmountOnBlur: true,
                            title: 'Order',
                            tabBarIcon: ({ focused, color, size }) => (
                                categories ?
                                    <Icon type="MaterialIcons" name="restaurant-menu" style={{ color: color }} />
                                    :
                                    <Spinner color='red' />
                            ),
                        }} />

                    <Tabs.Screen
                        name="Cart"
                        component={CartStackScreen}
                        options={{
                            unmountOnBlur: true,
                            title: 'Cart',
                            tabBarBadge: cart ? cart.lines.length : 0,
                            tabBarIcon: ({ focused, color, size }) => (
                                <Icon type="Entypo" name="shopping-cart" style={{ color: color }} />
                            ),
                        }} />

                    {multiLocation &&
                    <Tabs.Screen
                        name="StoreLocation"
                        component={LocationStackScreen}
                        options={{
                            unmountOnBlur: true,
                            tabBarVisible: categories ? true : false,
                            title: 'Location',
                            tabBarIcon: ({ color, size }) => (
                                <Icon type="MaterialIcons" name="location-on" style={{ color: color }} />
                            ),
                        }} />
                    }
                    {config.GIFT_CARD_URL &&
                    <Tabs.Screen
                        name="GiftCard"
                        component={GiftCardScreen}
                        options={{
                            unmountOnBlur: true,
                            title: 'EGift',
                            tabBarIcon: ({ color, size }) => (
                                <Icon type="MaterialIcons" name="card-giftcard" style={{ color: color }} />
                            ),
                        }} />
                    }

                    {user &&
                    <Tabs.Screen
                        name="UserAccount"
                        component={UserStackScreen}
                        options={{
                            title: 'Account',
                            tabBarIcon: ({ color, size }) => (
                                <Icon type="FontAwesome" name="user" style={{ color: color }} />
                            ),
                        }} />
                    }

                </Tabs.Navigator>
            </NavigationContainer >
            :
            <View>
                <View style={{}}>
                    {splashVid &&
                        <Video
                            source={require('./VIDEO/Splash.mp4')}
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
                    <View style={{ marginTop: (Dimensions.get('window').height * .5),flex: 1, backgroundColor: config.PRIMARY_COLOR, justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ height: 90, width: 300 }} resizeMode="contain" source={{ uri: config.LOGO }} />
                    </View>
                </View>
                {/*<View style={{marginTop:20}}>*/}
                {/*  <Flow size={150} color={config.SECONDARY_COLOR}></Flow>*/}
                {/*</View>*/}
            </View>
    );
}
export default App;

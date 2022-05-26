import React, { Component, useState, useEffect, useLayoutEffect } from 'react';
import { ScrollView, Text, View, TextInput, Modal, Image, Dimensions } from 'react-native';
import { Button, H1, Icon, H2 } from 'native-base'
import config from '../../config.json'
import { useForm, Controller } from "react-hook-form";
// import TextInputMask from 'react-native-text-input-mask';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Slider } from 'react-native-elements';
import { Animated } from 'react-native';
import { WebView } from 'react-native-webview';
// import Spinner from 'react-native-spinkit';
import { useNavigation } from '@react-navigation/native';
import { MaskedTextInput } from "react-native-mask-text";
import { Flow } from 'react-native-animated-spinkit'



export const CreditComp = (props) => {
    const { reset, control, handleSubmit, formState: { errors } } = useForm();
    const [creditProcessor, setCreditProcessor] = useState()
    const [tipPercent, setTipPercent] = useState(0)
    const [customTip, setCustomTip] = useState()
    const [view, setView] = useState(0)
    const [messageData, setMessageData] = useState()
    const [spinner, setSpinner] = useState()
    const [complete, setComplete] = useState()
    const [error, setError] = useState()
    const [bassUrl, setBassUrl] = useState()
    const navigation = useNavigation();
    const [zipcode, setZipCode] = useState()
    const [address, setAddress] = useState()
    const [storeSlug, setStoreSlug] = useState()
    const [messageCart, setMessageCart] = useState()
    const [count, setCount] = useState(0)


    async function getCreditProcessor() {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        setStoreSlug(slug)
        setBassUrl(base_url)
        axios.post(`https://${base_url}/${slug}/store/credit_processor/api`, {
        }, {
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
                setCreditProcessor(response)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }
    async function verifyVantiv() {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.post(`https://${base_url}/${slug}/vantiv/verify`, {
            PaymentID: messageCart.PaymentID
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
                setComplete(true)
                props.getCart()

            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                switch (error.response.data.error_code) {
                    case 900:
                        //do nothing. Still trying.
                        return;
                    case 901:
                        //the transaction was actually declined. tell the user, stop trying to verify the payment.
                        setError(`This transaction was not approved.`)
                        break;
                    case 902:
                        //avs failure, tell the user.
                        setError(`Either the address or zip code does not match your bank's records. Please try again.`)
                        break;
                    case 903:
                        //cvv failure, tell the user.
                        setError(`The security code you typed does not match your banks records. Please try again.`)
                        break;
                    case 904:
                        //do nothing, payment id doesn't match a cart, order has probably been finalized.
                        return;
                    case 422:
                        //order couldn't be finalized for some other reason.
                        setError(`We couldn't finalize your order, please call the store at  to place your order.`)
                        break;
                    default:
                        //assume there is a problem if we get here.
                        setError(`We couldn't finalize your order, please call the store at  to place your order.`)
                }
                console.log("response")
                console.log(count)
                if (count != 6) {
                    setCount((prev) => prev + 1)

                }

            });
    }

    function getMessage(message) {
        console.log(message)
        let mess = JSON.parse(message.nativeEvent.data)
        console.log(mess)

        if (mess.message_title == "cartData") {
            mess.data = JSON.parse(mess.data)
            console.log(mess.data)
            setMessageCart(mess.data.vantiv_payment_id)
        }
        if (mess.message_title == "vantivSuccess") {
            mess.data = JSON.parse(mess.data)

            if (mess.message_title == "cartData") {
                setMessageCart(mess.data.vantiv_payment_id)
            }
            setView(2)
            verifyVantiv()
            // let timer = setInterval(() => {
            //     console.log(count)
            //     if (count != 6) {
            //     } else {
            //         console.log("clear")
            //         clearInterval(timer)
            //     }
            // }, 10000);
        }
        if (mess.message_title == "shift4Success") {
            setView(2)
            console.log(props)
            let data = JSON.parse(message.nativeEvent.data)
            data.data.cart_id = props.cart.id
            data.card_friendly_name = null
            data.should_store_card = null
            data.data.tip_amount = customTip ? customTip : props.cart.total * (tipPercent / 100)
            data.data.address_id = props.address ? props.address.id : null
            data.data.user_id = props.user.id
            setMessageData(data)
            ProcessCard(data)
        }
    }

    async function ProcessCard(data) {
        console.log(data)
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.post(`https://${base_url}/${slug}/order/shift4`,
            data.data,
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
                setComplete(true)
                props.getCart()
                //====================
                // Pusher.logToConsole = true;
                // var pusher = new Pusher("swACx0hWNb", {
                //     wsHost: 'pusher.arrowpos.com',
                //     wsPort: '6969',
                //     wssPort: '6969',
                //     cluster: 'mt1',
                //     enabledTransports: ['ws', 'wss'],
                // });
                //=====================
                //      let echo = new Echo({
                //     broadcaster: 'pusher',
                //     host: 'ws://pusher.arrowpos.com:6969',
                //     client: pusher,
                // });
                // echo.channel('order_update_event')
                //     .listen('OrderUpdateEvent', e => {
                //         try {
                //             let order = JSON.parse(e.message);
                //             if (order.reference === response.data.reference) {
                //                 setComplete(true)
                //                 props.getCart()
                //                 pusher.disconnect()
                //             }
                //         } catch (e) {
                //             console.log('junk message');
                //         }
                //     });
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                setView(1)
                setError("error")
            });
    }

    useLayoutEffect(() => {
        getCreditProcessor()

    }, []);
    useEffect(() => {
        console.log(count)
        // const timer = setTimeout(() => {
        //     verifyVantiv()
        // }, 10000);
    }, [count])

    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={props.showCredit}
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
                        padding: 20,
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                        width: "95%"
                    }}>
                        {view == 0 &&
                            creditProcessor ?
                            <View style={{ justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: .5, borderBottomColor: 'lightgray' }}>
                                    <H2 style={{ textAlign: 'center' }}>Enter Tip Amount</H2>
                                    <Icon onPress={() => props.exit()} style={{ textAlign: 'center', color: 'red', marginLeft: 30 }} type="AntDesign" name="close" />
                                </View>
                                <View style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}>
                                    <Text style={{ textAlign: 'center',fontFamily: 'AppRegular' }}>Order Total</Text>
                                    {customTip ?
                                        <H1>${props.cart.total + parseFloat(customTip)}</H1>
                                        :
                                        <H1>${(props.cart.total * (tipPercent / 100) + props.cart.total).toFixed(2)}</H1>
                                    }
                                </View>
                                <MaskedTextInput
                                    onChangeText={(formatted, extracted) => {
                                        setTipPercent(0)
                                        setCustomTip(formatted.replace("$", ""))
                                    }}
                                    mask={"$9990.99"}
                                    keyboardType={'decimal-pad'}
                                    placeholder={'Custom Amount'}
                                    style={{ borderBottomWidth: .5, borderBottomColor: 'lightgray', color: 'black', minHeight: 50 }}
                                    placeholderTextColor={'gray'}
                                    autoCompleteType={'tel'}
                                    textContentType={'telephoneNumber'}

                                />
                                <Slider
                                    value={tipPercent}
                                    step={5}
                                    minimumValue={0}
                                    maximumValue={40}
                                    onValueChange={(value) => { setTipPercent(value), setCustomTip(null) }}
                                    style={{ width: 250, marginTop: 20 }}
                                    thumbStyle={{ height: 40, width: 40, backgroundColor: 'transparent' }}
                                    thumbProps={{
                                        children: (
                                            <View style={{ backgroundColor: config.SECONDARY_COLOR, borderRadius: 15, position: 'absolute', top: 6, padding: 8, width: 45 }}>
                                                <Text style={{ color: "white", textAlign: 'center',fontFamily: 'AppRegular' }}>{tipPercent}%</Text>
                                            </View>
                                        ),
                                    }}
                                />
                                {creditProcessor.data.processor == "vantiv" &&
                                    <View style={{ width: '100%', marginTop: 30 }}>
                                        <H2>Please Enter Address Info</H2>
                                        <TextInput
                                            style={{ borderBottomColor: "black", borderBottomWidth: 1, color: 'black', minHeight: 50 }}
                                            selectionColor={'red'}
                                            onChangeText={(r) => setAddress(r)}
                                            value={address}
                                            placeholder="Street Address"
                                            placeholderTextColor={'gray'}
                                            autoCompleteType={'street-address'}
                                            textContentType={'fullStreetAddress'}
                                        />
                                        <TextInput
                                            style={{ borderBottomColor: "black", borderBottomWidth: 1, color: 'black', minHeight: 50 }}
                                            selectionColor={'red'}
                                            onChangeText={(r) => setZipCode(r)}
                                            value={zipcode}
                                            placeholder="Zipcode"
                                            keyboardType="number-pad"
                                            maxLength={5}
                                            placeholderTextColor={'gray'}
                                            autoCompleteType={'postal-code'}
                                            textContentType={'postalCode'}
                                        />
                                    </View>}

                                <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT, marginTop: 30, marginLeft: 'auto', marginRight: 'auto' }} onPress={() => setView(1)}>
                                    <H1 style={{ color: 'white' }}>Continue</H1>
                                </Button>
                            </View>
                            :
                            // <Spinner style={{ marginLeft: 'auto', marginRight: 'auto' }} isVisible={view == 0} size={200} type={"ThreeBounce"} color={config.PRIMARY_COLOR} />
                            <Flow style={{ marginLeft: 'auto', marginRight: 'auto' }} size={200} color={config.PRIMARY_COLOR}></Flow>


                        }
                        {view == 1 &&
                            <View style={{ width: '95%', height: '90%' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: .5, borderBottomColor: 'lightgray' }}>
                                    <H2 style={{ textAlign: 'center' }}>Credit Card Info</H2>
                                    <Icon onPress={() => props.exit()} style={{ textAlign: 'center', color: 'red', marginLeft: 30 }} type="AntDesign" name="close" />
                                </View>
                                {error &&
                                    <H1>{error}</H1>
                                }
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}>
                                        <Text style={{ textAlign: 'center',fontFamily: 'AppRegular' }}>Order Total w/Tip</Text>
                                        {customTip ?
                                            <H1>${props.cart.total + parseFloat(customTip)}</H1>
                                            :
                                            <H1>${(props.cart.total * (tipPercent / 100) + props.cart.total).toFixed(2)}</H1>
                                        }
                                    </View>
                                    <View style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}>
                                        <Text style={{ textAlign: 'center',fontFamily: 'AppRegular' }}>Tip Amount</Text>

                                        <H1>${(props.cart.total * (tipPercent / 100)).toFixed(2)}</H1>
                                    </View>
                                </View>
                                {creditProcessor.data.processor == "vantiv" ?
                                    <WebView
                                        // 4895 2810 0000 0006
                                        // exp: 12/25
                                        // cvv: 222
                                        source={{ uri: `https://${bassUrl}/${storeSlug}/order/app?tip_amount=${customTip ? customTip : props.cart.total * (tipPercent / 100)}&cart_id=${props.cart.id}&zip=${zipcode}&billing_address=${address}` }}
                                        style={{ width: creditProcessor.data.processor == "vantiv" ? Dimensions.get('window').width + 450 : 'auto', marginTop: 20, height: 400 }}
                                        onMessage={(e) => getMessage(e)}
                                        //userAgent="Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3714.0 Mobile Safari/537.36"
                                        injectedJavaScript={`
                                            window.ReactNativeWebView.postMessage(JSON.stringify({message_title:"cartData",data:document.getElementById('cart_data').value})  )
                                            window.onmessage = (event) => {
                                                window.ReactNativeWebView.postMessage(JSON.stringify(event.data))
                                    };
                                   
                                    true
                                  `}
                                    />
                                    :
                                    <WebView
                                        ccc
                                        source={{ uri: `https://${bassUrl}/${storeSlug}/order/app` }}
                                        style={{ width: creditProcessor.data.processor == "vantiv" ? Dimensions.get('window').width + 450 : 'auto', marginTop: 20, height: 400 }}
                                        onMessage={(e) => getMessage(e)}
                                        //userAgent="Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3714.0 Mobile Safari/537.36"
                                        injectedJavaScript={`
                                            window.onmessage = (event) => {
                                                window.ReactNativeWebView.postMessage(JSON.stringify(event.data))
                                    };
                                   
                                    true
                                  `}
                                    />
                                }
                            </View>
                        }
                        {view == 2 ?

                            complete ?
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
                                    {error ?
                                        <View>
                                            <Text style={{fontFamily: 'AppRegular'}}>{Math.random()}</Text>
                                            <Text style={{ textAlign: 'center', color: 'red', fontWeight: 'bold',fontFamily: 'AppRegular' }}>Oops, there is a problem!, {error}</Text>
                                            <Button
                                                onPress={() => navigation.navigate('Cart')}
                                                style={{ backgroundColor: config.PRIMARY_COLOR, padding: 10, marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}
                                            >
                                                <H1 style={{ color: 'white' }}>Return To Cart</H1>
                                            </Button>
                                        </View>
                                        :
                                        <View>
                                            <Text style={{ textAlign: 'center',fontFamily: 'AppRegular' }}>Confirming Order</Text>
                                            <Spinner isVisible={true} size={200} type={"ThreeBounce"} color={config.PRIMARY_COLOR} />
                                        </View>
                                    }
                                </View>
                            :
                            null
                        }
                        {view == 3 ?

                            <View style={{ width: '100%' }}>
                                <H2>Please Enter Address Info</H2>
                                <TextInput
                                    style={{ borderBottomColor: "black", borderBottomWidth: 1, width: "80%", marginLeft: 20, color: 'black', minHeight: 50 }}
                                    selectionColor={'red'}
                                    onChangeText={(r) => setAddress(r)}
                                    value={address}
                                    placeholder="Street Address"
                                    placeholderTextColor={'gray'}
                                    autoCompleteType={'street-address'}
                                    textContentType={'fullstreetAddress'}
                                />
                                <TextInput
                                    style={{ borderBottomColor: "black", borderBottomWidth: 1, width: "80%", marginLeft: 20, color: 'black', minHeight: 50 }}
                                    selectionColor={'red'}
                                    onChangeText={(r) => setZipCode(r)}
                                    value={zipcode}
                                    placeholder="Zipcode"
                                    keyboardType="number-pad"
                                    maxLength={5}
                                    placeholderTextColor={'gray'}
                                    autoCompleteType={'postal-code'}
                                    textContentType={'postalCode'}
                                />
                                <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT, marginTop: 30, marginLeft: 'auto', marginRight: 'auto' }} onPress={() => {
                                    setView(1)
                                    console.log(`https://${bassUrl}/${storeSlug}/order/app/?tip_amount=${customTip ? customTip : props.cart.total * (tipPercent / 100)}&cart_id=${props.cart.id}&zip=${zipcode}&billing_address=${address}`)
                                    console.log(`https://${bassUrl}/vantiv/loading/app`)
                                }}>
                                    <H1 style={{ color: 'white' }}>Continue</H1>
                                </Button>
                            </View>
                            :
                            null
                        }
                    </View>
                </View>
            </Modal>
        </View>
    )
}

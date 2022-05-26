import React, { Component, useState, useEffect, useLayoutEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    FlatList,
    TouchableOpacity,
    ImageBackground,
    TextInput,
    TouchableWithoutFeedback,
    Alert
} from 'react-native';
import { Icon, Button, Card, H1 } from 'native-base'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {CommonActions} from "@react-navigation/native";



export const Offers = (props) => {
    const [user, setUser] = useState()
    const [view, setView] = useState(0)
    const [obj,setObj] = useState()



    function refresh() {
        AsyncStorage.getItem("@user_data")
            .then((value) => {
                setUser(JSON.parse(value))
                if(props.route.params[0] != null){
                    setObj(props.route.params[0])
                }else{
                    setObj(JSON.parse(value).offers)
                }
            })

    }

    useLayoutEffect(() => {
        refresh()
        console.log(props)

    }, []);

    return (
        <View >
            <ScrollView>
                {/*<Button style={{backgroundColor: config.ACCENT_COLOR}} onPress={() => {props.navigation.navigate('Home')}}><Text>Back</Text></Button>*/}
                {obj &&
                    obj.map((item, i) => {
                        let now = moment().format('M/D/YYYY')
                        let exp = moment(item.ExpDate)
                        let dif = moment(item.ExpDate).diff(moment(), 'days')
                        console.log(dif)
                        console.log(item);
                        //   if (dif <= 7) {
                        //       arr.push(item)

                        //   }
                        return (


                            <TouchableWithoutFeedback onPress={() => {
                                AsyncStorage.setItem('@discount_code', item.PromoCode);
                                Alert.alert('Discount Applied!', 'You discount code will be applied automatically at checkout.');
                                props.navigation.dispatch(CommonActions.reset({index: 0, routes: [{ name: "Home" }]}));
                            }}>
                                <Card style={{ padding: 15, borderRadius: 20, alignItems: 'center' }}>
                                    {/*<Text style={{ fontWeight: 'bold', borderBottomWidth: .5, borderBottomColor: 'lightgray',fontFamily: 'AppHeading' }}>Offer</Text>*/}
                                    <Text style={{ flexWrap: 'wrap', textAlign: 'center',fontFamily: 'AppHeading',fontSize: 25 }}>Promo Code {item.PromoCode}</Text>
                                    <Text style={{ flexWrap: 'wrap', textAlign: 'center',fontFamily: 'AppRegular',fontSize: 15 }}>(click to add to order)</Text>
                                    <Text style={{ flexWrap: 'wrap', textAlign: 'center',fontFamily: 'AppRegular' }}>{item.Offer.replaceAll('&rdquo;', '"')}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                                        <View>
                                            <Text style={{ fontWeight: 'bold', borderBottomWidth: .5, borderBottomColor: 'lightgray',fontFamily: 'AppRegular' }}>Exp. Date</Text>
                                            <Text style={{ fontWeight: dif <= 7 ? 'bold' : "normal",color:dif <= 7 ? "red" :"black",fontFamily: 'AppRegular' }}>{item.ExpDate}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontWeight: 'bold', borderBottomWidth: .5, borderBottomColor: 'lightgray',fontFamily: 'AppRegular' }}>Received</Text>
                                            <Text>{item.SentDate}</Text>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableWithoutFeedback>
                        )

                    })}




            </ScrollView>
        </View>
    );
}

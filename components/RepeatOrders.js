import React, { Component, useState, useEffect, useLayoutEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, FlatList, TouchableOpacity, ImageBackground, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Icon, Button, Card, H1 } from 'native-base'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment'
import { CardItem, Grid, Col } from 'native-base';
import { groupBy } from 'lodash'
import { useSafeArea } from 'react-native-safe-area-context';
import axios from "axios";
// import Spinner from 'react-native-spinkit';
import { Flow } from 'react-native-animated-spinkit'



export const RepeatOrders = (props) => {
    const [user, setUser] = useState()
    const [view, setView] = useState(0)
    const [obj, setObj] = useState()
    const [firstHalf, setFirstHalf] = useState('first-half')
    const [secondHalf, setSecondHalf] = useState('second-half')
    const [cardIndex, setCardIndex] = useState()
    const [OG, setOG] = useState()
    const [spin, setSpin] = useState()

    async function handleRepeatOrder(order) {
        setSpin(true)
        //make the reorder icon spin.
        // let id = `reorder-button-icon-${order.id}`;
        // let element = document.getElementById(id);
        // element.classList.add('fa-spin');
        // let _this = this;
        // let url = `${window.relativeURI()}/cart/add/api`;

        let iteration_count = 0;
        let OgOrder = OG.orders.filter(a => a.id == order.id)[0]
        console.log(OgOrder)


        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')

        OgOrder.lines.map((line, i) => {
            console.log(line.modifications)
            axios.post(`https://${base_url}/${slug}/cart/add/api`,
                {
                    item: line.item_id,
                    quantity: line.quantity,
                    modifiers: line.modifications,
                    addOns: [],
                    itemNavigation: line.item_navigation_id,
                    comment: "",
                    category_id: 0,
                    reorder: true,

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
                .then((response) => {
                    iteration_count++;
                    if (order.lines.length === iteration_count) {
                        resolve();
                    }
                })
                .catch((error) => {
                    console.log(error);
                    console.log(error.response);
                });
        })
        function resolve(){

            props.initialParams.cart()
            // props.navigation.goBack()
            props.navigation.navigate('Cart')
        }

        // order.lines.map((line,i) => {
        //     axios.post(url, {
        //         headers: headers,
        //         reorder: true,
        //         item: line.item_id,
        //         addon_id: line.addon_id,
        //         itemNavigation: line.item_navigation_id,
        //         quantity: line.quantity,
        //         comment: line.comment,
        //         category_id: 0,
        //         modifiers: line.modifications,
        //         is_addon: line.is_addon,
        //         addOns: []
        //     }).then(function (response) {
        //         console.log(response.data);
        //     }).catch(function (error) {
        //         console.log(error.response.data);
        //     }).finally(function () {
        //         iteration_count++;
        //         if (order.lines.length === iteration_count) {
        //             resolve();
        //         }
        //     })
        // });
    }



    function refresh() {
        AsyncStorage.getItem("@user_data")
            .then((value) => {
                setOG(JSON.parse(value))
                let uu = JSON.parse(value)
                uu.orders.map((x, i) => {
                    console.log(x)

                    if (x.lines.length > 0) {
                        x.lines.map(item => {
                            let grouped = groupBy(item.modifications, 'portion');
                            item.modifications = grouped
                        })
                    }
                })
                console.log(uu)
                console.log(uu)
                setUser(uu)
                setObj(uu.orders)







            })

    }

    useLayoutEffect(() => {
        refresh()
        console.log(props)

    }, []);

    return (
        <View >
            <ScrollView>
                {obj &&
                    obj.map((x, i) => {
                        // let now = moment().format('M/D/YYYY')
                        // let exp = moment(item.ExpDate)
                        // let dif = moment(item.ExpDate).diff(moment(), 'days')
                        // console.log(dif)
                        //   if (dif <= 7) {
                        //       arr.push(item)

                        //   }
                        return (


                            <TouchableWithoutFeedback onPress={() => setCardIndex(i)}>
                                <Card style={{ padding: 15, borderRadius: 20, alignItems: 'center', height: 'auto' }}>
                                    {/* <Text style={{ fontWeight: 'bold', borderBottomWidth: .5, borderBottomColor: 'lightgray' }}>Offer</Text>
                                    <Text style={{ flexWrap: 'wrap', textAlign: 'center' }}>{item.created_at}</Text> */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                                        <View>
                                            <Text style={{ fontWeight: 'bold', borderBottomWidth: .5, borderBottomColor: 'lightgray' }}>Date</Text>
                                            <Text style={{}}>{moment(x.created_at).format('MM/DD/YYYY')}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontWeight: 'bold', borderBottomWidth: .5, borderBottomColor: 'lightgray' }}>Amount</Text>
                                            <Text>{x.total.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    {cardIndex == i &&
                                        <View style={{ width: '100%', borderTopWidth: 1, borderBottomWidth: 1 }}>

                                            {x.lines.map((item, ii) => (


                                                <CardItem key={ii} style={{ flexDirection: 'column' }}>
                                                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                        <View>
                                                            {!item.addon_id ?
                                                                <Text>{item.quantity} x {item.friendly_name ? item.friendly_name : item.name}</Text>
                                                                :
                                                                <Text>+ Addon {item.friendly_name ? item.friendly_name : item.name}</Text>
                                                            }
                                                        </View>
                                                        <View><Text>{(item.subtotal * item.quantity).toFixed(2)}</Text></View>
                                                    </View>
                                                    <View style={{ width: "100%", marginLeft: 40 }}>
                                                        {item.modifications.whole &&
                                                            item.modifications.whole.map((x, i) => (
                                                                <View key={i}>
                                                                    <Text >- {x.size == "extra" ? "Extra " + x.name : x.name}</Text>
                                                                </View>
                                                            ))
                                                        }
                                                        <Grid>
                                                            <Col>
                                                                {item.modifications[firstHalf] &&
                                                                    <View >
                                                                        <Text style={{ fontWeight: 'bold' }}><Icon style={{ color: config.PRIMARY_COLOR, transform: [{ rotate: '180deg' }] }} type="MaterialCommunityIcons" name="circle-slice-4" /> Left</Text>
                                                                        {item.modifications[firstHalf].map((x, i) => (
                                                                            <Text key={i}>- {x.size == "extra" ? "Extra " + x.name : x.name}</Text>
                                                                        ))}
                                                                    </View>
                                                                }
                                                            </Col>
                                                            <Col>
                                                                {item.modifications[secondHalf] &&
                                                                    <View >
                                                                        {/* <Icon style={{ color: props.branding.brand_primary }} type="MaterialCommunityIcons" name="circle-slice-4" /> */}
                                                                        <Text style={{ fontWeight: 'bold' }}>Right <Icon style={{ color: config.PRIMARY_COLOR }} type="MaterialCommunityIcons" name="circle-slice-4" /> </Text>
                                                                        {item.modifications[secondHalf].map((x, i) => (
                                                                            <Text key={i}>- {x.size == "extra" ? "Extra " + x.name : x.name}</Text>
                                                                        ))}
                                                                    </View>
                                                                }
                                                            </Col>
                                                        </Grid>
                                                    </View>
                                                    {/* <View style={{ flexDirection: 'row', marginTop: 15, width: '100%', justifyContent: 'space-between' }}>
                                                                    {!item.addon_id ?
                                                                        <Button
                                                                            style={[{ borderColor: config.PRIMARY_COLOR, borderWidth: 2, backgroundColor: "white", height: 35, width: '40%', justifyContent: 'space-around' }]}
                                                                            onPress={() => editItem(item.category_id, item.item_navigation_id, item.id)}
                                                                        >
                                                                            <Icon type="AntDesign" style={{ color: config.PRIMARY_COLOR }} name='edit' />
                                                                            <Text style={{ color: config.PRIMARY_COLOR }}>Edit</Text>
                                                                        </Button>
                                                                        :
                                                                        null
                                                                    }
                                                                    <Button
                                                                        style={[, { height: 35, backgroundColor: config.ACCENT_COLOR, width: '40%', justifyContent: 'space-around' }]}
                                                                        onPress={() => setItemIdd(item.id)}
                                                                    >
                                                                        <Icon type="AntDesign" style={{ color: "white" }} name='delete' />
                                                                        <Text style={{ color: 'white' }}>Remove</Text>
                                                                    </Button>
                                                                </View> */}
                                                </CardItem>


                                            ))}

                                            <Button
                                                style={[{ borderColor: config.SECONDARY_COLOR, borderWidth: 2, backgroundColor: "white", height: 35, padding: 10, marginLeft: 'auto', marginRight: 'auto', marginBottom: 10 }]}
                                                onPress={() => handleRepeatOrder(x)}
                                            >
                                                {spin ?
                                                    // <Spinner isVisible={true} size={75} type={"ThreeBounce"} color={config.SECONDARY_COLOR} />
                                                    <Flow size={75} color={config.SECONDARY_COLOR}></Flow>
                                                    :
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>

                                                        <Icon type="Ionicons" style={{ color: config.SECONDARY_COLOR }} name='repeat' />
                                                        <Text style={{ color: config.SECONDARY_COLOR }}>Repeat Order</Text>
                                                    </View>
                                                }
                                            </Button>

                                        </View>

                                    }
                                </Card>
                            </TouchableWithoutFeedback>
                        )

                    })}




            </ScrollView>
        </View>
    )
}
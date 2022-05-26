import React, { Component, useState, useEffect } from 'react';
import {ScrollView, Text, View, TouchableWithoutFeedback, Linking, ActivityIndicator} from 'react-native';
import config from '../config.json'
import axios from "axios";
import { Button, Icon, H1, Card, CardItem, Grid, Col } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { groupBy } from 'lodash'


export const Cart = (props) => {
    const [itemIdd, setItemIdd] = useState()
    const [firstHalf, setFirstHalf] = useState('first-half')
    const [secondHalf, setSecondHalf] = useState('second-half')
    const [cart, setCart] = useState()


    async function editItem(cat, id, cartt) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        let _this = this
        axios.get(`https://${base_url}/${slug}/menu/categories/${cat}/items/${id}/api`,
            {
                headers: {
                    'X-CSRF-TOKEN': token,
                    'credentials': 'same-origin',
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                }
            })
            .then(function (response) {
                response.data.mods = cart.lines.filter(a => a.id == cartt)[0]
                props.navigation.navigate('EditItem', { params: response.data, cart: getCart })
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }

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
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    async function lineWipe(id) {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.delete(`https://${base_url}/${slug}/cart/lines/${id}/delete/api`,
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
                getCart()
                props.initialParams.cart()
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }

    function cancelLineWipe() {
        setItemIdd(null)
    }

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async () => {
            getCart()
            // setCart(JSON.parse(await AsyncStorage.getItem('@cart')))
        });
        return unsubscribe;
    }, [])

    return (
        <View style={{
            flex: 1,
            flexDirection: "column"
        }}>
            {cart &&
                <View style={{ width: '100%' }}>
                    <Card style={{ flexDirection: 'column', justifyContent: 'space-between', padding: 10, alignItems: 'center', backgroundColor: config.ACCENT_COLOR }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "100%" }}>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', fontSize: 20,fontFamily: 'AppRegular' }}>Subtotal:</Text>
                            </View>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', textAlign: 'right', fontSize: 20,fontFamily: 'AppRegular' }}>${cart.subtotal.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "100%" }}>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', fontSize: 20,fontFamily: 'AppRegular' }}>Tax:</Text>
                            </View>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', textAlign: 'right', fontSize: 20,fontFamily: 'AppRegular' }}>${cart.tax.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "100%" }}>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', fontSize: 20,fontFamily: 'AppRegular' }}>Total:</Text>
                            </View>
                            <View style={{ width: 100 }}>
                                <Text style={{ color: 'white', textAlign: 'right', fontSize: 20,fontFamily: 'AppRegular' }}>${cart.total.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 10, width: '100%' }}>
                            <Button
                                onPress={() => props.navigation.navigate('Finalize', cart)}
                                style={[, { width: "100%", backgroundColor: cart.lines.length > 0 ? config.SECONDARY_COLOR : "gray" }]}
                                disabled={cart.lines.length > 0 ? false : true}
                            >
                                <H1 style={{ color: 'white', paddingLeft: 10 }}>Finalize Order</H1>
                                <Icon type={'Ionicons'} name='checkmark-done-circle-outline' />
                            </Button>
                        </View>
                    </Card>
                </View>
            }
            <ScrollView
                persistentScrollbar={true}
                decelerationRate={0.5}
            >
                {cart &&
                    cart.lines.length > 0 ?
                    cart.lines.map((item, i) => (
                        <TouchableWithoutFeedback key={i}>
                            <Card style={{ width: '100%' }}>
                                {itemIdd &&
                                    itemIdd == item.id ?
                                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', padding: 15 }}>
                                        <Button onPress={() => cancelLineWipe(item.id)} style={[, { borderColor: config.PRIMARY_COLOR, borderWidth: 2, backgroundColor: "white", padding: 10 }]}><Text style={{ color: 'black' }}>Cancel</Text></Button>
                                        <Button onPress={() => lineWipe(item.id)} style={[, { backgroundColor: config.ACCENT_COLOR, padding: 10 }]}><Text style={{ color: 'white' }}>Confirm</Text></Button>
                                    </View>
                                    :
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
                                                            <Text style={{ fontWeight: 'bold' }}><Icon style={{ color: config.PRIMARY_COLOR, transform: [{ rotate: '180deg' }] }} type="MaterialCommunityIcons" name="circle-slice-4" /> Left</Text>
                                                            {item.modifications[firstHalf].map((x, i) => (
                                                                <Text style={{fontFamily: 'AppRegular'}} key={i}>- {x.size == "extra" ? "Extra " + x.name : x.name}</Text>
                                                            ))}
                                                        </View>
                                                    }
                                                </Col>
                                                <Col>
                                                    {item.modifications[secondHalf] &&
                                                        <View >
                                                            {/* <Icon style={{ color: props.branding.brand_primary }} type="MaterialCommunityIcons" name="circle-slice-4" /> */}
                                                            <Text style={{ fontWeight: 'bold',fontFamily: 'AppRegular' }}>Right <Icon style={{ color: config.PRIMARY_COLOR }} type="MaterialCommunityIcons" name="circle-slice-4" /> </Text>
                                                            {item.modifications[secondHalf].map((x, i) => (
                                                                <Text style={{fontFamily: 'AppRegular'}}  key={i}>- {x.size == "extra" ? "Extra " + x.name : x.name}</Text>
                                                            ))}
                                                        </View>
                                                    }
                                                </Col>
                                            </Grid>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 15, width: '100%', justifyContent: 'space-between' }}>
                                            {!item.addon_id ?
                                                <Button
                                                    style={[{ borderColor: config.PRIMARY_COLOR, borderWidth: 2, backgroundColor: "white", height: 35, width: '40%', justifyContent: 'space-around' }]}
                                                    onPress={() => editItem(item.category_id, item.item_navigation_id, item.id)}
                                                >
                                                    <Icon type="AntDesign" style={{ color: config.PRIMARY_COLOR }} name='edit' />
                                                    <Text style={{ color: config.PRIMARY_COLOR,fontFamily: 'AppRegular' }}>Edit</Text>
                                                </Button>
                                                :
                                                null
                                            }
                                            <Button
                                                style={[, { height: 35, backgroundColor: config.ACCENT_COLOR, width: '40%', justifyContent: 'space-around' }]}
                                                onPress={() => setItemIdd(item.id)}
                                            >
                                                <Icon type="AntDesign" style={{ color: "white" }} name='delete' />
                                                <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>Remove</Text>
                                            </Button>
                                        </View>
                                    </CardItem>
                                }
                            </Card>
                        </TouchableWithoutFeedback>
                    ))
                    :
                    <View style={{alignItems:'center'}}>
                        {
                            cart &&
                            cart.lines.length < 1 ?
                                <View>
                                    <Text style={{fontWeight:'bold',color:config.PRIMARY_COLOR,marginTop:10,marginBottom:5,fontFamily: 'AppHeading',fontSize: 25}}>No Items</Text>
                                </View>
                            :
                                <View>
                                    <ActivityIndicator color={config.PRIMARY_COLOR} size={35} style={{marginTop: '35%'}} />
                                    <Text style={{fontWeight:'bold',color:config.PRIMARY_COLOR,marginTop:10,marginBottom:30,fontFamily: 'AppHeading',fontSize: 50}}>Loading...</Text>
                                </View>
                        }
                        <Button
                            style={[{ backgroundColor: config.PRIMARY_COLOR,width:200,justifyContent:'center',marginLeft:'auto',marginRight:'auto' }]}
                            onPress={() => props.navigation.navigate('Order')}
                        >
                            <H1 style={{ color: 'white' }}>Menu</H1>
                        </Button>
                    </View>
                }
            </ScrollView>
        </View>
    )
}

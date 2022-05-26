import React, { Component, useState, useEffect } from 'react';
import { ScrollView, Text, View, FlatList, TouchableWithoutFeedback, Dimensions, Alert, Modal } from 'react-native';
import { Icon, H2, Card, Button } from 'native-base'
import ToggleSwitch from 'toggle-switch-react-native'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import PriceCalc from './priceCalculations'
import { oneOf } from 'prop-types';
import { BackHandler } from "react-native";
import { useSafeArea } from 'react-native-safe-area-context';



export const ItemComp = (props) => {
    const [modObj, setModObj] = useState([])
    const [expandObj, setExpandObj] = useState([])
    const [modsMap, setModsMap] = useState()
    const [optionsMap, setOptionsMap] = useState()
    const [data, setData] = useState()
    const [itemSelection, setItemSelection] = useState()
    const [count, setCount] = useState(1)
    const [price, setPrice] = useState()
    const [optionCount, setOptionCount] = useState(0)
    const [optionAry, setOptionAry] = useState([])
    const [errorObj, setErrorObj] = useState()
    const [modal, setModal] = useState(false)
    const [optionKey, setOptionKey] = useState()
    const [dataModal, setDataModal] = useState(true)
    const [optionModal, setOptionModal] = useState(true)
    const [sscroll, setSscroll] = useState(false)
    const [IncludedToppings, setIncludedToppings] = useState()
    const [itemIndex, setItemIndex] = useState(0)
    const [done, setDone] = useState()
    const [GoBack, setGoBack] = useState(false)
    const [rref, setRRef] = useState()
    const [optionHeight,setOptionHeight] = useState()
    const [itemHeight,setItemHeight] = useState()




    async function addToCart(item) {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.post(`https://${base_url}/${slug}/cart/add/api`,
            {
                item: itemSelection,
                quantity: count,
                modifiers: modObj,
                addOns: [],
                itemNavigation: data.id,
                comment: "",
                category_id: props.route.params.cat
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
                props.route.params.cart()
                props.navigation.navigate('Order')



                // let refreshIntervalId =  setInterval(async() => {
                //     if(await AsyncStorage.getItem('@test')){
                //         // props.navigation.navigate('Home', { screen: 'HomeScreen', params: props.route.params })
                //         props.navigation.goBack()
                //         clearInterval(refreshIntervalId);
                //     }
                // }, 100);



            })
            .catch((error) => {
                console.log(error);
                console.log(error.response);
            });
    }


    async function getOptions() {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.get(`https://${base_url}/${slug}/menu/categories/${props.route.params.cat}/items/${props.route.params.item.id}/api`,
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
                let includedToppings = []
                let options = []
                let mods = []
                let oo = []
                setData(response.data.item)
                response.data.item.modification_groups.map(item => {
                    let yy = []
                    if (item.control_type == 'checkbox') {
                        item.modifications.map(z => {
                            if (z.included_quantity > 0) {
                                includedToppings.push(z)
                            } else {
                                yy.push(z)
                            }
                        })
                    } else {
                        options.push(item)
                    }


                    if (yy.length > 0) {
                        let rr = item
                        rr.modifications = yy
                        mods.push(rr)
                    }
                })
                if (includedToppings.length > 0) {
                    let oo = []
                    includedToppings.map(async (z, i) => {
                        // await setModFunction("size", 1, z.id, z.modification_group_id, true, response.data.item)
                        oo.push({
                            groupId: z.modification_group_id,
                            id: z.id,
                            quantity: 1,
                            portion: 'whole',
                            size: "normal",
                            selected_size: 1,
                            selected_portion: null,
                            included: true,
                            selected: true,
                            option: false
                        })

                    })
                    setModObj(oo)


                }

                // mods.map(item => {
                // })

                if (includedToppings.length > 0) {
                    mods.unshift({
                        name: "Included",
                        modifications: includedToppings
                    })
                }

                // if (oo.length > 0) {
                //     mods.unshift({
                //         name: "Included",
                //         modifications: includedToppings
                //     })
                // }

                setModsMap(mods)
                console.log(mods)
                setOptionsMap(options)
                setIncludedToppings(includedToppings)
                setPrice(
                    PriceCalc.calculateSubtotal(
                        count,
                        response.data.item,
                        {
                            choices:
                            {
                                includedModifiers: includedToppings,
                                item: 0,
                                modifiers: modObj,
                                addOns: [],
                                category: "Salads"
                            }
                        }).toFixed(2)
                )


                if (response.data.item.item_group.items.length == 1) {
                    setItemSelection(response.data.item.item_group.items[0].id)
                    options.length > 0 && setOptionKey(0)
                    setItemIndex(0)
                }
                setDone(true)

                // if (response.data.item.item_group.items.length != 1) {
                //     expandOptionFunction(response.data.item.item_group.id, null)
                // } else if (options.length > 0) {
                //     expandOptionFunction(options[0].id, null)
                // }
            })
            .catch((error) => {
                console.log(error);
                console.log(error.response);
            });
    }

    function handleCount(type) {
        if (type == "add") {
            setPrice(
                PriceCalc.calculateSubtotal(
                    count + 1,
                    data,
                    {
                        choices:
                        {
                            includedModifiers: IncludedToppings,
                            item: itemIndex,
                            modifiers: modObj,
                            addOns: [],
                            category: "Salads"
                        }
                    }).toFixed(2)
            )
            setCount(count + 1)

        } else {
            if (count > 1) {
                setPrice(
                    PriceCalc.calculateSubtotal(
                        count - 1,
                        data,
                        {
                            choices:
                            {
                                includedModifiers: IncludedToppings,
                                item: itemIndex,
                                modifiers: modObj,
                                addOns: [],
                                category: "Salads"
                            }
                        }).toFixed(2)
                )
                setCount(count - 1)
            }
        }
    }

    function setItemSelectionFun(id, index, modal) {
        setItemSelection(id)
        setItemIndex(index)
        setPrice(
            PriceCalc.calculateSubtotal(
                count,
                data,
                {
                    choices:
                    {
                        includedModifiers: IncludedToppings,
                        item: index,
                        modifiers: modObj,
                        addOns: [],
                        category: "Salads"
                    }
                }).toFixed(2)
        )
        if (!modal) {

            setOptionKey(0)
        }
    }

    function addToCartChk() {
        let obj = []
        if (data.item_group.items.length > 0) {
            if (!itemSelection) {
                obj.push(data.item_group)


            }
        }
        if (isNaN(price)) {
            setErrorObj([{ "name": "Invalid Selection" }])
            setModal(true)

            return

        }
        if (optionAry.length == optionsMap.length) {
            addToCart()


        } else {
            optionsMap.map(item => {
                if (!optionAry.includes(item.id)) {
                    obj.push(item)
                }
            })
            console.log(obj)
            setErrorObj(obj)
            setModal(true)
        }

    }

    function setModFunction(type, amount, id, groupId, bool, dataa, option) {
        console.log(id)
        console.log(groupId)

        setOptionKey(optionKey + 1)
        console.log(modObj)
        let checkAmt;
        let newModObj = modObj.map(group => ({
            ...group,
        }))
        let tt = option ? newModObj.filter(a => a.groupId == groupId)[0] : newModObj.filter(a => a.id == id)[0]
        console.log(tt)
        if (type == 'del') {
            newModObj = newModObj.filter(a => a.id != id);
            setModObj(newModObj)
            setPrice(
                PriceCalc.calculateSubtotal(
                    count,
                    dataa ? dataa : data,
                    {
                        choices:
                        {
                            includedModifiers: IncludedToppings && IncludedToppings,
                            item: itemIndex,
                            modifiers: newModObj,
                            addOns: [],
                            category: "Salads"
                        }
                    }).toFixed(2)
            )
            return

        }

        if (tt) {
            console.log("response")

            if (type == 'size') {
                checkAmt = tt.selected_size
            } else {
                checkAmt = tt.selected_portion
            }


            if (checkAmt == amount) {

                if (option) {
                    tt.id = id
                } else {
                    newModObj = newModObj.filter(a => a.id != id)
                }

            } else {
                tt.groupId = groupId,
                    tt.id = id,
                    tt.quantity = 1,
                    tt.portion = type == "portion" ? amount == 0 ? "first-half" : amount == 1 ? "whole" : "second-half" : tt.portion,
                    tt.size = type == "size" ? amount == 0 ? "extra" : amount == 1 ? "normal" : "none" : tt.size,
                    tt.selected_size = type == "size" ? amount : null,
                    tt.selected_portion = type == "portion" ? amount : null,
                    tt.included = bool,
                    tt.selected = true
            }
        } else {
            if (option) {
                let rr = optionAry
                rr.push(groupId)
                setOptionAry(rr)
            }

            newModObj.push({
                groupId: groupId,
                id: id,
                quantity: 1,
                portion: type == "portion" ? amount == 0 ? "first-half" : amount == 1 ? "whole" : "second-half" : 'whole',
                size: type == "size" ? amount == 0 ? "extra" : amount == 1 ? "normal" : "none" : "normal",
                selected_size: type == "size" ? amount : null,
                selected_portion: type == "portion" ? amount : null,
                included: bool,
                selected: true,
                option: option ? true : false
            })
        }
        console.log(newModObj)
        setModObj(newModObj)
        setPrice(
            PriceCalc.calculateSubtotal(
                count,
                dataa ? dataa : data,
                {
                    choices:
                    {
                        includedModifiers: IncludedToppings && IncludedToppings,
                        item: itemIndex,
                        modifiers: newModObj,
                        addOns: [],
                        category: "Salads"
                    }
                }).toFixed(2)
        )

        return

    }

    function expandOptionFunction(groupId, itemId, bool) {
        console.log(rref)
        rref.scrollTo({
            y: 200
        })
        let newExpand = expandObj.map(group => ({
            ...group,
        }))
        let tt = newExpand.filter(a => a.groupId == groupId)[0]
        if (tt) {
            if (itemId) {
                if (tt.children.includes(itemId)) {
                    tt.children.splice(tt.children.indexOf(itemId), 1)
                } else {
                    tt.children.push(itemId)
                    if (!modObj.filter(a => a.id == itemId)[0]) {

                        setModFunction("portion", 1, itemId, groupId, bool, null)
                    }
                }
            } else {
                newExpand = newExpand.filter(a => a.groupId != groupId);
            }
            setExpandObj(newExpand)
        } else {
            setExpandObj([...expandObj, {
                groupId: groupId,
                children: []
            }]);
        }
    }

    function goBack() {
        setGoBack(true)
        // Alert.alert("Hold on!", "Are you sure you want to go back?", [
        //   {
        //     text: "Cancel",
        //     onPress: () => null,
        //     style: "cancel"
        //   },
        //   { text: "Add to Cart", onPress: () => addToCartChk() },
        //   { text: "YES", onPress: () => props.navigation.goBack() }
        // ]);
        return true

    }

    useEffect(async () => {
        getOptions()
        props.navigation.setOptions({
            title: props.route.params.name, headerLeft: () => (
                <Icon onPress={goBack} type="AntDesign" name="arrowleft" style={{ color: "white", marginLeft: 10 }} />
            ),
        });
        BackHandler.addEventListener('hardwareBackPress', goBack);
        console.log(props)



    }, [])




    return (
        <View style={{
            flex: 1,
            flexDirection: "column"
        }}>


            <Modal
                animationType="slide"
                transparent={true}
                visible={GoBack}

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
                        width: "95%",
                    }} >
                        <View style={{ width: '95%' }} >
                            <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>

                                {/* <Button
                                    onPress={() => setGoBack(false)}
                                    style={{ padding: 20,marginTop:-10, backgroundColor: config.SECONDARY_COLOR }}>
                                    <Text style={{ color: 'white' }}>Cancel</Text>
                                </Button> */}
                                <Icon onPress={() => setGoBack(false)} style={{ color: 'red', marginTop: -10 }} type="AntDesign" name="close" />

                            </View>
                            <View>
                                <H2>Hold on!</H2>


                                <Text style={{fontFamily: 'AppRegular'}}>Are you sure you want to cancel item?</Text>

                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                    <Button
                                        onPress={() => props.navigation.goBack()}
                                        style={{ padding: 20, marginTop: 30, backgroundColor: config.SECONDARY_COLOR }}>
                                        <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>Yes</Text>
                                    </Button>
                                    <Button
                                        onPress={() => addToCartChk()}
                                        style={{ padding: 20, marginTop: 30, backgroundColor: config.PRIMARY_COLOR }}>
                                        <Text style={{ color: 'white',fontFamily: 'AppRegular' }}>Add To Cart</Text>
                                    </Button>
                                </View>
                            </View>
                        </View>
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
                    marginTop: 22,
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
                    }} >
                        <View>

                        <Icon style={{ color: 'red', marginTop: -10 }} type="MaterialIcons" name="error" />

                            <Text style={{fontSize:20,textAlign:'center',marginTop:15,fontFamily: 'AppRegular'}}>Oops, we still need to know a few more things.</Text>
                            <View style={{marginTop:15,alignItems:'center'}}>
                                <Text style={{fontWeight:'bold',fontSize:20,fontFamily: 'AppRegular'}}>Please choose</Text>
                            {errorObj &&
                                errorObj.map((item, i) => (
                                    <Text style={{fontFamily: 'AppRegular'}} key={i}> {item.name}</Text>
                                ))}

                            </View>

                            <View style={{ alignItems:'center' }}>
                                <Button onPress={() => setModal(false)} style={{ padding: 20, marginTop: 30, backgroundColor: config.SECONDARY_COLOR,width:150,justifyContent:'center',marginLeft:'auto',marginRight:'auto',fontFamily: 'AppRegular' }}><Text style={{ color: 'white' }}>CONTINUE</Text></Button>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>


            <Modal
                animationType="slide"
                transparent={true}
                visible={data && data.item_group.items.length > 1 && !itemSelection && dataModal ? true : false}

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
                        alignItems: "center",
                        shadowColor: "gray",
                        padding: 20,
                        shadowOffset: {
                            width: 0,
                            height: 2
                        },
                        elevation: 10,
                        width:300,
                        height:itemHeight && itemHeight + 40,
                        borderRadius:20

                    }} >
                        {data &&
                            <View style={{ padding: 0,width:250 }} onLayout={(l)=>setItemHeight(l.nativeEvent.layout.height)}>
                                <View style={{ flexDirection: 'row', marginBottom: 20, justifyContent: 'space-between', borderBottomColor: 'lightgray', borderBottomWidth: .5 }}>
                                    <H2 style={{ textAlign: 'center', fontWeight: 'bold' }}>{data.item_group.name}</H2>
                                    <Icon onPress={() => setDataModal(false)} style={{ textAlign: 'center', color: 'red' }} type="AntDesign" name="close" />
                                </View>
                                <ScrollView >
                                    {data.item_group.items.map((item, i) => (
                                        <TouchableWithoutFeedback
                                            key={i}
                                            onPress={() => setItemSelectionFun(item.id, i)}
                                        >
                                            <View style={{ borderBottomWidth: .5, paddingBottom: 10, marginBottom: 10, justifyContent: 'space-between', marginTop: 15, flexDirection: 'row' }}>
                                                <H2 style={{ marginRight: 15, flexShrink:1 }}>{item.name}</H2>
                                                <Icon style={{ textAlign: 'center' }} type="AntDesign" name="right" />
                                            </View>
                                        </TouchableWithoutFeedback>
                                    ))}
                                </ScrollView>
                            </View>
                        }
                    </View>
                </View>
            </Modal>
            {props.route.params.item.description ?
            <View>
                <Text style={{ textAlign: 'center',marginTop:5, borderBottomWidth: .5, borderBottomColor: 'gray', borderTopWidth: .5, borderTopColor: 'gray',fontFamily: 'AppRegular' }}>{props.route.params.item.description}</Text>
            </View>
            :
            null
            }

            {optionsMap &&
                optionsMap.map((z, i) => (
                    <Modal
                        key={i}
                        animationType="slide"
                        transparent={true}
                        visible={optionKey == i && optionModal ? true : false}

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
                                padding: 10,
                                alignItems: "center",
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 2
                                },
                                elevation: 10,
                                width:300,
                                height:optionHeight && optionHeight + 40,
                                borderRadius:20,
                                maxHeight:Dimensions.get('window').height,

                            }} >

                                <View style={{ padding: 0,width:250,maxHeight:Dimensions.get('window').height - 100 }} onLayout={(l)=>setOptionHeight(l.nativeEvent.layout.height)}>

                                    <View style={{ flexDirection: 'row', marginBottom: 20, justifyContent: 'space-between', borderBottomColor: 'lightgray', borderBottomWidth: .5 }}>
                                        <H2 style={{ textAlign: 'center', fontWeight: 'bold',flexShrink:1 }}>{z.name}</H2>
                                        <Icon onPress={() => setOptionModal(false)} style={{ textAlign: 'center', color: 'red' }} type="AntDesign" name="close" />
                                    </View>

                                    <ScrollView style={{}}>
                                        {z.modifications.map((item, i) => (
                                            <TouchableWithoutFeedback
                                                key={i}
                                                onPress={() => setModFunction("portion", 1, item.id, z.id, null, null, true)}
                                            >
                                                <View style={{ borderBottomWidth: .5, paddingBottom: 10, marginBottom: 10, justifyContent: 'space-between', marginTop: 15, flexDirection: 'row' }}>

                                                    <H2 style={{ marginRight: 15 }}>{item.name}</H2>
                                                    <Icon style={{ textAlign: 'center' }} type="AntDesign" name="right" />
                                                </View>
                                            </TouchableWithoutFeedback>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    </Modal>
                ))}








            <View style={{ width: '100%' }}>
                <Card style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center', backgroundColor: config.ACCENT_COLOR }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon style={{ color: 'white' }} type="Entypo" name="minus" onPress={() => handleCount('minus')} />

                        <H2 style={{ marginRight: 15, marginLeft: 15, color: "white" }}>{count}</H2>
                        <Icon style={{ color: 'white' }} type="Entypo" name="plus" onPress={() => handleCount('add')} />

                    </View>
                    <H2 style={{ color: 'white' }}>{price ? price : "$0.00"}</H2>
                    <Button style={{ backgroundColor: optionsMap && optionAry.length == optionsMap.length ? config.SECONDARY_COLOR : "lightgray" }} onPress={() => addToCartChk()}>
                        <Icon type="FontAwesome" name="cart-plus" />
                        <Text style={{textAlign:'center',color:'white',fontSize:20,marginRight:10,fontFamily: 'AppRegular'}}>Add</Text>
                    </Button>
                </Card>
            </View>
            {done &&

                <ScrollView
                    ref={ref => {
                        setRRef(ref)
                    }}
                    style={{ backgroundColor: '#f5f5f5',paddingBottom:100 }}>
                    {data &&
                        data.item_group.items.length > 1 &&
                        <View >
                            <TouchableWithoutFeedback onPress={() => expandOptionFunction(data.item_group.id, null)}>
                                <View style={{
                                    marginTop: 16,
                                    backgroundColor: config.SECONDARY_COLOR,
                                    padding: 16,
                                    borderTopLeftRadius: 8,
                                    borderTopRightRadius: 8,
                                    flexDirection: 'row',
                                    alignItems: "center",
                                    justifyContent: 'space-between'
                                }}>
                                    {itemSelection &&
                                        <Icon type="AntDesign" name="checkcircle" style={{ color: config.SECONDARY_ACCENT }} />
                                    }
                                    <H2 style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>{data.item_group.name}</H2>
                                    <Icon type="Entypo" name="chevron-thin-down" />
                                    {/* <Icon style={{ transform: [{ rotate: this.state.open.includes(this.state.data.item_group.id) ? '180deg' : "0deg" }] }} type="Entypo" name="chevron-thin-down" /> */}
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={{ height: expandObj.filter(a => a.groupId == data.item_group.id)[0] ? 'auto' : 0, marginLeft: 'auto', marginRight: 'auto' }}>
                                <FlatList
                                    scrollEnabled={false}
                                    contentContainerStyle={{ width: Dimensions.get('window').width / 1.1 }}
                                    data={data.item_group.items}
                                    initialNumToRender={4}
                                    renderItem={({ item, index }) =>
                                        <TouchableWithoutFeedback
                                            onPress={() => setItemSelectionFun(item.id, index, true)}
                                        >
                                            <View style={{ borderBottomWidth: .5, borderBottomColor: 'lightgray', flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
                                                {itemSelection == item.id ?
                                                    <Icon style={{ color: "green", textAlign: 'center' }} type="Entypo" name="check" />
                                                    :
                                                    < Icon style={{ color: "rgba(255, 255, 255, 0)", textAlign: 'center' }} type="MaterialCommunityIcons" name="close" />
                                                }
                                                <H2 style={{ textAlign: 'center', fontWeight: 'bold', flexShrink: 1 }}>{item.name}</H2>
                                                <Icon type="Entypo" name="plus" />

                                                {/* <H2 style={{ marginRight: 15 }}>{item.name}</H2> */}
                                            </View>


                                        </TouchableWithoutFeedback>
                                    }
                                    keyExtractor={item => item.id}
                                />
                            </View>
                        </View>
                    }

                    {optionsMap &&
                        optionsMap.map((z, i) => (
                            <View key={i} >
                                <TouchableWithoutFeedback onPress={() => expandOptionFunction(z.id, null)}>
                                    <View style={{
                                        marginTop: 16,
                                        backgroundColor: config.SECONDARY_COLOR,
                                        padding: 16,
                                        borderTopLeftRadius: 8,
                                        borderTopRightRadius: 8,
                                        flexDirection: 'row',
                                        alignItems: "center",
                                        justifyContent: 'space-between',
                                    }}>
                                        {modObj.filter(a => a.groupId == z.id)[0] &&
                                            <Icon type="AntDesign" name="checkcircle" style={{ color: config.SECONDARY_ACCENT }} />
                                        }
                                        <H2 style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>{z.name}</H2>
                                        <Icon type="Entypo" name="chevron-thin-down" />
                                        {/* <Icon style={{ transform: [{ rotate: this.state.open.includes(this.state.data.item_group.id) ? '180deg' : "0deg" }] }} type="Entypo" name="chevron-thin-down" /> */}
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{ height: expandObj.filter(a => a.groupId == z.id)[0] ? 'auto' : 0, marginLeft: 'auto', marginRight: 'auto' }}>
                                    <FlatList
                                        scrollEnabled={false}
                                        contentContainerStyle={{ width: Dimensions.get('window').width / 1.1 }}
                                        data={z.modifications}
                                        initialNumToRender={4}
                                        renderItem={({ item, index }) =>
                                            <TouchableWithoutFeedback
                                                onPress={() => setModFunction("portion", 1, item.id, z.id, null, null, true)}
                                            >
                                                <View style={{ borderBottomWidth: .5, borderBottomColor: 'lightgray', flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
                                                    {modObj.filter(a => a.id == item.id)[0] ?
                                                        <Icon style={{ color: "green", textAlign: 'center' }} type="Entypo" name="check" />
                                                        :
                                                        < Icon style={{ color: "rgba(255, 255, 255, 0)", textAlign: 'center' }} type="MaterialCommunityIcons" name="close" />
                                                    }
                                                    <H2 style={{ textAlign: 'center', fontWeight: 'bold', flexShrink: 1 }}>{item.name}</H2>

                                                    <Icon type="Entypo" name="plus" />


                                                    {/* <H2 style={{ marginRight: 15 }}>{item.name}</H2> */}
                                                </View>
                                            </TouchableWithoutFeedback>
                                        }
                                        keyExtractor={item => item.id}
                                    />
                                </View>
                            </View>
                        ))}

                    {modsMap &&
                        modsMap.map((x, i) => (
                            <View key={i}>
                                <TouchableWithoutFeedback onPress={() => expandOptionFunction(x.id, null)}>
                                    <View style={{
                                        marginTop: 16,
                                        backgroundColor: config.SECONDARY_COLOR,
                                        padding: 16,
                                        borderTopLeftRadius: 8,
                                        borderTopRightRadius: 8,
                                        flexDirection: 'row',
                                        alignItems: "center",
                                        justifyContent: 'space-between'
                                    }}>
                                        <H2 style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>{x.name}</H2>
                                        <Icon type="Entypo" name="chevron-thin-down" />
                                        {/* <Icon style={{ transform: [{ rotate: this.state.open.includes(this.state.data.item_group.id) ? '180deg' : "0deg" }] }} type="Entypo" name="chevron-thin-down" /> */}
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{ height: expandObj.filter(a => a.groupId == x.id)[0] ? 'auto' : 0, marginLeft: 'auto', marginRight: 'auto' }}>
                                    <FlatList

                                        scrollEnabled={false}
                                        contentContainerStyle={{ width: Dimensions.get('window').width / 1.1 }}
                                        data={x.modifications}
                                        initialNumToRender={4}
                                        renderItem={({ item, index }) =>
                                            <View>
                                                <TouchableWithoutFeedback onPress={() => expandOptionFunction(x.id, item.id, item.included_quantity > 0 ? true : false)}>
                                                    <View style={{
                                                        marginTop: 16,
                                                        marginBottom: -20,
                                                        // backgroundColor: config.SECONDARY_ACCENT,
                                                        borderBottomColor: 'lightgray',
                                                        borderBottomWidth: expandObj.filter(a => a.groupId == x.id)[0] && expandObj.filter(a => a.groupId == x.id)[0].children.includes(item.id) ? 0 : .5,
                                                        padding: 16,
                                                        flexDirection: 'row',
                                                        alignItems: "center",
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        {modObj.filter(a => a.id == item.id)[0] ?
                                                            <Icon style={{ color: "green", textAlign: 'center' }} type="Entypo" name="check" />
                                                            :
                                                            < Icon style={{ color: "rgba(255, 255, 255, 0)", textAlign: 'center' }} type="MaterialCommunityIcons" name="close" />
                                                        }
                                                        <H2 style={{ textAlign: 'center', fontWeight: 'bold', flexShrink: 1 }}>{item.name}</H2>
                                                        <Icon type="Entypo" name="plus" />
                                                        {/* <Icon style={{ transform: [{ rotate: this.state.open.includes(this.state.data.item_group.id) ? '180deg' : "0deg" }] }} type="Entypo" name="chevron-thin-down" /> */}
                                                    </View>
                                                </TouchableWithoutFeedback>
                                                <View style={{ borderBottomWidth: .5, borderBottomColor: 'lightgray', flexDirection: 'row', height: expandObj.filter(a => a.groupId == x.id)[0] && expandObj.filter(a => a.groupId == x.id)[0].children.includes(item.id) ? "auto" : 0, opacity: expandObj.filter(a => a.groupId == x.id)[0] && expandObj.filter(a => a.groupId == x.id)[0].children.includes(item.id) ? 1 : 0, justifyContent: 'space-between' }}>
                                                    <View style={{ flexDirection: "row" }}>
                                                        {item.show_half_toppings == 1 &&
                                                            <Icon onPress={() => setModFunction("portion", 0, item.id, x.id, item.included_quantity > 0 ? true : null, null)} style={{ marginTop: 15, color: modObj.filter(a => a.id == item.id)[0] && modObj.filter(a => a.id == item.id)[0].portion == 'first-half' ? "red" : "lightgray", fontSize: 50, transform: [{ rotate: '180deg' }] }} type="MaterialCommunityIcons" name="circle-slice-4" />
                                                        }

                                                        <Icon onPress={() => setModFunction("portion", 1, item.id, x.id, item.included_quantity > 0 ? true : null, null)} style={{ marginTop: 15, color: modObj.filter(a => a.id == item.id)[0] && modObj.filter(a => a.id == item.id)[0].portion == 'whole' ? "red" : "lightgray", fontSize: 50 }} type="MaterialCommunityIcons" name="circle-slice-8" />
                                                        {item.show_half_toppings == 1 &&
                                                            <Icon onPress={() => setModFunction("portion", 2, item.id, x.id, item.included_quantity > 0 ? true : null, null)} style={{ marginTop: 15, color: modObj.filter(a => a.id == item.id)[0] && modObj.filter(a => a.id == item.id)[0].portion == 'second-half' ? "red" : "lightgray", fontSize: 50 }} type="MaterialCommunityIcons" name="circle-slice-4" />
                                                        }
                                                    </View>
                                                    {item.show_double_toppings == 1 &&
                                                        <View style={{ marginTop: 15 }}>
                                                            <Text style={{ color: config.SECONDARY_COLOR, textAlign: 'center',fontFamily: 'AppRegular' }}>Extra</Text>
                                                            <ToggleSwitch
                                                                isOn={modObj.filter(a => a.id == item.id)[0] && modObj.filter(a => a.id == item.id)[0].size == 'extra' ? true : false}
                                                                onColor="red"
                                                                offColor="lightgray"
                                                                // labelStyle={{ flexDirection:'column', color: config.SECONDARY_COLOR, fontWeight: "900" }}
                                                                size='medium'
                                                                onToggle={() => modObj.filter(a => a.id == item.id)[0] && modObj.filter(a => a.id == item.id)[0].size == 'extra' ? setModFunction("size", 1, item.id, x.id, item.included_quantity > 0 ? true : null, null) : setModFunction("size", 0, item.id, x.id, item.included_quantity > 0 ? true : null, null)}
                                                            />
                                                        </View>
                                                    }
                                                    <View style={{ marginTop: 25 }}>
                                                        <TouchableWithoutFeedback
                                                            onPress={() => { setModFunction("del", 1, item.id, x.id, item.included_quantity > 0 ? true : null, null) }}>
                                                            {modObj.filter(a => a.id == item.id)[0] ?
                                                                <Icon style={{ color: "red", textAlign: 'center' }} type="FontAwesome" name="trash-o" />
                                                                :
                                                                < Icon style={{ color: "rgba(255, 255, 255, 0)", textAlign: 'center' }} type="FontAwesome" name="trash-o" />
                                                            }

                                                        </TouchableWithoutFeedback>
                                                    </View>
                                                </View>
                                            </View>
                                        }
                                        keyExtractor={item => item.id}
                                    />
                                </View>
                            </View>
                        ))}
                </ScrollView>
            }



        </View>

    )
}

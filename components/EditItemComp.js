import React, { Component, useState, useEffect } from 'react';
import { ScrollView, Text, View, FlatList, TouchableWithoutFeedback, Dimensions, Alert, Modal } from 'react-native';
import { Icon, H2, Card, Button } from 'native-base'
import ToggleSwitch from 'toggle-switch-react-native'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import PriceCalc from './priceCalculations'

export const EditItemComp = (props) => {
    const [modObj, setModObj] = useState([])
    const [expandObj, setExpandObj] = useState([])
    const [modsMap, setModsMap] = useState()
    const [optionsMap, setOptionsMap] = useState()
    const [data, setData] = useState()
    const [itemSelection, setItemSelection] = useState()
    const [count, setCount] = useState(props.route.params.params.mods.quantity)
    const [price, setPrice] = useState()
    const [optionCount, setOptionCount] = useState(0)
    const [optionAry, setOptionAry] = useState([])
    const [errorObj, setErrorObj] = useState()
    const [modal, setModal] = useState(false)
    const [tt, setTT] = useState()
    const firstHalf = "first-half"
    const secondHalf = "second-half"

    const [IncludedToppings, setIncludedToppings] = useState()
    const [itemIndex, setItemIndex] = useState(0)
    const [done, setDone] = useState()



    async function updateCart(item) {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.post(`https://${base_url}/${slug}/cart/lines/${props.route.params.params.mods.id}/edit/category/${props.route.params.params.mods.category_id}'`,
            {
                item: itemSelection,
                quantity: count,
                modifiers: modObj,
                addOns: [],
                itemNavigation: data.id,
                comment: "",
                category_id: props.route.params.params.mods.category_id
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
                // this.props.close()
                // this.props.cardUpdate()
                // props.route.params.params.cart()
                props.route.params.cart()
                props.navigation.goBack()

            })
            .catch((error) => {
                console.log(error);
                console.log(error.response);
            });
    }

    async function getOptions(edit) {
        let ii = props.route.params.params.item.item_group.items.indexOf(props.route.params.params.item.item_group.items.filter(a => a.id == props.route.params.params.mods.item_id)[0])
        setItemSelection(props.route.params.params.item.item_group.items.filter(a => a.id == props.route.params.params.mods.item_id)[0].id)
        console.log(ii)
        setItemIndex(ii)
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.get(`https://${base_url}/${slug}/menu/categories/${props.route.params.params.category.id}/items/${props.route.params.params.item.id}/api`,
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

                    includedToppings.map((z, i) => {
                        setModFunction("size", 1, z.id, z.modification_group_id, true, response.data.item)
                    })


                }

                // mods.map(item => {
                // })

                if (includedToppings.length > 0) {
                    mods.unshift({
                        name: "Included",
                        modifications: includedToppings
                    })
                }
                setModsMap(mods)
                setOptionsMap(options)
                setIncludedToppings(includedToppings)


                // setPrice(
                //     PriceCalc.calculateSubtotal(
                //         count,
                //         response.data.item,
                //         {
                //             choices:
                //             {
                //                 includedModifiers: includedToppings,
                //                 item: 0,
                //                 modifiers: modObj,
                //                 addOns: [],
                //                 category: "Salads"
                //             }
                //         }).toFixed(2)
                // )


                if (response.data.item.item_group.items.length == 1) {
                    setItemSelection(response.data.item.item_group.items[0].id)
                    setItemIndex(0)
                }
                if (response.data.item.item_group.items.length != 1) {
                    expandOptionFunction(response.data.item.item_group.id, null)
                } else if (options.length > 0) {
                    expandOptionFunction(options[0].id, null)
                }

                makeMod(response.data.item,ii)


            })
            .catch((error) => {
                console.log(error);
                console.log(error.response);
            });
    }

    function makeMod(dataa,index) {
        console.log(IncludedToppings)
        let menu_item = props.route.params.params.item
        let mods = []
        if (menu_item.modification_groups.length > 0) {
            menu_item.modification_groups.map((item, i) => {
                if (props.route.params.params.mods.modifications.whole) {
                    props.route.params.params.mods.modifications.whole.map(async (z) => {
                        let selected = item.modifications.filter(a => a.id == z.modification_id)[0]
                        console.log(selected)
                        if (selected) {
                            let type = "portion"
                            let ss = modObj
                            let amount = 1
                            let option = item.control_type != 'checkbox' ? true : false
                            if (option) {
                                let rr = optionAry
                                rr.push(item.id)
                                setOptionAry(rr)
                            }
                            ss.push({
                                groupId: item.id,
                                id: selected.id,
                                quantity: 1,
                                portion: type == "portion" ? amount == 0 ? "first-half" : amount == 1 ? "whole" : "second-half" : 'whole',
                                size: z.size == "extra" ? "extra" : "normal",
                                selected_size: type == "size" ? amount : null,
                                selected_portion: type == "portion" ? amount : null,
                                included: selected.included_quantity ? true : false,
                                selected: true,
                                option: option ? true : false


                            })
                            setModObj(ss)


                        }
                    })
                }
                if (props.route.params.params.mods.modifications[firstHalf]) {
                    props.route.params.params.mods.modifications[firstHalf].map(z => {
                        let selected = item.modifications.filter(a => a.id == z.modification_id)[0]
                        if (selected) {
                            //    setModFunction("portion", 1, selected.id, item.id, null, null)
                            let type = "portion"
                            let ss = modObj
                            let amount = 0

                            ss.push({
                                groupId: item.id,
                                id: selected.id,
                                quantity: 1,
                                portion: type == "portion" ? amount == 0 ? "first-half" : amount == 1 ? "whole" : "second-half" : 'whole',
                                size: type == "size" ? amount == 0 ? "extra" : amount == 1 ? "normal" : "none" : "normal",
                                selected_size: type == "size" ? amount : null,
                                selected_portion: type == "portion" ? amount : null,
                                included: selected.included_quantity ? true : false,
                                selected: true
                            })
                            setModObj(ss)
                        }
                    })
                }
                if (props.route.params.params.mods.modifications[secondHalf]) {
                    props.route.params.params.mods.modifications[secondHalf].map(z => {
                        let selected = item.modifications.filter(a => a.id == z.modification_id)[0]
                        if (selected) {
                            //    setModFunction("portion", 1, selected.id, item.id, null, null)
                            let type = "portion"
                            let ss = modObj
                            let amount = 2

                            ss.push({
                                groupId: item.id,
                                id: selected.id,
                                quantity: 1,
                                portion: type == "portion" ? amount == 0 ? "first-half" : amount == 1 ? "whole" : "second-half" : 'whole',
                                size: type == "size" ? amount == 0 ? "extra" : amount == 1 ? "normal" : "none" : "normal",
                                selected_size: type == "size" ? amount : null,
                                selected_portion: type == "portion" ? amount : null,
                                included: selected.included_quantity ? true : false,
                                selected: true
                            })
                            setModObj(ss)
                        }
                    })
                }
            })

        }
        console.log(count)
        console.log(modObj)
        console.log(dataa)
        console.log(IncludedToppings)
        console.log(index)

        setPrice(
            PriceCalc.calculateSubtotal(
                count ,
                dataa,
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
        setTT(true)
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

    function addToCartChk() {
        let obj = []
        if (data.item_group.items.length > 0) {
            if (!itemSelection) {
                obj.push(data.item_group)


            }
        }
        if (optionAry.length == optionsMap.length) {
            updateCart()


        } else {
            optionsMap.map(item => {
                if (!optionAry.includes(item.id)) {
                    obj.push(item)
                }
            })
            setErrorObj(obj)
            setModal(true)




        }
    }

    function setModFunction(type, amount, id, groupId, bool, dataa, option) {



        let checkAmt;
        let newModObj = modObj.map(group => ({
            ...group,
        }))



        let tt = option ? newModObj.filter(a => a.groupId == groupId)[0] : newModObj.filter(a => a.id == id)[0]
        if (type == 'del') {
            newModObj = newModObj.filter(a => a.id != id);
            setModObj(newModObj)
            return
        }

        if (tt) {
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
            // option && setOptionCount(optionCount + 1)
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

    }

    function expandOptionFunction(groupId, itemId,bool) {
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

    useEffect(async () => {
        getOptions()
    }, [])

    return (
        <View style={{
            flex: 1,
            flexDirection: "column"
        }}>



            <Modal
                animationType="slide"
                transparent={true}
                visible={modal}

            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 22
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
                        {errorObj &&
                            errorObj.map((item, i) => (


                                <Text style={{fontFamily: 'AppRegular'}} key={i}>Please choose {item.name}</Text>

                            ))}
                        <View style={{ justifyContent: 'center' }}>

                            <Button onPress={() => setModal(false)} style={{ padding: 20, marginTop: 30, backgroundColor: config.SECONDARY_COLOR }}><Text style={{ color: 'white',fontFamily: 'AppRegular' }}>Ok</Text></Button>
                        </View>

                    </View>
                </View>
            </Modal>








            <View style={{ width: '100%' }}>
                <Card style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center', backgroundColor: config.ACCENT_COLOR }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon style={{ color: 'white' }} type="Entypo" name="minus" onPress={() => handleCount('minus')} />

                        <H2 style={{ marginRight: 15, marginLeft: 15, color: "white" }}>{count}</H2>
                        <Icon style={{ color: 'white' }} type="Entypo" name="plus" onPress={() => handleCount('add')} />

                    </View>
                    <H2 style={{ color: 'white' }}>{price ? price : "$0.00"}</H2>
                    <Button style={{ backgroundColor: optionsMap && optionAry.length == optionsMap.length ? config.SECONDARY_COLOR : "lightgray" }} onPress={() => addToCartChk()}>
                        <Icon type="FontAwesome" name="edit" />
                        <Text style={{ color: 'white', marginRight: 10,fontFamily: 'AppRegular' }} >Done</Text>
                    </Button>
                </Card>
            </View>
            {tt &&
                <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
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
                                        <Icon type="AntDesign" name="checkcircle" style={{ color: config.PRIMARY_COLOR }} />
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
                                                <H2 style={{ textAlign: 'center', fontWeight: 'bold' ,flexShrink:1 }}>{item.name}</H2>
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
                                            <Icon type="AntDesign" name="checkcircle" style={{ color: config.PRIMARY_COLOR }} />
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
                                                    <H2 style={{ textAlign: 'center', fontWeight: 'bold',flexShrink:1  }}>{item.name}</H2>
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
                                                        <H2 style={{ textAlign: 'center', fontWeight: 'bold',flexShrink:1  }}>{item.name}</H2>
                                                        <Icon type="Entypo" name="plus" />
                                                        {/* <Icon style={{ transform: [{ rotate: this.state.open.includes(this.state.data.item_group.id) ? '180deg' : "0deg" }] }} type="Entypo" name="chevron-thin-down" /> */}
                                                    </View>
                                                </TouchableWithoutFeedback>
                                                <View style={{ borderBottomWidth: .5, borderBottomColor: 'lightgray', flexDirection: 'row', height: expandObj.filter(a => a.groupId == x.id)[0] && expandObj.filter(a => a.groupId == x.id)[0].children.includes(item.id) ? "auto" : 0, opacity: expandObj.filter(a => a.groupId == x.id)[0] && expandObj.filter(a => a.groupId == x.id)[0].children.includes(item.id) ? 1 : 0, justifyContent: 'space-between' }}>
                                                    <View style={{ flexDirection: "row" }}>
                                                    <Icon onPress={() => setModFunction("portion", 0, item.id, x.id, item.included_quantity > 0 ? true : null, null)} style={{ marginTop: 15, color: modObj.filter(a => a.id == item.id)[0] && modObj.filter(a => a.id == item.id)[0].portion == 'first-half' ? "red" : "lightgray", fontSize: 50, transform: [{ rotate: '180deg' }] }} type="MaterialCommunityIcons" name="circle-slice-4" />
                                                        <Icon onPress={() => setModFunction("portion", 1, item.id, x.id, item.included_quantity > 0 ? true : null, null)} style={{ marginTop: 15, color: modObj.filter(a => a.id == item.id)[0] && modObj.filter(a => a.id == item.id)[0].portion == 'whole' ? "red" : "lightgray", fontSize: 50 }} type="MaterialCommunityIcons" name="circle-slice-8" />
                                                        <Icon onPress={() => setModFunction("portion", 2, item.id, x.id, item.included_quantity > 0 ? true : null, null)} style={{ marginTop: 15, color: modObj.filter(a => a.id == item.id)[0] && modObj.filter(a => a.id == item.id)[0].portion == 'second-half' ? "red" : "lightgray", fontSize: 50 }} type="MaterialCommunityIcons" name="circle-slice-4" />
                                                    </View>
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

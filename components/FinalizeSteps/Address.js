import React, { Component, useState, useEffect, useLayoutEffect } from 'react';
import { Text, View, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Button, Card, H1, Icon } from 'native-base'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import config from '../../config.json'
// import TextInputMask from 'react-native-text-input-mask';



export const Address = (props) => {
    const { reset, control, handleSubmit, formState: { errors } } = useForm();
    const [view, setView] = useState(2)
    const [inputRef, setInputRef] = useState([])



    function onSubmit(data) {
        props.setAddress(data)
        props.changeStep("plus")
    }

    function onSubmitNew(data) {
        address(data)
    }

    async function address(data) {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        axios.post(`https://${base_url}/${slug}/user/addresses/create/api`, {
            display_name: data.display_name,
            address: data.address,
            address2: data.address2,
            city: data.city,
            state: data.state,
            zip: data.zip,
            user_id: props.user.id
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
            .then(function (response) {
                getUserInfo(response)
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.getErrors(error.response)
            });
    }

    async function getUserInfo(data) {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/user/history/api`, {
            user_id: data.data.user_id
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
                await AsyncStorage.setItem('@user_data', JSON.stringify(response.data))
                props.setAddress(data.data)
                props.changeStep("plus")
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
                props.getErrors(error.response)
            });
    }

    function pickAddress(address) {
        props.setAddress(address)
        props.changeStep("plus")
    }

    function setRR(i, num) {
        console.log(i)
        let oo = inputRef.filter(a => a.id == num)[0]
        console.log(oo)
        if (!oo && i != null) {
            setInputRef([...inputRef, { "id": num, "rr": i }])

        }

    }

    useLayoutEffect(() => {
        let def = props.user && props.user.addresses.filter(a => a.default)[0]
        if (!props.edit) {
            if (def) {
                props.setAddress(def)
                props.changeStep("plus")
            }
        }
        if (props.serviceType.pos_id != 1) {
            props.changeStep("plus")

        }
        props.user ? setView(1) : setView(2)
        props.user && props.user.addresses.length == 0 && setView(3)
    }, []);

    return (
        <View style={{ padding: 20 }}>
            {view == 1 && // USER WITH ADDRESSES
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 10 }}>
                        <H1 style={{ fontWeight: 'bold' }}>Address</H1>
                    </View>
                    {props.user.addresses &&
                        props.user.addresses.map((item, i) => (
                            <TouchableWithoutFeedback onPress={() => pickAddress(item)} key={i} style={{}}>
                                <Card style={{ padding: 10 }}>
                                    <Text style={{ fontWeight: 'bold',fontFamily: 'AppRegular' }}>{item.display_name}</Text>
                                    <Text style={{fontFamily: 'AppRegular'}}>{item.address}</Text>
                                    <Text style={{fontFamily: 'AppRegular'}}>{item.city} {item.state} {item.zip}</Text>
                                </Card>
                            </TouchableWithoutFeedback>
                        ))
                    }
                    <TouchableWithoutFeedback onPress={() => setView(3)}>
                        <Card style={{ padding: 20, flexDirection: 'row' }}>
                            <Icon style={{}} type="Entypo" name="squared-plus" />
                            <Text style={{fontFamily: 'AppRegular'}}>Add New Address</Text>
                        </Card>
                    </TouchableWithoutFeedback>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT }} onPress={() => props.user ? props.changeStep(null, 0) : props.changeStep()}>
                            <H1 style={{ color: 'white' }}>Back</H1>
                        </Button>
                    </View>
                </View>
            }
            {view == 2 && //NO USER
                <View>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 10 }}>
                            <H1 style={{ fontWeight: 'bold' }}>Address</H1>
                        </View>
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Nick Name'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 2)[0].rr.focus()}
                                    returnKeyType={"next"}
                                />
                            )}
                            name="display_name"
                            defaultValue={props.data ? props.data.display_name : ""}
                        />
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Address'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                                    ref={(i) => setRR(i, 2)}
                                    returnKeyType={"next"}
                                    autoCompleteType={'street-address'}
                                    textContentType={'fullstreeAddress'}

                                />
                            )}
                            name="address"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.address : ""}
                        />
                        {errors.address && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Address 2'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 4)[0].rr.focus()}
                                    ref={(i) => setRR(i, 3)}
                                    returnKeyType={"next"}


                                />
                            )}
                            name="address2"
                            defaultValue={props.data ? props.data.address2 : ""}
                        />
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'City'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 5)[0].rr.focus()}
                                    ref={(i) => setRR(i, 4)}
                                    returnKeyType={"next"}
                                    textContentType={'addressCity'}

                                />
                            )}
                            name="city"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.city : ""}
                        />
                        {errors.city && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'State'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 6)[0].rr.focus()}
                                    ref={(i) => setRR(i, 5)}
                                    returnKeyType={"next"}
                                    textContentType={'addressState'}

                                />
                            )}
                            name="state"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.state : ""}
                        />
                        {errors.state && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Zip'}
                                    maxLength={5}
                                    keyboardType={'number-pad'}
                                    placeholderTextColor={'gray'}
                                    // onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                                    ref={(i) => setRR(i, 6)}
                                    returnKeyType={"done"}
                                    autoCompleteType={'postal-code'}
                                    textContentType={'postalCode'}

                                />
                            )}
                            name="zip"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.zip : ""}
                        />
                        {errors.zip && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                        <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT }} onPress={() => props.changeStep()}>
                            <H1 style={{ color: 'white' }}>Back</H1>
                        </Button>
                        <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT }} onPress={handleSubmit(onSubmit)}>
                            <H1 style={{ color: 'white' }}>Continue</H1>
                        </Button>
                    </View>
                </View>
            }
            {view == 3 &&
                <View>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 10 }}>
                            <H1 style={{ fontWeight: 'bold' }}>New Address</H1>
                        </View>
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Nick Name'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 2)[0].rr.focus()}
                                    returnKeyType={"next"}
                                />
                            )}
                            name="display_name"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.display_name : ""}
                        />
                        {errors.display_name && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Address'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                                    ref={(i) => setRR(i, 2)}
                                    returnKeyType={"next"}
                                    autoCompleteType={'street-address'}
                                    textContentType={'fullStreetAddress'}

                                />
                            )}
                            name="address"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.address : ""}
                        />
                        {errors.address && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Address 2'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 4)[0].rr.focus()}
                                    ref={(i) => setRR(i, 3)}
                                    returnKeyType={"next"}
                                />
                            )}
                            name="address2"
                            defaultValue={props.data ? props.data.address2 : ""}
                        />
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'City'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 5)[0].rr.focus()}
                                    ref={(i) => setRR(i, 4)}
                                    returnKeyType={"next"}
                                    textContentType={'addressCity'}

                                />
                            )}
                            name="city"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.city : ""}
                        />
                        {errors.city && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'State'}
                                    placeholderTextColor={'gray'}
                                    onSubmitEditing={(r) => inputRef.filter(a => a.id == 6)[0].rr.focus()}
                                    ref={(i) => setRR(i, 5)}
                                    returnKeyType={"next"}
                                    textContentType={'addressState'}

                                />
                            )}
                            name="state"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.state : ""}
                        />
                        {errors.state && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    placeholder={'Zip'}
                                    maxLength={5}
                                    keyboardType={'number-pad'}
                                    placeholderTextColor={'gray'}
                                    // onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                                    ref={(i) => setRR(i, 6)}
                                    returnKeyType={"done"}
                                    autoCompleteType={'postal-code'}
                                    textContentType={'postalCode'}

                                />
                            )}
                            name="zip"
                            rules={{ required: true }}
                            defaultValue={props.data ? props.data.zip : ""}
                        />
                        {errors.zip && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                        <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT }} onPress={() => props.changeStep()}>
                            <H1 style={{ color: 'white' }}>Back</H1>
                        </Button>
                        <Button style={{ padding: 20, backgroundColor: config.SECONDARY_ACCENT }} onPress={handleSubmit(onSubmitNew)}>
                            <H1 style={{ color: 'white' }}>Continue</H1>
                        </Button>
                    </View>
                </View>
            }
        </View>
    )
}

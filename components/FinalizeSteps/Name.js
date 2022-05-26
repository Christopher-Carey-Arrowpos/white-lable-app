import React, { Component, useState, useEffect, useLayoutEffect } from 'react';
import { ScrollView, Text, View, TextInput } from 'react-native';
import { Button, H1 } from 'native-base'
import config from '../../config.json'
import { useForm, Controller } from "react-hook-form";
// import TextInputMask from 'react-native-text-input-mask';
import { MaskedTextInput } from "react-native-mask-text";



export const Name = (props) => {
    const { reset, control, handleSubmit, formState: { errors } } = useForm();
    const [inputRef, setInputRef] = useState([])



    function onSubmit(data) {
        props.setName(data)
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
        if (props.user) {
            props.changeStep(null, 2)
        }
    }, []);

    return (
        <View style={{ padding: 20 }}>
            <ScrollView>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 10 }}>
                        <H1 style={{ fontWeight: 'bold' }}>Name</H1>
                    </View>
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                onBlur={onBlur}
                                onChangeText={value => onChange(value)}
                                value={value}
                                placeholder={'First Name'}
                                placeholderTextColor={'gray'}
                                onSubmitEditing={(r) => inputRef.filter(a => a.id == 2)[0].rr.focus()}
                                returnKeyType={"next"}
                                autoCompleteType={'name'}
                                textContentType={'name'}
        
                            />
                        )}
                        name="firstName"
                        rules={{ required: true }}
                        defaultValue={props.data ? props.data.firstName : ""}
                    />
                    {errors.firstName && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={{ borderBottomWidth: 1, color: 'black',minHeight: 50}}
                                onBlur={onBlur}
                                onChangeText={value => onChange(value)}
                                value={value}
                                placeholder={'Last Name'}
                                placeholderTextColor={'gray'}
                                onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                                ref={(i) => setRR(i, 2)}
                                returnKeyType={"next"}

                            />
                        )}
                        name="lastName"
                        rules={{ required: true }}
                        defaultValue={props.data ? props.data.lastName : ""}
                    />
                    {errors.lastName && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={{ borderBottomWidth: 1, color: 'black',minHeight: 50 }}
                                onBlur={onBlur}
                                onChangeText={value => onChange(value)}
                                value={value}
                                placeholder={'Email'}
                                keyboardType={'email-address'}
                                placeholderTextColor={'gray'}
                                onSubmitEditing={(r) => inputRef.filter(a => a.id == 4)[0].rr.focus()}
                                ref={(i) => setRR(i, 3)}
                                returnKeyType={"next"}
                                autoCompleteType={'email'}
                                textContentType={'email'}
        
                            />
                        )}
                        name="email"
                        rules={{ required: true }}
                        defaultValue={props.data ? props.data.email : ""}
                    />
                    {errors.email && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <MaskedTextInput
                                onBlur={onBlur}
                                style={{ borderBottomWidth: 1, flex: .5, color: 'black',minHeight: 50 }}
                                value={value}
                                onChangeText={(formatted, extracted) => onChange(extracted)}
                                placeholder={'Phone'}
                                mask={"(999) 999 9999"}
                                keyboardType={'number-pad'}
                                placeholderTextColor={'gray'}
                                // onSubmitEditing={(r) => inputRef.filter(a => a.id == 3)[0].rr.focus()}
                                ref={(i) => setRR(i, 4)}
                                returnKeyType={"done"}
                                autoCompleteType={'tel'}
                                textContentType={'telephone'}
        
                            />
                        )}
                        name="phone"
                        rules={{ required: true }}
                        defaultValue={props.data ? props.data.phone : ""}
                    />
                    {errors.phone && <Text style={{ color: 'red', fontWeight: 'bold' }}>This is required.</Text>}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                    <Button style={{ padding: 20, backgroundColor: "white",borderWidth:1,borderColor:config.SECONDARY_COLOR, }} onPress={() => props.changeStep()}>
                        <H1 style={{ color: config.SECONDARY_COLOR }}>Back</H1>
                    </Button>
                    <Button style={{ padding: 20, backgroundColor: "white",borderColor:config.SECONDARY_ACCENT,borderWidth:1 }} onPress={handleSubmit(onSubmit)}>
                        <H1 style={{ color: config.SECONDARY_ACCENT }}>Continue</H1>
                    </Button>
                </View>
            </ScrollView>
        </View>
    )
}
import React, { Component, useState, useEffect, useLayoutEffect } from 'react';
import { Text, View, TextInput, Modal, Dimensions, Image } from 'react-native';
import { Icon, Button, Card, H1 } from 'native-base'
import config from '../../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";



export const EnterOffer = (props) => {
    const [user, setUser] = useState()
    const [view, setView] = useState(0)
    const [error, setError] = useState()
    const [code, setCode] = useState()
    const [offerGood, setOfferGood] = useState()


    function refresh() {
        // AsyncStorage.getItem("@user_data")
        //     .then((value) => {
        //         setUser(JSON.parse(value))
        //     })
    }

    async function checkCode() {
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        const token = await AsyncStorage.getItem('@storage_Key')
        axios.post(`https://${base_url}/${slug}/cart/discounts/add/api`, {
            code: code
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


                setOfferGood(true)
                setTimeout(() => {
                    props.exit()
                }, 2000);



            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);

                setError(error.response.data.friendly.description)

            });
    }

    useLayoutEffect(() => {
        // refresh()
    }, []);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.showOffer}
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
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                    paddingTop: 5

                }}>

                    {offerGood ?
                        <View>
                            <H1 style={{ textAlign: 'center', color: config.PRIMARY_COLOR }}>Offer Added!!</H1>
                            <Image
                                source={{ uri: 'https://emoji.discord.st/emojis/14bfac17-f7fa-4b90-bd91-768fd2e83a1b.gif' }}
                                style={{ width: 200, height: 200, marginLeft: 'auto', marginRight: 'auto' }}
                            />

                        </View>
                        :
                        <View style={{ width: Dimensions.get('window').width - 100, }}>
                            <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>

                                <Button
                                    rounded
                                    style={{ borderWidth: 1, borderColor: config.PRIMARY_COLOR, backgroundColor: "white", padding: 10, marginBottom: 20 }}
                                    onPress={() => props.exit()}>
                                    {/* <Icon style={{ color: "red" }} name='close' /> */}

                                    <Text style={{ color: config.PRIMARY_COLOR,fontFamily: 'AppRegular' }}>Close</Text>
                                </Button>
                            </View>
                            {error &&
                                <View style={{ alignItems: 'center', borderBottomWidth: 1 }}>
                                    <Icon style={{ fontSize: 50, color: "red" }} type="MaterialIcons" name="error" />
                                    <Text style={{ textAlign: 'center', color: config.PRIMARY_COLOR, fontWeight: 'bold',fontFamily: 'AppRegular' }}>{error}</Text>
                                </View>
                            }
                            <H1 style={{ textAlign: 'center', color: config.PRIMARY_COLOR }}>Enter Code</H1>
                            <TextInput
                                style={{ borderBottomColor: "lightgray", borderBottomWidth: 1, color: 'black', minHeight: 50 }}
                                selectionColor={'red'}
                                onChangeText={setCode}
                                placeholder="Offer Code"
                                onFocus={() => setError(null)}
                                placeholderTextColor={'gray'}
                                onSubmitEditing={(r) => checkCode()}
                                // ref={(i) => setRR(i, 2)}
                                returnKeyType={"done"}
                            />
                            <Button
                                onPress={checkCode}
                                style={{ backgroundColor: config.SECONDARY_COLOR, padding: 10, marginTop: 20, marginLeft: 'auto', marginRight: 'auto' }}
                            >
                                <H1 style={{ color: 'white' }}>Add Offer</H1>
                            </Button>

                        </View>
                    }




                </View>
            </View>
        </Modal>

    )
}

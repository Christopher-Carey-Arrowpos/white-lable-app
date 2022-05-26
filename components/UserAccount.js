import React, { Component, useState, useEffect, useLayoutEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, FlatList, TouchableOpacity, ImageBackground, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Icon, Button, Card, H1 } from 'native-base'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider} from "react-native-elements";


export const UserAccount = (props) => {
    const [user, setUser] = useState()
    const [view, setView] = useState(0)


    function refresh() {
        AsyncStorage.getItem("@user_data")
            .then((value) => {
                console.log(value)
                setUser(JSON.parse(value))
            })
    }

    useLayoutEffect(() => {
        refresh()
    }, []);

    return (
        <View >
            {view == 0 &&
                <View>
                    {
                        user &&
                        (parseInt(user.user.uses_rewards) === 1) &&
                        <Card style={{ padding: 15, borderRadius: 20 }}>
                            <Icon style={{ fontSize: 40, color:config.PRIMARY_COLOR,textAlign: "center" }} type="FontAwesome" name="star" />
                            <H1 style={{ marginLeft: 'auto', marginRight: 'auto',fontFamily: 'AppHeading' }}>Rewards</H1>
                            <Divider width={1} />
                            <H1 style={{ marginLeft: 'auto', marginRight: 'auto',fontFamily: 'AppBold',marginTop: 5 }}>Points</H1>
                            <Text style={{color: config.PRIMARY_COLOR,fontSize: 35,textAlign: 'center'}}>{user.current_points}</Text>
                            <Divider width={0} />
                            <H1 style={{ marginLeft: 'auto', marginRight: 'auto',fontFamily: 'AppBold',marginTop: 5 }}>Points to Next Reward</H1>
                            <Text style={{color: config.PRIMARY_COLOR,fontSize: 35,textAlign: 'center'}}>{user.points_to_next}</Text>
                        </Card>
                    }
                    <TouchableWithoutFeedback onPress={() => props.navigation.navigate('AccountSettings')}>
                        <Card style={{ padding: 15, borderRadius: 20, flexDirection: 'row',alignItems:'center' }}>
                            <Icon style={{ fontSize: 40, color:config.PRIMARY_COLOR }} type="MaterialIcons" name="account-circle" />
                            <H1 style={{ marginLeft: 'auto', marginRight: 'auto',fontFamily: 'AppHeading' }}>Account</H1>
                            <Icon style={{ fontSize: 40, color:config.PRIMARY_COLOR }} type="MaterialIcons" name="keyboard-arrow-right" />
                        </Card>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => props.navigation.navigate('Address', { "refes": refresh })}>
                        <Card style={{ padding: 15, borderRadius: 20, flexDirection: 'row',alignItems:'center'  }}>
                            <Icon style={{ fontSize: 40, color:config.PRIMARY_COLOR }} type="FontAwesome" name="address-book" />
                            <H1 style={{ marginLeft: 'auto', marginRight: 'auto',fontFamily: 'AppHeading' }}>Addresses</H1>
                            <Icon style={{ fontSize: 40, color:config.PRIMARY_COLOR }} type="MaterialIcons" name="keyboard-arrow-right" />
                        </Card>
                    </TouchableWithoutFeedback>
                    {/* <Card style={{ padding: 15, borderRadius: 20, flexDirection: 'row',alignItems:'center'  }}>
                        <Icon style={{ fontSize: 40, color:config.SECONDARY_ACCENT }} type="Entypo" name="credit-card" />
                        <H1 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Cards</H1>
                        <Icon style={{ fontSize: 40, color:config.SECONDARY_ACCENT }} type="MaterialIcons" name="keyboard-arrow-right" />
                    </Card> */}
                </View>
            }
        </View>
    )
}

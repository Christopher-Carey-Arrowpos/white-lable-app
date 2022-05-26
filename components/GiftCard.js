import React, { Component, useState, useEffect, useLayoutEffect } from 'react';
import {ActivityIndicator, Dimensions, Text, View} from 'react-native';
import { Icon, Button, Card, H1 } from 'native-base'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import {ButtonGroup} from "react-native-elements";



export const GiftCard = (props) => {
    useLayoutEffect(() => {
    }, []);

    const [showBalance, setShowBalance] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <View style={{width: Dimensions.get('window').width,height: Dimensions.get('window').height}}>
            <ButtonGroup
                buttons={['CHECK BALANCE', 'BUY E-GIFT']}
                selectedIndex={selectedIndex}
                onPress={(value) => {
                    setSelectedIndex(value);
                }}
                disabledStyle={{backgroundColor: config.SECONDARY_ACCENT,color: 'white'}}
                selectedButtonStyle={{backgroundColor: config.SECONDARY_COLOR,color: 'white'}}
                containerStyle={{ marginBottom: 20 }}
            />
            {
                selectedIndex === 0 &&
                <WebView
                    source={{ uri: config.GIFT_CARD_BALANCE_URL,justifyContent:'center' }}
                    style={{ width: Dimensions.get('window').width,marginBottom: 175 }}
                    startInLoadingState={true}
                    renderLoading={() => <View style={{height: Dimensions.get('window').height,width: Dimensions.get('window').width}}>
                        <View>
                            <ActivityIndicator color={config.ACCENT_COLOR} size={35} />
                            <Text style={{textAlign: 'center',fontSize: 50,color: config.PRIMARY_COLOR,fontFamily: 'AppHeading'}}>Loading</Text>
                        </View>
                    </View>}
                />
            }
            {
                selectedIndex === 1 &&
                <WebView
                    source={{ uri: config.GIFT_CARD_URL,justifyContent:'center' }}
                    style={{ width: Dimensions.get('window').width,marginBottom: 175 }}
                    startInLoadingState={true}
                    renderLoading={() => <View style={{height: Dimensions.get('window').height,width: Dimensions.get('window').width}}>
                        <View>
                            <ActivityIndicator color={config.ACCENT_COLOR} size={35} />
                            <Text style={{textAlign: 'center',fontSize: 50,color: config.PRIMARY_COLOR,fontFamily: 'AppHeading'}}>Loading</Text>
                        </View>
                    </View>}
                />
            }
        </View>
    )
}

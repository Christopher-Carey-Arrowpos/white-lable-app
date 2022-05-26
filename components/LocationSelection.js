import React, { Component, useState, useEffect } from 'react';
import config from '../config.json'
import { Text, View, Linking } from 'react-native';
import { Icon, H2, Button } from 'native-base'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tooltip } from 'react-native-elements';
// import MapboxGL from "@react-native-mapbox-gl/maps";
import axios from "axios";
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';



export const LocationSelection = (props) => {
    async function startOrder() {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        console.log(`https://${base_url}/${props.route.params.urlslug}/store/service_types/api`)
        axios.get(`https://${base_url}/${props.route.params.urlslug}/store/service_types/api`, {
            headers: {
                'credentials': 'same-origin',
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(async function (response) {
                console.log(response)
                props.route.params.service_types = response.data
                await AsyncStorage.setItem('@store_slug', props.route.params.urlslug)
                await AsyncStorage.setItem('@home_location', JSON.stringify(props.route.params))
                props.getGoods()
                props.navigation.navigate('Home', { screen: 'HomeScreen', params: props.route.params })
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }

    function getGps() {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${parseFloat(props.route.params.latitude)},${parseFloat(props.route.params.longitude)}`;
        const label = 'Custom Label';
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    }

    function toProper(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    useEffect(() => {
    }, [])

    return (
        <View style={{
            flex: 1,
            flexDirection: "column"
        }}>
            <View style={{ flex: .5 }}>


                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: parseFloat(props.route.params.latitude),
                        longitude: parseFloat(props.route.params.longitude),
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,

                    }} >

                    <Marker
                        coordinate={{ latitude: parseFloat(props.route.params.latitude), longitude: parseFloat(props.route.params.longitude) }}
                        tracksViewChanges={false}
                        // coordinate={[parseFloat(item.longitude), parseFloat(item.latitude)]}
                    // onSelected={() => props.navigation.navigate('LocationSelection', item)}
                    >
                        <Icon style={{ color: config.SECONDARY_COLOR, fontSize: 30 }} type="Ionicons" name="pizza" />
                    </Marker>
                </MapView>





                {/* <MapboxGL.MapView style={{ flex: 1 }} >
                    <MapboxGL.PointAnnotation
                        key={"dd"}
                        coordinate={[parseFloat(props.route.params.longitude), parseFloat(props.route.params.latitude)]}
                        id={"dd"}
                    >
                        <Icon style={{ color: config.SECONDARY_COLOR, fontSize: 30 }} type="Ionicons" name="pizza" />
                    </MapboxGL.PointAnnotation>
                    <MapboxGL.Camera
                        zoomLevel={10}
                        animationDuration={500}
                        centerCoordinate={[parseFloat(props.route.params.longitude), parseFloat(props.route.params.latitude)]}
                    />
                </MapboxGL.MapView> */}
                <Button onPress={() => getGps()} style={{ backgroundColor: config.SECONDARY_COLOR, position: 'absolute', bottom: -25, left: 10, borderRadius: 20, height: 50 }}>
                    <Icon style={{ color: "white", fontSize: 30 }} type="FontAwesome5" name="directions" />
                </Button>
            </View>
            <View style={{ marginTop: 20, flex: .25 }}>
                <Text style={{ textAlign: 'center', fontWeight: '700' }}> {toProper(props.route.params.address)}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '700' }}> {toProper(props.route.params.city)}, {props.route.params.state} {props.route.params.zip}</Text>
                {props.route.params[`${moment().format('dddd').toLowerCase()}_display_hours`].match(/Am/gi) ?
                    <Tooltip
                        height={200}
                        width={200}
                        withOverlay={false}
                        skipAndroidStatusBar={true}
                        popover={
                            <View>
                                <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>DAILY HOURS</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <View>
                                        <Text style={{ color: 'white' }}>Mon</Text>
                                        <Text style={{ color: 'white' }}>Tues</Text>
                                        <Text style={{ color: 'white' }}>Wed</Text>
                                        <Text style={{ color: 'white' }}>Thur</Text>
                                        <Text style={{ color: 'white' }}>Fri</Text>
                                        <Text style={{ color: 'white' }}>Sat</Text>
                                        <Text style={{ color: 'white' }}>Sun</Text>
                                    </View>
                                    <View style={{ marginLeft: 15 }} >
                                        <Text style={{ color: 'white' }}>{props.route.params.monday_display_hours}</Text>
                                        <Text style={{ color: 'white' }}>{props.route.params.tuesday_display_hours}</Text>
                                        <Text style={{ color: 'white' }}>{props.route.params.wednesday_display_hours}</Text>
                                        <Text style={{ color: 'white' }}>{props.route.params.thursday_display_hours}</Text>
                                        <Text style={{ color: 'white' }}>{props.route.params.friday_display_hours}</Text>
                                        <Text style={{ color: 'white' }}>{props.route.params.saturday_display_hours}</Text>
                                        <Text style={{ color: 'white' }}>{props.route.params.sunday_display_hours}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                                    <Icon style={{ color: "white", fontSize: 30 }} type="MaterialCommunityIcons" name="truck-fast" />
                                    <Text style={{ color: 'white' }}>Delivery</Text>
                                    <Icon style={{ color: "white", fontSize: 30 }} type="Ionicons" name="car" />
                                    <Text style={{ color: 'white' }}>Curbside</Text>
                                </View>
                            </View>
                        }>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <Text style={{ textAlign: 'center', marginTop: 15 }}>Open {props.route.params[`${moment().format('dddd').toLowerCase()}_display_hours`]}</Text>
                            <Icon style={{ color: "orange", marginTop: 10, marginLeft: 15 }} type="Entypo" name="info-with-circle" />
                        </View>
                    </Tooltip>
                    :
                    <Text style={{ textAlign: 'center', marginTop: 15 }}>Hours Not Available</Text>
                }
                <Text style={{ textAlign: 'center', fontWeight: '700' }}>{ }</Text>
                <H2 onPress={() => props.navigation.goBack()} style={{ color: config.SECONDARY_COLOR, textAlign: 'center' }}>CHANGE STORE</H2>
            </View>
            <View style={{ flex: .25 }}>
                <Button
                    onPress={() => startOrder()}
                    style={{ backgroundColor: config.SECONDARY_COLOR, width: '90%', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center', marginTop: 30 }}>
                    <H2 style={{ color: 'white' }}>START ORDER</H2>
                </Button>
            </View>
        </View>
    )
}
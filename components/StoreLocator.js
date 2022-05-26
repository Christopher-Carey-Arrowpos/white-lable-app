import React, { Component, useState, useEffect } from 'react';
import { ScrollView, Text, View, KeyboardAvoidingView, TextInput, Image, FlatList } from 'react-native';
import { Icon, Card, Button } from 'native-base'
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment'
import axios from "axios";
import { Keyboard } from 'react-native'
// import DeviceInfo from 'react-native-device-info';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

const haversine = require('haversine');

async function get_coords() {
    return await AsyncStorage.getItem('@cords');
}



export const StoreLocator = (props) => {
    const [zipcode, setZipCode] = useState()
    const [locations, setLocations] = useState()
    const [locationsyy, setLocationsyy] = useState()
    const [map, mapSet] = useState()
    const [error, setError] = useState()
    const [manufacturer, setManufacturer] = useState()
    const [region, regionSet] = useState();
    const [zipLat, setZipLat] = useState(false);
    const [zipLong, setZipLong] = useState(false);


    function toProper(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    async function getZipBounds(close) {
        setLocationsyy(null)

        // if (zipcode.length != 5) {
        //     setError(true)
        //     return
        // }
        axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${zipcode} USA.json?access_token=${config.MAP_BOX}`)
            .then(async function (response) {
                console.log("+++++++++++++++++")
                console.log(response.data.features[0])
                if (close) {
                    Keyboard.dismiss()
                }
                // console.log(response.data.features[0].center[0])
                // console.log(response.data.features[0].center[1])

                setZipLat(response.data.features[0].center[1]);
                setZipLong(response.data.features[0].center[0]);




                const camera = await map.getCamera();
                camera.center.latitude = response.data.features[0].center[1];
                camera.center.longitude = response.data.features[0].center[0];
                map.animateCamera(camera, { duration: 1000 });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    async function checkLatLong(longLat, lsLocations) {
        //ne: [-79.45411, 41.50509],
        //sw: [-87.4238188, 38.19334],
        //[Long,Lat]
        let ii = [];
        let coords = await AsyncStorage.getItem('@cords');
        coords = JSON.parse(coords);
        let start = {
            latitude: zipLat ? zipLat : coords.lat,
            longitude: zipLong ? zipLong : coords.long
        };
        // let distances = [];
        lsLocations.map((item) => {
            if (item.latitude > longLat[1]) { //south
                if (item.latitude < longLat[3]) {
                    if (item.longitude > longLat[0]) {
                        if (item.longitude < longLat[2]) {
                            let end = {
                                latitude: item.latitude,
                                longitude: item.longitude
                            }
                            item.distance = haversine(start, end, {unit: 'mile'});
                            // distances.push(item.distance);
                            ii.push(item)
                        }
                    }
                }
            }
        })


        ii = ii.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

        setLocationsyy(ii);
    }

    async function getBoundingBox(region, lsLocations) {

        let new_region = [
            region.longitude - .65, // westLng - min lng
            region.latitude - .65, // southLat - min lat
            region.longitude + .65, // eastLng - max lng
            region.latitude + .65 // northLat - max lat
        ]
        console.log(new_region)
        checkLatLong(new_region, lsLocations)
    }

    function setZipCodeFun(r) {
        // if (r.length <= 5) {
        //     setZipCode(r)
        // }
        setZipCode(r)
    }

    async function doStuf() {
        //STRIP NULL LOCATIONS
        let dd = JSON.parse(await AsyncStorage.getItem('@cords'))
        const lsLocations = JSON.parse(await AsyncStorage.getItem('@locations'))
        lsLocations.map((item, i) => {
            if (item.latitude == null) {
                lsLocations.splice(i, 1)
            }
            if (item.longitude == null) {
                lsLocations.splice(i, 1)
            }
        })
        //
        //SET USER LOCATION
        if (dd != 1) {
            regionSet({
                latitude: dd.lat,
                longitude: dd.long,
                latitudeDelta: 0.65,
                longitudeDelta: 0.65,
            })

        }
        //



        // else {
        //     let minLat = parseFloat(lsLocations[0].latitude)
        //     let maxLat = parseFloat(lsLocations[0].latitude)
        //     let minLog = parseFloat(lsLocations[0].longitude)
        //     let maxLog = parseFloat(lsLocations[0].longitude)
        //     lsLocations.map(item => {
        //         if (parseFloat(item.latitude) < minLat) {
        //             minLat = parseFloat(item.latitude)
        //         }
        //         if (parseFloat(item.latitude) > maxLat) {
        //             maxLat = parseFloat(item.latitude)
        //         }
        //         if (parseFloat(item.longitude) < minLog) {
        //             minLog = parseFloat(item.longitude)
        //         }
        //         if (parseFloat(item.longitude) > maxLog) {
        //             maxLog = parseFloat(item.longitude)
        //         }
        //     })
        //     // setgg()
        //     setBounds({
        //         ne: [maxLog, maxLat],
        //         sw: [minLog, minLat],
        //         paddingLeft: 30,
        //         paddingRight: 30,
        //         paddingTop: 30,
        //         paddingBottom: 30
        //     })
        // }
        setLocations(lsLocations)
        getBoundingBox({
            latitude: dd.lat,
            longitude: dd.long,
            latitudeDelta: 0.65,
            longitudeDelta: 0.65,
        }, lsLocations)
    }

    function onRegionChange(region) {
        console.log(region)
    }

    useEffect(async () => {
        doStuf()

        // DeviceInfo.getManufacturer().then((manufacturer) => {
        //     manufacturer == "Apple" && setManufacturer(manufacturer)
        //     manufacturer == "apple" && setManufacturer(manufacturer)

        // });
    }, [])

    return (
        <KeyboardAvoidingView style={{
            flex: 1,
            flexDirection: "column",
            backgroundColor: 'lightgray'
        }}>
            <View style={{
                flex: 1,
                flexDirection: "column",
                backgroundColor: 'lightgray',
            }}>

                {region &&
                    <MapView
                        ref={(c) => (mapSet(c))}
                        onRegionChangeComplete={(e) => getBoundingBox({
                            latitude: e.latitude,
                            longitude: e.longitude,
                            latitudeDelta: .65,
                            longitudeDelta: .65
                        }, locations)}
                        style={{
                            flex: .70,
                        }}
                        initialRegion={region}
                    >
                        {locations &&
                            locations.map((item, i) => (
                                <Marker
                                    key={i}
                                    coordinate={{ latitude: parseFloat(item.latitude), longitude: parseFloat(item.longitude) }}
                                    tracksViewChanges={false}
                                    id={`i-${i}`}
                                >
                                    <Icon style={{ color: config.SECONDARY_COLOR, fontSize: 30 }} type="Ionicons" name="pizza" />
                                </Marker>
                            ))
                        }
                    </MapView>
                }
                <View style={{ flexDirection: 'row', paddingLeft: 10, paddingRight: 10 }}>
                    <TextInput
                        style={{ borderBottomColor: "black", borderBottomWidth: 1, width: "50%", marginLeft: 20,marginRight: 'auto', color: 'black', padding: manufacturer ? 0 : 10, minHeight: 50 }}
                        selectionColor={'red'}
                        onChangeText={(r) => setZipCodeFun(r)}
                        value={zipcode}
                        placeholder="City, State, or Zip"
                        // keyboardType="number-pad"
                        onSubmitEditing={(r) => getZipBounds()}
                        // autoCompleteType={'postal-code'}
                        // textContentType={'postalCode'}
                        // maxLength={5}
                        onFocus={() => setError(false)}
                        placeholderTextColor={'gray'}
                    />
                    {/*<Icon onPress={() => getZipBounds(true)} style={{ color: config.PRIMARY_COLOR, fontSize: 30, position: "absolute", right: 65, top: 10 }} type="Ionicons" name="search" />*/}
                    {/*<Button className={"btn"} onPress={() => getZipBounds(true)} style={{ color: config.PRIMARY_COLOR, fontSize: 30, position: "absolute", right: 65, top: 10 }}>*/}
                    {/*    <Text>Find</Text>*/}
                    {/*</Button>*/}
                    <Button
                        onPress={() => getZipBounds(true)}
                        style={{ backgroundColor: config.SECONDARY_COLOR, padding: 10, margin: 10 }}>
                        <Text style={{ color: 'white', fontSize: 15 }}>Find</Text>
                        <Icon style={{ color: 'white', }} type="Ionicons" name="search" />
                    </Button>
                    {error &&
                        <Text style={{ textAlign: 'center', color: 'red', position: 'absolute', right: 100, top: 25 }}>Invalid input.</Text>
                    }
                </View>
                { locationsyy &&
                    locationsyy.length > 0 ?
                    <FlatList
                        style={{ flex: .25 }}
                        initialNumToRender={50}
                        data={locationsyy}
                        renderItem={({ item }) =>
                            <Card style={{ flexDirection: 'row', padding: 8 }}>
                                <View style={{ flex: .5 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{item.address && toProper(item.address)}</Text>
                                    <Text style={{ fontSize: 16 }}>{item.city && toProper(item.city)}, {item.state && item.state} {item.zip && item.zip} </Text>
                                    <Text style={{ fontSize: 13 }}>{item.distance.toFixed(2)}M away</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                        <Icon style={{ color: config.SECONDARY_COLOR, fontSize: 30 }} type="MaterialCommunityIcons" name="car" />
                                        <Text>Delivery</Text>
                                        <Icon style={{ color: item.has_curbside == 0 ? "rgba(0, 0, 0, 0)" : config.SECONDARY_COLOR, fontSize: 30 }} type="Ionicons" name="car" />
                                        <Text style={{ color: item.has_curbside == 0 && "rgba(0, 0, 0, 0)" }}>Curbside</Text>
                                    </View>
                                </View>
                                <View style={{ flex: .5 }}>
                                    <View style={{ marginRight: 'auto', marginLeft: 'auto' }}>
                                        <Text style={{ fontWeight: 'bold' }}>Todays Hours</Text>
                                        {item[`${moment().format('dddd').toLowerCase()}_display_hours`].match(/Am/gi) ?
                                            <Text style={{}}>{item[`${moment().format('dddd').toLowerCase()}_display_hours`]}</Text>
                                            :
                                            <Text style={{}}>Hours Not Available</Text>
                                        }
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
                                        <Button
                                            onPress={() => props.navigation.navigate('LocationSelection', item)}
                                            style={{ backgroundColor: config.SECONDARY_COLOR, padding: 10, marginTop: 10 }}>
                                            <Text style={{ color: 'white', width: 100, textAlign: "center", fontSize: 20 }}>Order Now</Text>
                                        </Button>
                                    </View>
                                </View>
                            </Card>
                        }
                        keyExtractor={item => item.id}
                    />
                    :
                    <View style={{ justifyContent: 'center' }}>
                        <Image
                            source={{ uri: 'https://64.media.tumblr.com/6854ae546fc61a0f2fefb8244a8340aa/tumblr_nmygzzqVs11qbmm1co1_250.gif' }}
                            style={{ width: 200, height: 200, marginLeft: 'auto', marginRight: 'auto' }}
                        />
                        <Text style={{ textAlign: 'center' }}>No Locations</Text>
                    </View>
                }
            </View>
        </KeyboardAvoidingView>
    )
}

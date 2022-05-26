import React, { Component, useState, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Spinner from 'react-native-spinkit';
import config from '../config.json'

import { Flow } from 'react-native-animated-spinkit'



export const CategoryList = (props) => {
    const [categories, setCategories] = useState();
    const [catColor, setCatColor] = useState(0);
    const [data, setData] = useState();


    function getCategoryItems(id, i) {
        let cat = categories.filter(a => a.id == id)[0]
        setData(cat)
        setCatColor(null)
        setCatColor(i)
        props.navigation.navigate('CategoryItemList', cat)
    }

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async () => {
            setCategories(JSON.parse(await AsyncStorage.getItem('@categories')))
            var refreshIntervalId = setInterval(async () => {
                if (JSON.parse(await AsyncStorage.getItem('@categories')) != null) {
                    clearInterval(refreshIntervalId);
                    setCategories(JSON.parse(await AsyncStorage.getItem('@categories')))
                }
            }, 300);
        });
        return unsubscribe;
    }, [])

    return (
        <View style={{
            flex: 1,
            flexDirection: "column",
            backgroundColor: 'lightgray'
        }}>
            {categories ?
                <FlatList
                    numColumns={1}
                    data={categories}
                    initialNumToRender={4}
                    renderItem={({ item, index }) =>
                        <View style={{
                            width: Dimensions.get('window').width,
                            justifyContent: 'center',
                            borderRadius: 3,
                            padding: 5,
                            backgroundColor: catColor == index ? '#ddf7da' : '#EEF2FB',
                        }}>
                            <TouchableOpacity onPress={() => getCategoryItems(item.id, index)}>
                                <View style={{}}>
                                    <Image source={{ uri: item.imageURL != "" ? item.imageURL : 'https://lanecdr.org/wp-content/uploads/2019/08/placeholder.png' }} style={{ height: 250,flex: 1 }} />
                                    <Text style={{ textAlign: 'center', marginBottom: 10,fontFamily: 'AppBold',fontSize: 25 }}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                    keyExtractor={item => item.id}
                />
                :
                // <Spinner style={{ marginLeft: 'auto', marginRight: 'auto' }} isVisible={true} size={200} type={"ThreeBounce"} color={config.PRIMARY_COLOR} />
                <Flow color={config.PRIMARY_COLOR} size={200} style={{ marginLeft: 'auto', marginRight: 'auto' }}></Flow>

            }
        </View>
    )
}

import React, { Component, useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import CategoryItemCard from './CategoryItemCard'
import { FAB } from 'react-native-elements';
import config from '../config.json'




export const CategoryItemList = (props) => {

    useEffect(async () => {
    }, [])

    return (
        <View style={{
            flex: 1,
            flexDirection: "column",
            backgroundColor: 'lightgray'

        }} >
            {/* <FAB onPress={() => props.navigation.navigate('Menu')} title="Main Menu" placement='right' size="small" color={config.SECONDARY_ACCENT} style={{ zIndex: 10 }} /> */}

            <FlatList
                numColumns={1}
                data={props.route.params.item_navigations}
                initialNumToRender={4}
                renderItem={({ item, index }) =>
                    <CategoryItemCard
                        item={item}
                        index={index}
                        data={props}
                    // cardUpdate={this.props.cardUpdate}
                    // options={this.getItemInfo}
                    // branding={this.props.branding}
                    />
                }
                keyExtractor={item => item.id}
            />
        </View>
    )
}

import React, { Component } from 'react';
import axios from "axios";
import { Text, Card, CardItem } from 'native-base';
import { Image, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CategoryItemCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 1
        };
        //Binds
        this.refresh = this.refresh.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.handleCount = this.handleCount.bind(this);
        this.setMod = this.setMod.bind(this);
    }


    //Api Calls
    async addToCart(item, i) {
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')

        let _this = this;
        axios.post(`https://${base_url}/${slug}/cart/add/api`,
            {
                menu_id: item.menu_id,
                quantity: _this.state.count,
                modifiers: _this.state.main_mod,
                addOns: [],
                itemNavigation: item.id,
                comment: "",
                category_id: this.props.data.id
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
                _this.props.cardUpdate()
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }

    handleCount(type) {
        if (type == "add") {
            this.setState({
                count: this.state.count + 1
            })
        } else {
            if (this.state.count > 1) {
                this.setState({
                    count: this.state.count - 1
                })
            }
        }
    }

    setMod(id, group_id) {
        let obj = this.state.main_mod
        let tt = obj.filter(a => a.type == group_id)[0]
        if (tt) {
            tt.id = id
        } else {
            obj.push({
                type: group_id,
                id: id,
                quantity: 1,
                portion: 'whole',
                size: 'normal',
            })
        }
        this.setState({
            main_mod: obj
        })
    }

    //Methods
    async getOptions(item) {
        this.setState({
            big_option: null
        })
        const token = await AsyncStorage.getItem('@storage_Key')
        const base_url = await AsyncStorage.getItem('@base_url')
        const slug = await AsyncStorage.getItem('@store_slug')
        let _this = this

        axios.get(`https://${base_url}/${slug}/menu/categories/${this.props.data.route.params.id}/items/${this.props.item.id}/api`,
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
                _this.setState({
                    big_option: response.data.item
                })
            })
            .catch(function (error) {
                console.log(error);
                console.log(error.response);
            });
    }

    // getPrice() {
    //     let price;
    //     if (this.state.big_option) {
    //         price = this.state.big_option.item_group.items[0].price
    //     }
    //     // ${this.state.big_option && this.state.big_option.item_group.items[0].price} {this.state.big_option && this.state.big_option.item_group.items.length > 1 && "- $" + this.state.big_option.item_group.items[this.state.big_option.item_group.items.length - 1].price}
    //     return (price)
    // }

    getItemInfo(id) {
        let item = this.props.data.route.params.item_navigations.filter(a => a.id == id)[0]
        this.props.data.navigation.navigate('ItemComp',{"item":item,"cat":this.props.data.route.params.id,"name":item.name})
        this.setState({
          item: item,
          modal: true
        })
      }

    //Mount-Update-Refresh
    refresh() {
        this.getOptions()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.item !== this.props.item) {
            this.refresh();
        }
    }

    componentDidMount() {
        this.refresh();
    }

    render() {
        return (
            this.state.big_option ?
                <Card key={this.props.index} style={{width:Dimensions.get('window').width, padding: 5}}>
                    <CardItem cardBody>
                        <TouchableWithoutFeedback onPress={() => this.getItemInfo(this.props.item.id)}>
                            <Image source={{ uri: this.props.item.imageURL }} style={{ height: 250, width: null, flex: 1 }} />
                        </TouchableWithoutFeedback>
                    </CardItem>
                    <CardItem style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
                        <Text style={{ fontWeight: "bold",fontSize:25, fontFamily: 'AppBold' }}>{this.props.item.name}</Text>
                        {/* <Text style={{ color: 'gray' }}>{this.getPrice()} </Text> */}
                        {/* <Text style={{ color: 'gray' }}>${this.state.big_option && this.state.big_option.item_group.items[0].price} {this.state.big_option && this.state.big_option.item_group.items.length > 1 && "- $" + this.state.big_option.item_group.items[this.state.big_option.item_group.items.length - 1].price} </Text> */}
                    </CardItem>
                </Card>
                :
                null
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        // flex:1,
        width: "100%",
        height: 200,
    },
    card: {
        flex: 1,
    },
    card1: {
        backgroundColor: '#FE474C',
    },
    card2: {
        backgroundColor: '#FEB12C',
    },
    label: {
        lineHeight: 470,
        textAlign: 'center',
        fontSize: 55,
        fontFamily: 'System',
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
});

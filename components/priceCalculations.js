let choices;
let storeExtraAdjustmentRate = 2
let responsee;
export default class PriceCalculator {
    /*
     * Dispatches subsequent price calculations based on passed state
     * @returns {Number} Price in number form, unformatted
     */
    static calculateSubtotal(quantity, response, choicess,itemgroup) {
        // console.log("calculateSubtotal")
        // console.log(response)
        // console.log(itemgroup)
        // console.log(choicess.choices)
        responsee = response
        choices = choicess.choices
        // Get an object representing the base item
        let baseItem = response.item_group.items[choices.item];
        // if(itemgroup){
        //     baseItem = response.item_group.items.filter(a => a.id == itemgroup)[0]
        // }else{
        //     baseItem = response.item_group.items[choices.item];
        // }
        // console.log(choices.choices.item)
        // console.log(baseItem)
        // console.log(choices.modifiers)
        choices.modifiers = choices.modifiers.filter(a => a.included != true)
        choices.modifiers = choices.modifiers.filter(a => a.option != true)

        // Gather all chosen modifiers
        const modifiersToCalculate = {};
        // First loop through all non-included modifiers
        for (const modKey in choices.modifiers) {
            // console.log(modKey)
            if (choices.modifiers.hasOwnProperty(modKey)) {
                const modifier = choices.modifiers[modKey];
                //Push every regular modifier to the modifiersToCalculate group
                modifiersToCalculate[modKey] = modifier;
            }
        }
        /*
         * Now loop through all included modifiers, adding the modifiers where quantity has been increase
         */
        var includedModifiersToCalculate = {};
        for (const includedKey in choices.includedModifiers) {
            if (choices.includedModifiers.hasOwnProperty(includedKey)) {
                let baseQuantity = 0;
                const includedModifierChoice = choices.includedModifiers[includedKey];
                let originalIncludedModifier = choices.includedModifiers[includedKey];
                // If they selected extra increase baseQuantity
                if (includedModifierChoice.size === 'extra') {
                    baseQuantity++;
                }
                // Now check to see if the quantity has been increased
                if (includedModifierChoice.quantity > originalIncludedModifier.quantity) {
                    // We now know it has been increased, so we get the absolute value of the difference
                    let diff = Math.abs(includedModifierChoice.quantity - originalIncludedModifier.quantity);
                    baseQuantity = baseQuantity + diff;
                }

                //Now perform a check to see if we need to add this to our calculatable mods
                if (baseQuantity > 0) {
                    // First reset the quantity provided to our calculated quantity offset
                    includedModifierChoice.quantity = baseQuantity;
                    includedModifiersToCalculate[includedKey] = includedModifierChoice;
                }
            }
        }
        // console.log(includedModifiersToCalculate)
        //Determine pricing strategy
        const useMatrix = baseItem.is_matrix;
        let price;
        if (useMatrix == 1) {
            price = this.calculatePriceForMatrixPricing(baseItem, modifiersToCalculate, includedModifiersToCalculate) * quantity;
        } else {
            price = this.calculatePriceForPriceLevels(baseItem, modifiersToCalculate, includedModifiersToCalculate) * quantity;
        }
        // Now finally let's add the addOns
        // let addOnChoices = choices.addOns;
        // price = price + this.calculatePriceForAddons(addOnChoices);
        // console.log("PRICE")
        return price;
    }

    /*
     * @param {number} priceLevel Price Level of base item in calculation
     * @param {number} modifier ID of modifier to perform lookup on
     * @returns {number} Cost of the inputted modifier for the base Item's price level
     * Looks up modifier price for price level, accounting for portion adjustments
     */
    static getModifierPriceForPriceLevel(priceLevel, modifier) {
        console.log("getModifierPriceForPriceLevel")

        const chosenSize = choices.modifiers[modifier].size;
        const chosenPortion = choices.modifiers[modifier].portion;
        // console.log(priceLevel)
        // console.log(chosenSize)
        // console.log(chosenPortion)

        let priceAdjustment = 1;
        storeExtraAdjustmentRate = storeExtraAdjustmentRate

        let finalPrice = 0;
        if (chosenPortion === 'first-half' || chosenPortion === 'second-half') {
            // console.log("1")
            priceAdjustment = priceAdjustment / 2;

        }

        if (chosenSize === 'extra') {
            // console.log("2")

            priceAdjustment = priceAdjustment * storeExtraAdjustmentRate;
        }

        if (choices.modifiers[modifier].quantity > 0) {
            // console.log("3")
            // console.log(modifier)
            // console.log(priceAdjustment)
            // console.log(choices.modifiers[modifier])
            // console.log(responsee)
            let ii = responsee.modification_groups.filter(a => a.id == choices.modifiers[modifier].groupId)[0].modifications.filter(a => a.id == choices.modifiers[modifier].id)[0]
            finalPrice =parseFloat(JSON.parse(ii.level_price)[priceAdjustment]) 
            // console.log(finalPrice)
            


            //NOTE finalPrice =[modifier].priceLevels[priceLevel] * priceAdjustment * choices.modifiers[modifier].quantity;
        }

        if (!isNaN(finalPrice)) {
            // console.log("4")

            //Should catch NaNs as well
            // console.log(finalPrice)
            // console.log(finalPrice)


            return finalPrice
        } else {
            // console.log(`ERROR! Price level: ${priceLevel} - modifier: ${modifier} returned price`);
            // console.log(finalPrice);
            // console.log('Modifiers object: ');
            // console.log(modifiers[modifier]);
            return 0;
        }
    }

    /**
     * 
     * @param {Object} baseItem Object representing base item
     * @param {Array} modifiers Array of modifiers to call getModifierPriceForPriceLevel on
     * @returns {Number} Price for item
     */
    static calculatePriceForPriceLevels(baseItem, modifiers) {
        // console.log("calculatePriceForPriceLevels")
        const priceLevel = baseItem.menu_level;
        let totalPrice = baseItem.price;
        for (const key in modifiers) {
            if (modifiers.hasOwnProperty(key)) {
                const addedPrice = this.getModifierPriceForPriceLevel(priceLevel, key);
                totalPrice = totalPrice + addedPrice;
            }
        }
        // console.log(totalPrice)
        return totalPrice;
    }
    /*
     * @param {Object} baseItem Object representing the base item
     * @param {Array} modifiers Array of modifiers to call price Calculation funcitons on 
     */
    static calculatePriceForMatrixPricing(baseItem, modifiers, includedModifiers) {
        // console.log("calculatePriceForMatrixPricing")
        const itemMatrix = JSON.parse(baseItem.matrix_price);
        // console.log(JSON.parse(baseItem.matrix_price))

        let totalMatrixWeight = 0;
        let priceFromLeveledModifiers = 0;
        for (const key in modifiers) {
            if (modifiers.hasOwnProperty(key)) {
                const matrixForMod = this.getTotalMatrixWeightForChosenModifier(key);
                if (matrixForMod === 0 && modifiers[key].quantity > 0) {
                    //If this item is a matrix weight of 0, instead use price level strategy
                    let priceForPriceLevel = this.getModifierPriceForPriceLevel(baseItem.menu_level, key);
                    priceFromLeveledModifiers = priceFromLeveledModifiers + priceForPriceLevel;
                }
                totalMatrixWeight = totalMatrixWeight + matrixForMod;
            }
        }
        // Now loop through included
        for (const key in includedModifiers) {
            if (includedModifiers.hasOwnProperty(key)) {
                const matrixForMod = this.getTotalMatrixWeightForChosenIncluded(key);
                if (matrixForMod === 0 && includedModifiers[key].quantity > 0) {
                    //If this item is a matrix weight of 0, instead use price level strategy
                    let priceForPriceLevel = this.getModifierPriceForPriceLevel(baseItem.menu_level, key);
                    priceFromLeveledModifiers = priceFromLeveledModifiers + priceForPriceLevel;
                }
                totalMatrixWeight = totalMatrixWeight + matrixForMod;
            }
        }
        /*
         * TODO: Make this extensible to any number of matrix weights
         */
        if (totalMatrixWeight > 10) {
            totalMatrixWeight = 10;
        }
        totalMatrixWeight = totalMatrixWeight.toFixed(2);
        // console.log("totalMatrixWeight")
        // console.log(totalMatrixWeight)
        let priceForMatrix = parseFloat(itemMatrix[totalMatrixWeight]);
        let item_level = JSON.parse(responsee.level_price)
        // console.log(priceForMatrix)
        // console.log(item_level[baseItem.menu_level] )
        //NOTE priceForMatrix + parseFloat(item_level[baseItem.menu_level]  => adding price level to matrix price
        return priceForMatrix + parseFloat(item_level[baseItem.menu_level] ) 
        // return priceForMatrix + priceFromLeveledModifiers;
    }

    /*
     * @param {Number} modifier ID of modifier to perform calculation on
     * @returns {Number} Total matrix weight of modifier
     * Applies size and portion adjustments to determine actual weight adjustment
     */
    static getTotalMatrixWeightForChosenModifier(modifier) {
        // console.log("getTotalMatrixWeightForChosenModifier")

        const chosenQuantity = choices.modifiers[modifier].quantity;
        const chosenSize = choices.modifiers[modifier].size;
        const chosenPortion = choices.modifiers[modifier].portion;
        let weightAdjustment = 1;
        let storeExtraAdjustmentRater = storeExtraAdjustmentRate
        if (chosenPortion === 'first-half' || chosenPortion === 'second-half') {
            weightAdjustment = weightAdjustment / 2;
        }
        if (chosenSize === 'extra') {
            weightAdjustment = weightAdjustment * storeExtraAdjustmentRater;
        }
        // console.log(weightAdjustment)
        const sourceMatrixWeight = choices.modifiers[modifier].matrixWeight;
        // console.log(weightAdjustment * chosenQuantity)
        return weightAdjustment * chosenQuantity;
        //FIXME return sourceMatrixWeight * weightAdjustment * chosenQuantity;
    }

    static getTotalMatrixWeightForChosenIncluded(modifier) {
        // console.log("getTotalMatrixWeightForChosenIncluded")
        const chosenQuantity = choices.includedModifiers[modifier].quantity;
        const chosenSize = choices.includedModifiers[modifier].size;
        const chosenPortion = choices.includedModifiers[modifier].portion;
        let weightAdjustment = 1;
        storeExtraAdjustmentRate = storeExtraAdjustmentRate
        if (chosenPortion === 'first-half' || chosenPortion === 'second-half') {
            weightAdjustment = weightAdjustment / 2;
        }
        if (chosenSize === 'extra') {
            weightAdjustment = weightAdjustment * storeExtraAdjustmentRate;
        }
        // const sourceMatrixWeight = choices.modifiers[modifier].matrixWeight;

        // const sourceMatrixWeight = modifiers[modifier].matrixWeight;
        return weightAdjustment * chosenQuantity;
        //FIXME return sourceMatrixWeight * weightAdjustment * chosenQuantity;
    }

    static calculatePriceForAddons(addonChoices) {
        // console.log("calculatePriceForAddons")
        let cost = 0;
        for (const key in addonChoices) {
            if (addonChoices.hasOwnProperty(key)) {
                const choice = addonChoices[key];
                let addOnCost = choice.price * choice.quantity;
                cost = cost + addOnCost;
            }
        }
        // Get a string representation of the rounded amount
        let fixedCost = cost.toFixed(2);
        // recast it to a number 
        let finalCost = parseFloat(fixedCost);
        return finalCost;
    }

    static calculateSubtotalWithoutAddons() {
        // console.log("calculateSubtotalWithoutAddons")
        if (loading) {
            return 0;
        }
        // Get an object representing the base item
        const baseItem = itemGroup.items[choices.item];

        // Gather all chosen modifiers
        const modifiersToCalculate = {};
        // First loop through all non-included modifiers
        for (const modKey in choices.modifiers) {
            if (choices.modifiers.hasOwnProperty(modKey)) {
                const modifier = choices.modifiers[modKey];
                //Push every regular modifier to the modifiersToCalculate group
                modifiersToCalculate[modKey] = modifier;
            }
        }
        /**
         * Now loop through all included modifiers, adding the modifiers where quantity has been increase
         */
        var includedModifiersToCalculate = {};
        for (const includedKey in choices.includedModifiers) {
            if (choices.includedModifiers.hasOwnProperty(includedKey)) {
                let baseQuantity = 0;
                const includedModifierChoice = choices.includedModifiers[includedKey];
                let originalIncludedModifier = includedModifiers[includedKey];
                // If they selected extra increase baseQuantity
                if (includedModifierChoice.size === 'extra') {
                    baseQuantity++;
                }
                // Now check to see if the quantity has been increased
                if (includedModifierChoice.quantity > originalIncludedModifier.quantity) {
                    // We now know it has been increased, so we get the absolute value of the difference
                    let diff = Math.abs(includedModifierChoice.quantity - originalIncludedModifier.quantity);
                    baseQuantity = baseQuantity + diff;
                }

                //Now perform a check to see if we need to add this to our calculatable mods
                if (baseQuantity > 0) {
                    // First reset the quantity provided to our calculated quantity offset
                    includedModifierChoice.quantity = baseQuantity;
                    includedModifiersToCalculate[includedKey] = includedModifierChoice;
                }
            }
        }
        //Determine pricing strategy
        const useMatrix = baseItem.usesMatrixPricing;
        let price;
        if (useMatrix) {
            price = this.calculatePriceForMatrixPricing(baseItem, modifiersToCalculate, includedModifiersToCalculate) * quantity;
        } else {
            price = this.calculatePriceForPriceLevels(baseItem, modifiersToCalculate, includedModifiersToCalculate) * quantity;
        }
        return price;
    }
}
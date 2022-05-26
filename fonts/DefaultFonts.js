import * as Font from 'expo-font';

async function DefaultFonts() {
    //this use of generic names let's us customize the the app font without changing it in every place.
    //do not commit this file, or change App-{style} if you wish to customize fonts change the require.
    return await Font.loadAsync({
        AppEditItem: require('./branded fonts/AvenirLTStd-Roman.otf'),
        AppBold: require('./default fonts/Montserrat-SemiBold.otf'),
        AppRegular: require('./branded fonts/Brandon_reg.otf'),
        AppHeading: require('./branded fonts/TrendSansFour.otf'),
    });
}

export default DefaultFonts;

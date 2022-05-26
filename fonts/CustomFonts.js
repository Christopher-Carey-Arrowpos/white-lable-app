import {useFonts} from "expo-font";

function CustomFonts() {
    //this use of generic names let's us customize the the app font without changing it in every place.
    //do not commit this file, or change App-{style} if you wish to customize fonts change the require.
    return useFonts({
        'AppEditItem': require('./branded fonts/AvenirLTStd-Roman.otf'),
        'AppBold': require('./branded fonts/Brandon_bld.otf'),
        'AppRegular': require('./branded fonts/Brandon_reg.otf'),
        'AppHeading': require('./branded fonts/TrendSansFour.otf'),
    });
 }

export default CustomFonts;

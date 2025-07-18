import {easter} from 'date-easter';

export const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

export const milkProducts = [
    {
        size: "473 ML",
        products: [
            {
                longDesc: "Cream 18%",
                desc: "Cream",
                productUPC: "068700100468"
            },
            {
                longDesc: "Cream Half 10%",
                desc: "Half",
                productUPC: "068700100444"
            },                
            {
                longDesc: "Milk 2%",
                desc: "2%",
                productUPC: "068700100734"
            },                
            {
                longDesc: "Chocolate Milk",
                desc: "Chocolate",
                productUPC: "068700100635"
            },       
        ]
    },
    {
        size: "1 Litre",
        products: [
            {
                longDesc: "Cream 18%",
                desc: "Cream",
                productUPC: "068700103636"
            },  
            {
                longDesc: "Cream Half 10%",
                desc: "Half",
                productUPC: "068700103612"
            },  
            {
                longDesc: "Milk 2%",
                desc: "2%",
                productUPC: "068700125003"
            },  
            {
                longDesc: "Milk 1%",
                desc: "1%",
                productUPC: "068700123405"
            },  
            {
                longDesc: "Chocolate Milk",
                desc: "Chocolate",
                productUPC: "068700102981"
            },      
        ]
    },
    {
        size: "2 Litre",
        products: [
            {
                longDesc: "Lactose-Free",
                desc: "Lactose",
                productUPC: "068700103803"
            },
            {
                longDesc: "Milk 2%",
                desc: "2%",
                productUPC: "068700115004"
            },
            {
                longDesc: "Milk 1%",
                desc: "1%",
                productUPC: "068700116704"
            },
        ]
    },
];

export const fiveDigitJulianProductsList = [
    {
        name: "Jimmy Dean Sausage Egg Cheese Muffin 5oz",
        productUPC: "077900513671"
    },
    {
        name: "Homestyle 2Bite Cinnamon Bun 85g",
        productUPC: "770981090412"
    },
    {
        name: "Homestyle 2Bite Brownies 85g",
        productUPC: "770981090801"
    },
]

export const fiveDigitJulianProducts = fiveDigitJulianProductsList.map(product => product.productUPC);

export const vendorList = [
    {
        name: "Direct Plus",
        credit: true
    },
    {
        name: "Lumsden Brothers",
        credit: false
    },
    {
        name: "Core Mark",
        credit: false
    },
    {
        name: "Sobeys Inc",
        credit: false
    },
    {
        name: "Scholtens Candy",
        credit: true
    },
    {
        name: "United Distribution",
        credit: true
    },
    {
        name: "Coca-Cola",
        credit: false
    },
    {
        name: "Pepsi-Cola",
        credit: false
    },
    {
        name: "Saputo",
        credit: false
    },
    {
        name: "M&M Food Market",
        credit: false
    },
    {
        name: "Great Canadian Meat",
        credit: true
    },
    {
        name: "Coldhaus Direct",
        credit: true
    },
    {
        name: "Peak Performance Products",
        credit: false
    },
    {
        name: "True North Nutrition",
        credit: false
    },
    {
        name: "Nutrition Excellence",
        credit: false
    },
    {
        name: "Healthy Body",
        credit: false
    },
    {
        name: "Red Pine Outdoor Equipment",
        credit: false
    },
    {
        name: "Frito Lay Canada",
        credit: true
    },
    {
        name: "Aliments Krispy Kernels",
        credit: false
    },
    {
        name: "Pratts Wholesale",
        credit: false
    },
    {
        name: "Arrowhead Coffee Company",
        credit: false
    },
    {
        name: "Tim Hortons",
        credit: true
    },
    {
        name: "Procter & Gamble",
        credit: false
    },
        {
        name: "Red Bull Canada Ltd.",
        credit: true
    },
];

export const vendorArray = vendorList.map(vendor => vendor.name);

export const nonCreditVendors = vendorList.filter(vendor => vendor.credit == false).map(vendor => vendor.name);

export const storeClosedSunday = true;

function convertToTodaysDate(dateGiven) {
    const convertDate = new Date(dateGiven);
    convertDate.setMinutes(convertDate.getMinutes() + convertDate.getTimezoneOffset());
    return convertDate;
}

const easterSundayCalc = convertToTodaysDate(easter(getLocalDate().getFullYear()).year + "-" + easter(getLocalDate().getFullYear()).month + "-" + easter(getLocalDate().getFullYear()).day);
const easterSunday = convertToTodaysDate(easterSundayCalc).toDateString();
const goodFriday = convertToTodaysDate(easterSundayCalc.getTime() - (2 * 86400000)).toDateString();
const easterMonday = convertToTodaysDate(easterSundayCalc.getTime() + (1 * 86400000)).toDateString();
const christmasDay = convertToTodaysDate(getLocalDate().getFullYear() + "-12-25").toDateString();
const newYearsDay = convertToTodaysDate((getLocalDate().getFullYear() + 1) + "-01-01").toDateString();
const truthDay = convertToTodaysDate(getLocalDate().getFullYear() + "-09-30").toDateString();
const remembranceDay = convertToTodaysDate(getLocalDate().getFullYear() + "-11-11").toDateString();
const canadaDay = convertToTodaysDate(getLocalDate().getFullYear() + "-07-01").toDateString();

const octoberFirst = convertToTodaysDate(getLocalDate().getFullYear() + "-10-01");
const tgDayOfWeekCalc = 15 - (octoberFirst.getDay() < 2 ? octoberFirst.getDay() + 7 : octoberFirst.getDay());
const tgDayCanada = convertToTodaysDate(octoberFirst.getTime() + (tgDayOfWeekCalc * 86400000)).toDateString();

const may24 = convertToTodaysDate(getLocalDate().getFullYear() + "-05-24");
const vdDayOfWeekCalc = 1 - (may24.getDay() == 0 ? may24.getDay() + 7 : may24.getDay());
const victoriaDay = convertToTodaysDate(may24.getTime() + (vdDayOfWeekCalc * 86400000)).toDateString();

const septemberFirst = convertToTodaysDate(getLocalDate().getFullYear() + "-09-01");
const ldDayOfWeekCalc = 8 - (septemberFirst.getDay() < 2 ? septemberFirst.getDay() + 7 : septemberFirst.getDay());
const laborDayCanada = convertToTodaysDate(septemberFirst.getTime() + (ldDayOfWeekCalc * 86400000)).toDateString();

const augustFirst = convertToTodaysDate(getLocalDate().getFullYear() + "-08-01");
const tfDayOfWeekCalc = 8 - (augustFirst.getDay() < 2 ? augustFirst.getDay() + 7 : augustFirst.getDay());
const terryFoxDay = convertToTodaysDate(augustFirst.getTime() + (tfDayOfWeekCalc * 86400000)).toDateString();

const februaryFirst = convertToTodaysDate(getLocalDate().getFullYear() + "-02-01");
const lrDayOfWeekCalc = 22 - (februaryFirst.getDay() < 2 ? februaryFirst.getDay() + 7 : februaryFirst.getDay());
const louisRielDay = convertToTodaysDate(februaryFirst.getTime() + (lrDayOfWeekCalc * 86400000)).toDateString();

export const storeHolidays = {
    [easterSunday]: "Easter Sunday",
    [goodFriday]: "Good Friday",
    [easterMonday]: "Easter Monday",
    [christmasDay]: "Christmas Day",
    [newYearsDay]: "New Years Day",
    [truthDay]: "Truth and Reconciliation Day",
    [tgDayCanada]: "Thanksgiving Monday",
    [remembranceDay]: "Remembrance Day",
    [victoriaDay]: "Victoria Day",
    [canadaDay]: "Canada Day",
    [laborDayCanada]: "Labor Day",
    [terryFoxDay]: "Terry Fox Day",
    [louisRielDay]: "Louis Riel Day",
    // "Tue Apr 22 2025" : "Test Holiday",
}

export const storeHolidayArray = Object.keys(storeHolidays);

export function getLocalDate() {
    const date1 = new Date();
    const date2 = new Date(date1);
    const durationInMinutes = date1.getTimezoneOffset();
    date2.setMinutes(date1.getMinutes() - durationInMinutes)
    const date3 = date2.toISOString().split("T")[0] + "T00:00:00.000+00:00";
    return new Date(date3);
}
  
export function addDays(numDays) {
    // console.log(new Date(getLocalDate().getTime() + (numDays * 86400000)));
    return new Date(new Date().getTime() + (numDays * 86400000));
}

export function addDaysToDate(dateGiven, numDays) {
    const convertDate = new Date(dateGiven);
    // console.log(new Date(getLocalDate().getTime() + (numDays * 86400000)));
    return convertDate.getTime() + (numDays * 86400000);
}

export function titleCase(str) {
    var splitStr = str.split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
 }
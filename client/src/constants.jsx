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
                productUPC: "068700011825"
            },
        ]
    },
];

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
];

export const nonCreditVendors = vendorList.filter(vendor => vendor.credit == false).map(vendor => vendor.name);

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

export function titleCase(str) {
    var splitStr = str.split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
 }
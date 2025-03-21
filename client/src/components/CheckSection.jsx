import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import moment from "moment";
import cross from "../assets/cross.png";
import tick from "../assets/check.png";

// TODO: put these arrays in separate file
const monthNames = [
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

const milkProducts = [
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

const vendorList = [
    {
        name: "Direct Plus",
        credit: true
    },
    {
        name: "Lumsden Brothers",
        credit: true
    },
    {
        name: "Coca-Cola",
        credit: false
    },
    {
        name: "Pepsi",
        credit: false
    },
    {
        name: "Saputo",
        credit: false
    },
];

const nonCreditVendors = vendorList.filter(vendor => vendor.credit == false).map(vendor => vendor.name);
const vendorArray = vendorList.map(vendor => vendor.name);

export default function CheckSection() {
    const [currentSection, setCurrentSection] = useState({});
    const [currentUPC, setCurrentUPC] = useState("");
    const [currentProduct, setCurrentProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        productDesc: "",
        productSize: "",
        productVendor: null,
    });

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function getCurrentSection() {
            const response = await fetch(`http://localhost:5050/record/sections/${params.id}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const sectionData = await response.json();
            setCurrentSection(sectionData);
        }
        getCurrentSection();
        return;
    }, []);

    async function checkInput(inputtedValue) {
        const numbers = /^[0-9]+$/;
        if (inputtedValue.length == 12 && inputtedValue.match(numbers)) {
            setCurrentUPC(inputtedValue);
            const response = await fetch(`http://localhost:5050/record/products/${inputtedValue}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const productData = await response.json();
            setCurrentProduct(productData);
        }
    }

    async function setMilk(givenUPC) {
            setCurrentUPC(givenUPC);
            const response = await fetch(`http://localhost:5050/record/products/${givenUPC}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const productData = await response.json();
            setCurrentProduct(productData);
    }

    function cancelInput() {
        setCurrentProduct(null);
        setNewProduct({
            productDesc: "",
            productSize: "",
            productVendor: null,
        });
    }

    function updateNew(value) {
        return setNewProduct((prev) => {
            return { ...prev, ...value };
        });
    }

    async function enterNewProduct() {
        if (newProduct.productVendor && newProduct.productDesc.length > 0) {
            try {
            await fetch(`http://localhost:5050/record/sections/${params.id}&${currentUPC}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newProduct)
              });
            setNewProduct({
                productDesc: "",
                productSize: "",
                productVendor: null,
            });
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
        } finally {
            const response = await fetch(`http://localhost:5050/record/products/${currentUPC}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const productData = await response.json();
            setCurrentProduct(productData); 
        }           
        }
    }

    async function enterExpiryDate(dateID) {
        const productUPC = currentUPC;
        const productExprity = dateID == null ? moment().subtract(1, "days").format("YYYYMMDD") : dateID;
        try {
            await fetch(`http://localhost:5050/record/products/${productUPC}&${productExprity}`, {
                method: "PATCH",
            });
        } catch (error) {
          console.error('A problem occurred with your fetch operation: ', error);
        } finally {
            setCurrentProduct(null);
        }
    }

    async function setNewCheckedDate() {
        try {
            await fetch(`http://localhost:5050/record/sections/${params.id}`, {
                method: "PATCH",
            });
        } catch (error) {
          console.error('A problem occurred with your fetch operation: ', error);
        } finally {
            navigate("/expiryChecker");
        }
    }

    function daysIntoYear(date){
        const dayNumber = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
        return (dayNumber < 100 ? "0" : "") + (dayNumber < 10 ? "0" : "") + String(dayNumber);
    }

    const DateSelect = (props) => (
        // SECTION TO STYLE
        <div id={props.date.id} className="bg-green-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(e.target.id)}>{props.date.name}</div>
      );

      const Milk = (props) => (
        // SECTION TO STYLE
        <div id={props.milk.milkUPC} className="bg-yellow-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={() => setMilk(props.milk.milkUPC)}>{props.milk.milkDesc}</div>
      );

    function dateList() {
        const expiryDateList = [];
        for (let i = 0; i <= currentSection.intervalDays; i++) {
            const d = new Date(moment().add(i, "days"));
            // TODO: Add in calendar for M&M items
            expiryDateList.push(
            {
                id: String(d.getFullYear()) + ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + (d.getDate() < 10 ? "0" : "") + String(d.getDate()),
                name: monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
            }
            );
        }
        return expiryDateList.map((date) => {
            return (
                <DateSelect key={date.id} date={date}/>
            );
        });
    }

    function milkButtons() {
        const milkProductsArray = [];
        for (const x in milkProducts) {
            for (const y in milkProducts[x].products) {
                milkProductsArray.push({milkDesc: milkProducts[x].products[y].longDesc + " " + milkProducts[x].size, milkUPC: milkProducts[x].products[y].productUPC})
            }
        }
        return milkProductsArray.map((milk) => {
            return (
                <Milk key={milk.milkUPC} milk={milk}/>
            );
        });
    }

    return (
        <div className="text-center">
            {currentProduct == null ?
                <div>
            <div className="text-3xl font-serif pt-4">Current Section:</div>
            <div className="text-2xl font-serif font-bold">{currentSection.section}</div>
            <div className="text-2xl font-serif">Check for any products until:</div>
            <div className="text-2xl font-bold">{monthNames[new Date(moment().add(currentSection.intervalDays, "days").format("MM-DD-YYYY")).getMonth()] + " " + new Date(moment().add(currentSection.intervalDays, "days").format("MM-DD-YYYY")).getDate() + " " + new Date(moment().add(currentSection.intervalDays, "days").format("MM-DD-YYYY")).getFullYear()}</div>
            { currentSection.section == "Frozen" ?
            <div className="text-l">
            {(new Date(moment().format("MM-DD-YYYY")).getFullYear()) == (new Date(moment().add(currentSection.intervalDays, "days").format("MM-DD-YYYY")).getFullYear())
            ?
            `(On M&M products, the four digit number ending in ${new Date(moment().format("MM-DD-YYYY")).getFullYear() - 2020} and the first three digits equal to or less than ${daysIntoYear(new Date(moment().add(currentSection.intervalDays, "days").format("MM-DD-YYYY")))}.)` 
            : 
            `(On M&M products, the four digit number ending in ${new Date(moment().format("MM-DD-YYYY")).getFullYear() - 2020} and the first three digits equal to or less than ${new Date(moment().format("MM-DD-YYYY")).getFullYear() % 4 == 0 ? 366 : 365} OR ending in ${new Date(moment().add(currentSection.intervalDays, "days").format("MM-DD-YYYY")).getFullYear() - 2020} and the first three digits equal to or less than ${daysIntoYear(new Date(moment().add(currentSection.intervalDays, "days").format("MM-DD-YYYY")))})`
            }
            </div>
            :
            null
            }
                    <div className="text-xl font-bold pt-4">Input or Scan Product UPC:</div>
                    <input type="number" autoFocus onInput={(e)=>checkInput(e.target.value)} onPaste={(e)=>checkInput(e.target.value)} className="my-3 text-2xl text-center border border-black rounded-md"/>
                    {currentSection.section == "Dairy" ? 
                    <div><div className="text-center font-serif text-xl font-bold">Or choose milk product:</div><div>{milkButtons()}</div></div> : null}
                    <div className="bg-gray-300 border border-black m-2 text-xl font-bold py-1" onClick={()=> setNewCheckedDate()}>Finished Checking Section</div>
                </div>
            : currentProduct.length > 0 ?
                <div>
                    <div className="font-serif pt-6 text-xl font-bold">Current Product:</div>
                    <div className="text-xl">{currentProduct[0].name}</div>
                    <div className="flex pb-1 pt-4">
                        <div className="m-auto text-xl basis-64 font-bold">Choose Expiry Date:</div>
                        <div onClick={()=>cancelInput()} className="basis-32 bg-red-400 text-xl text-center font-bold border border-black rounded-lg flow flex py-1 justify-center"><div>Cancel</div><div className="w-7 ml-1"><img src={cross}/></div></div>
                    </div>
                    <div className="bg-yellow-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(null)}>Already Expired</div>
                    <div>{dateList()}</div>
                </div>
            :
                <div className="pt-6">
                    <div className="font-serif text-2xl">Product with UPC:</div>
                    <div className="text-xl">{currentUPC}</div>
                    <div className="font-serif text-2xl">Is Unknown.</div>
                    <div className="font-serif text-3xl pb-4">Enter Product Info:</div>
                    <div className="flex"><div className="text-l m-auto font-bold">Product Name:</div><input type="text" onChange={(e) => updateNew({ productDesc: (e.target.value).trim() })} className="border border-black text-l"/></div>
                    <div className="flex"><div className="text-l m-auto font-bold">Size (Optional):</div><input type="text" onChange={(e) => updateNew({ productSize: (e.target.value).trim() })} className="border border-black text-l"/></div>
                    <select name="vendorMenu" onChange={(e) => updateNew({ productVendor: e.target.value})} className="border border-black p-1 rounded-md m-4 text-xl font-bold">
                        <option disabled selected>--Select Product Vendor</option>
                        {vendorArray.map(function(i) {
                            return <option key={i.replace(" ","")}>{i}</option>;
                        })}
                    </select>
                    <div className="flex">
                    <div onClick={() => enterNewProduct()} className="m-auto basis-70 bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 text-center justify-center"><div>Enter New Product</div><div className="w-7 ml-1"><img src={tick}/></div></div>
                    <div onClick={()=>cancelInput()} className="m-auto basis-30 bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center"><div>Cancel</div><div className="w-7 ml-1"><img src={cross}/></div></div>
                    </div>
                </div>
            }
            {/* if current product:
            name of product, cancel button, plus an "already expired" button, then array of date buttons
            if product unknown:
            put alert message, then two text fields, one for name and one for size, then select menu for vendor, then "enter" button and "cancel" button
            else:
            put text field that reacts when 12 digits in, only allow numbers, plus "done checking" button */}
        </div>
    );
}
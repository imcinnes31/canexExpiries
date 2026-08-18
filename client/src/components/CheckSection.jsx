import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {monthNames, milkProducts, vendorList, addDays, titleCase, fiveDigitJulianProducts, nonCreditVendors} from "../constants.jsx"
import {REACT_APP_API_URL} from "../../index.js"

import Barcode from 'react-barcode';
import moment from "moment";
import cross from "../assets/cross.png";
import tick from "../assets/check.png";
import fix from "../assets/wrench.png";
import move from "../assets/arrow.png";
import e from "cors";

export default function CheckSection() {
    const [currentSection, setCurrentSection] = useState({});
    const [currentUPC, setCurrentUPC] = useState("");
    const [currentProduct, setCurrentProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        productDesc: "",
        productSize: "",
        productSmallUPC: "",
        productVendor: null,
        productExpiry: null
    });
    const [vendors, setVendors] = useState([]);
    const [vendorSelect, setVendorSelect] = useState(null);
    const [sections, setSections] = useState([]);
    const [sectionSelect, setSectionSelect] = useState(null);
    const [currentDate, setCurrentDate] = useState(null);
    const [smallUPCProducts, setSmallUPCProducts] = useState([]);
    const [smallAlert, setSmallAlert] = useState(null);
    const [changeProduct, setChangeProduct] = useState({
        newName: null,
        newVendor: null,
        newSmallUPC: null
    });
    const [editingProducts, setEditingProducts] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [deleteUPC, setDeleteUPC] = useState(null);
    const [moveUPC, setMoveUPC] = useState(null);
    const [productList, setProductList] = useState(null);
    const [validUPCs, setValidUPCs] = useState(null);
    const [currentDelete, setCurrentDelete] = useState(null);
    const params = useParams();
    const navigate = useNavigate();

    async function getList() {
        const responseList = await fetch(`${REACT_APP_API_URL}/expiries/allProducts/${params.id}`);
        if (!responseList.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            alert("Failed to get list data. Please go back and try again.");
            return;
        }
        const listData = await responseList.json();
        const sortedListData = listData.sort((a, b) => a.productName.localeCompare(b.productName));
        setProductList(sortedListData);
    };
        
    useEffect(() => {
        function getVendors() {
            const vendorArray = vendorList.map(vendor => vendor.name);
            setVendors(vendorArray);
        }
        async function getCurrentSection() {
            const response = await fetch(`${REACT_APP_API_URL}/expiries/sections/${params.id}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to retrieve data. Please try again.")
                return;
            }
            const sectionData = await response.json();
            const smallUPCDict = Object.fromEntries(sectionData.products.map(x => [x.smallUPC, x.productUPC]));
            setSmallUPCProducts(smallUPCDict);
            setCurrentSection(sectionData);
        }
        async function getValidUPCs() {
            const responseArray = await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords`);
            if (!responseArray.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to get list data. Please go back and try again.");
                return;
            }
            const upcArray = await responseArray.json();
            setValidUPCs(upcArray);
        }
        async function getSectionNames() {
            const response = await fetch(`${REACT_APP_API_URL}/expiries/sections/`); 
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to retrieve section name data. Please try again.")
                return;
            }
            const sectionData = await response.json();

            const filteredSectionData = 
                sectionData.filter(section => section.sectionNumber > 0).sort((a, b) => a.sectionNumber - b.sectionNumber);

            setSections(filteredSectionData);
        }
        getVendors();
        getCurrentSection();
        getList();
        getValidUPCs();
        getSectionNames();
        return;
    }, []);

    async function checkInput(inputtedValue) {
        const numbers = /^[0-9]+$/;
        if (inputtedValue.length == 8 && inputtedValue.match(numbers)) {
            if (inputtedValue in smallUPCProducts) {
                inputtedValue = smallUPCProducts[inputtedValue];
            } else {
                setSmallAlert("If you are currently entering a small barcode, it is not recognized. Bring it to Product Lookup and find the full UPC and enter it.")
            }
        } else {
            setSmallAlert(null);
        }
        if (inputtedValue.length == 12 && inputtedValue.match(numbers)) {
            setCurrentUPC(inputtedValue);
            const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${inputtedValue}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to retrieve product data. Please try again.");
                setCurrentUPC("");
                return;
            }
            const productData = await response.json();
            setCurrentProduct(productData);
            window.scrollTo(0,0);
        } 
    }

    async function setMilk(givenUPC) {
        setCurrentUPC(givenUPC);
        const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${givenUPC}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            alert("Failed to retrieve product data. Please try again.")
            setCurrentUPC("");
            return;
        }
        const productData = await response.json();
        setCurrentProduct(productData);
        window.scrollTo(0,0);
    }

    function cancelInput() {
        setCurrentDate(null);
        setCurrentProduct(null);
        setNewProduct({
            productDesc: "",
            productSize: "",
            productSmallUPC: "",
            productVendor: null,
            productExpiry: null
        });
        window.scrollTo(0,0);
    }

    function updateNew(value) {
        return setNewProduct((prev) => {
            return { ...prev, ...value };
        });
    }

    function updateEdit(value) {
        return setChangeProduct((prev) => {
            return { ...prev, ...value };
        });
    }

    async function enterChangeProduct(upcToEdit) {
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/allProducts/${upcToEdit}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(changeProduct)
            });
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
            alert("Failed to edit product. Please try again.")
        } finally {
            setChangeProduct({newName: null,newVendor: null,newSmallUPC: null});
            getList();
            setEditProduct(null); 
            window.scrollTo(0,0);
        }
    }

    async function enterNewProduct() {
        if (newProduct.productExpiry && newProduct.productVendor && newProduct.productDesc.length > 0) {
            const numbers = /^[0-9]+$/;
            const newProductEntered = newProduct;
            newProductEntered.productDesc = titleCase(newProduct.productDesc);
            if (!(newProductEntered.productSmallUPC.length == 8 && newProductEntered.productSmallUPC.match(numbers))) {
                delete newProductEntered.productSmallUPC;
            } else {
                setSmallUPCProducts({
                    ...smallUPCProducts,
                    [newProductEntered.productSmallUPC]: currentUPC
                })
            }
            try {
                await fetch(`${REACT_APP_API_URL}/expiries/sections/${params.id}&${currentUPC}`, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newProductEntered)
                });
                setNewProduct({
                    productDesc: "",
                    productSize: "",
                    productSmallUPC: "",
                    productVendor: null,
                    productExpiry: null
                });
            } catch (error) {
                console.error('A problem occurred with your fetch operation: ', error);
                alert("Failed to add new product. Please try again.")
            } finally {
                const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${currentUPC}`);
                if (!response.ok) {
                    const message = `An error occurred: ${response.statusText}`;
                    console.error(message);
                    alert("Failed to retrieve product data. Please try again.")
                    return;
                }
                const productData = await response.json();
                setCurrentProduct(null); 
                window.scrollTo(0,0);
            }
        }
    }

    async function enterExpiryDate(dateID) {
        const productUPC = currentUPC;
        const productExpiry = dateID == null ? moment().subtract(1, "days").format("YYYYMMDD") : dateID.replace("confirm","");
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/products/${productUPC}&${productExpiry}`, {
                method: "PATCH",
            });
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
            alert("Failed to add expiry date to product. Please try again.");
        } finally {
            setCurrentProduct(null);
            setCurrentDate(null);
            window.scrollTo(0,0);
        }
    }

    async function setNewCheckedDate() {
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/sections/${params.id}`, {
                method: "PATCH",
            });
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
            alert("Failed to mark section as checked. Please go back and hit Finished Checking Section button again.");
        } finally {
            navigate("/");
        }
    }

    function confirmCurrentDate(dateID, last) {
        if (last == true) {
            document.getElementById("pageBottom").scrollIntoView({behavior: 'smooth'});
        }
        setCurrentDate(dateID);
    }

    function daysIntoJulian(date){
        const dayNumber = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
        return (dayNumber < 100 ? "0" : "") + (dayNumber < 10 ? "0" : "") + String(dayNumber);
    }

    const DateSelect = (props) => (
        <div id={`${props.date.id}`} className="flex">
            {/* <div id={props.date.id} className="bg-green-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(e.target.id)}>{props.date.name}</div> */}
            <div className={`w-full ${currentDate == props.date.id ? 'animate-horizontalHide' : 'bg-green-400'} h-10 my-4 pb-1 pt-1 border-2 border-black text-center ${props.date.section == "Frozen" || props.date.section == "Cottage Candy" ? 'text-md' : 'text-xl'} font-bold`} onClick={(e) => confirmCurrentDate(props.date.id, props.date.last)}>{props.date.name}</div>
            <div className={`${currentDate == props.date.id ? 'animate-horizontalShow' : 'hidden'} bg-green-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold`} onClick={(e) => enterExpiryDate(props.date.id)}>
                <div className='flex'>
                    <div>Confirm</div>
                    <div className="w-7 ml-1"><img src={tick}/></div>
                </div>
            </div>
        </div>
    );

    const Milk = (props) => (
        <div id={props.milk.milkUPC} className="bg-yellow-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={() => setMilk(props.milk.milkUPC)}>{props.milk.milkDesc}</div>
    );

    function dateList(inDropdown) {
        const expiryDateList = [];
        const alreadyExpiredDate = addDays(-1);
        expiryDateList.push({
            id: String(alreadyExpiredDate.getFullYear()) + ((alreadyExpiredDate.getMonth() + 1) < 10 ? "0" : "") + String(alreadyExpiredDate.getMonth() + 1) + (alreadyExpiredDate.getDate() < 10 ? "0" : "") + String(alreadyExpiredDate.getDate()),
            name: "Already Expired",
            last: false,
            section: currentSection.section,
            expiryMonth: alreadyExpiredDate.getMonth()
        });
        for (let i = 0; i <= currentSection.expiryRange; i++) {
            const d = addDays(i);
            if (currentSection.section == "Health & Beauty") {
                if (d.getDate() == 1) {
                    expiryDateList.push({
                        id: String(d.getFullYear()) + ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + (d.getDate() < 10 ? "0" : "") + String(d.getDate()),
                        name: (monthNames[d.getMonth()] + " " + d.getFullYear()) + (currentSection.section == "Cottage Candy" || fiveDigitJulianProducts.includes(currentUPC) ? ` OR ${d.getFullYear() - 2000}${daysIntoJulian(d)}` : currentSection.section == "Frozen" ? ` OR ${daysIntoJulian(d)}${d.getFullYear() - 2020 - 1}` : ""),
                        last: i == currentSection.expiryRange ? true : false,
                        section: currentSection.section,
                        expiryMonth: d.getMonth()
                    });
                }
            } else {
                expiryDateList.push({
                    id: String(d.getFullYear()) + ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + (d.getDate() < 10 ? "0" : "") + String(d.getDate()),
                    name: (monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()) + (currentSection.section == "Cottage Candy" || fiveDigitJulianProducts.includes(currentUPC) ? ` OR ${d.getFullYear() - 2000}${daysIntoJulian(d)}` : currentSection.section == "Frozen" ? ` OR ${daysIntoJulian(d)}${d.getFullYear() - 2020 - 1}` : ""),
                    last: i == currentSection.expiryRange ? true : false,
                    section: currentSection.section,
                    expiryMonth: d.getMonth()
                });
            }
        }
        return expiryDateList.map((date) => {
            return (
                inDropdown 
                ? <option key={date.id} id={date.id}>{date.name}</option>
                : <DateSelect key={date.id} date={date}/>
            );
        });
    }

    function milkButtons() {
        const milkProductsArray = [
            {
                milkDesc: "Tim's Dispenser Cream",
                milkUPC: "057957101946"
            },
            {
                milkDesc: "Tim's Dispenser Milk",
                milkUPC: "057957101953"
            },
                        {
                milkDesc: "Milk 2% 237 ML",
                milkUPC: "068700100697"
            },
                        {
                milkDesc: "Milk 1% 237 ML",
                milkUPC: "068700100727"
            },
                        {
                milkDesc: "Chocolate Milk 237 ML",
                milkUPC: "068700100611"
            },
        ];
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

    async function deleteListProduct(upcToDelete) {
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/allProducts/${currentSection._id}&${upcToDelete}`, {
                method: "DELETE",
            });
            setProductList(prevProducts => 
                prevProducts.filter(product => product.productUPC !== upcToDelete)
            );
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
            alert("Failed to delete this product. Please try again.")
        } finally {
            setDeleteUPC(null);
        }
    }

    async function moveListProduct(upcToMove, sectionMoveTo) {
        if (sectionMoveTo) {
            try {
                await fetch(`${REACT_APP_API_URL}/expiries/allProducts/${currentSection._id}&${sectionMoveTo}&${upcToMove}`, {
                    method: "PUT",
                });
                setProductList(prevProducts => 
                    prevProducts.filter(product => product.productUPC !== upcToMove)
                );
            } catch (error) {
                console.error('A problem occurred with your fetch operation: ', error);
                alert("Failed to delete this product. Please try again.")
            } finally {
                setMoveUPC(null);
            }
        }
    }

    function productEditRows() {
        window.scrollTo(0,0);
        return productList.map((product) => {
            return (
                <>
                    <tr className={`hidden md:table-row ${validUPCs.includes(product.productUPC) || product.productExpiryCount > 0 ? 'bg-green-200' : !(nonCreditVendors.includes(product.productVendor)) ? 'bg-yellow-200' : 'bg-red-200'} h-[26px]`}>
                        <td>
                            <div className={"flex"}>
                                <div className={"flex mx-4 w-1/2 items-center justify-center"}>{product.productUPC}</div>                    
                                <div className={"flex w-1/4 items-center justify-center"}><img className={"w-10 md:w-25 pr-2"} src={fix} onClick={() => {setEditProduct(product)}}/><img className={"w-10 md:w-25 pr-2"} src={move} onClick={() => {setMoveUPC(product.productUPC);}}/>{validUPCs.includes(product.productUPC) || product.productExpiryCount > 0 ? null : <img className={"w-10 md:w-25 pr-2"} src={cross} onClick={() => {setDeleteUPC(product.productUPC);}}/>}</div>
                            </div>
                        </td>
                        {/* <td className={'text-center text-base leading-none'}>{product.productUPC}</td> */}
                        <td className={'text-center text-base leading-none'}>{product.productName}</td>
                        <td className={'text-center text-base leading-none'}>{product.productVendor}</td>
                        <td className={'text-center text-base leading-none'}>{product.productSmallUPC ? product.productSmallUPC : null}</td>
                    </tr>
                    <tr className={`table-row md:hidden border-black border-l-4 border-t-4 border-r-4 ${validUPCs.includes(product.productUPC) || product.productExpiryCount > 0 ? 'bg-green-200' : !(nonCreditVendors.includes(product.productVendor)) ? 'bg-yellow-200' : 'bg-red-200'} h-[26px]`}>
                        <td colspan='2'>
                            <div className={"flex"}>
                                <div className={"flex mx-4 w-1/2 items-center justify-center text-xl"}>{product.productUPC}</div>                    
                                <div className={"flex w-1/4 items-center justify-center"}><img className={"w-1/2 py-1 pr-2"} src={fix} onClick={() => {setEditProduct(product);updateEdit({ newName: product.productName, newVendor: product.productVendor, newSmallUPC: product.productSmallUPC ? product.productSmallUPC : null})}}/><img className={"w-1/2 py-1 pr-2"} src={move} onClick={() => {setMoveUPC(product.productUPC);}}/>{validUPCs.includes(product.productUPC) || product.productExpiryCount > 0 ? null : <img className={"w-1/2 py-1 pr-2"} src={cross} onClick={() => {setDeleteUPC(product.productUPC);}}/>}</div>
                            </div>
                        </td>
                    </tr>
                    <tr className={`table-row md:hidden border-black border-l-4 border-r-4 ${validUPCs.includes(product.productUPC) || product.productExpiryCount > 0 ? 'bg-green-200' : !(nonCreditVendors.includes(product.productVendor)) ? 'bg-yellow-200' : 'bg-red-200'} h-[26px]`}>
                        <td colspan='2' className={'text-center text-base leading-none py-2 font-bold text-lg'}>{product.productName}</td>
                    </tr>
                    <tr className={`table-row md:hidden border-black border-l-4 border-b-4 border-r-4 ${validUPCs.includes(product.productUPC) || product.productExpiryCount > 0 ? 'bg-green-200' : !(nonCreditVendors.includes(product.productVendor)) ? 'bg-yellow-200' : 'bg-red-200'} h-[26px]`}>
                        <td className={'text-center text-base leading-none text-md font-bold py-2'}>{product.productVendor}</td>
                        <td className={'text-center text-base leading-none text-md font-bold py-2'}>{product.productSmallUPC ? product.productSmallUPC : null}</td>
                    </tr>
                </>
            );
        });
    }

    return (
        <div className="text-center">
            {currentProduct == null ?
                editingProducts ?
                    editProduct ?
                        <div className="text-center p-1 font-bold text-lg">
                            <div className="text-center p-1 font-bold text-2xl mb-4">Editing Product Info For: </div>
                            <div className="text-center p-1 font-bold text-xl mb-4">{editProduct.productName}</div>
                            <div className="text-center p-1 font-bold text-xl mb-4">(UPC {editProduct.productUPC})</div>
                            <div className="justify-items-center">
                                <div className="lg:w-1/2">
                                    <div className="">
                                        <div className="text-l m-auto font-bold lg:w-1/4">Product Name:</div>
                                        <input defaultValue={editProduct.productName} onChange={(e) => updateEdit({ newName: e.target.value})} type="text" placeholder="Enter Product Name" className={`border-2 border-black px-2 text-xl w-full mb-2 text-center`}/>
                                    </div>
                                    <div className="flex">
                                        <div className="text-l m-auto font-bold w-1/2">Small UPC (If Exists):</div>
                                        <input defaultValue={editProduct.productSmallUPC ? editProduct.productSmallUPC : ""} onChange={(e) => updateEdit({ newSmallUPC: e.target.value})} type="text" inputmmode="numeric" pattern="[0-9]*" className="px-2 border-2 border-black text-xl w-1/2 text-center"/>
                                    </div>
                                </div>
                            </div> 
                            <div className="mt-4">
                                Product Vendor:
                            </div>  
                            <select defaultValue={editProduct.productVendor} name="changeVendorMenu" onChange={(e) => {updateEdit({ newVendor: e.target.value})}} className={`border-2 border-black p-1 rounded-md m-4 text-xl font-bold`}>
                                {vendors
                                .filter((vendor) => vendor != "Tim Hortons")
                                .filter((vendor) => vendor != "Farmers Favorite")
                                .filter((vendor) => vendor != "Quality Deli")
                                .map(function(i) {
                                    return <option key={i.replace(" ","")}>{i}</option>;
                                })}
                            </select>
                            {/* <div className={`${((changeProduct.newVendor && changeProduct.newVendor != editProduct.productVendor) || (changeProduct.newName && changeProduct.newName.length > 0 && changeProduct.newName != editProduct.productName) || ((!(editProduct.productSmallUPC) && changeProduct.newSmallUPC && changeProduct.newSmallUPC.length == 8) || (editProduct.productSmallUPC && !(changeProduct.newSmallUPC)) || (editProduct.productSmallUPC && changeProduct.newSmallUPC && changeProduct.newSmallUPC.length == 8 && editProduct.productSmallUPC != changeProduct.newSmallUPC))) ? 'bg-green-400' : 'bg-green-100'}`} onClick={() => {enterChangeProduct(editProduct.productUPC)}}>Save Product Info</div> 
                            <div className='bg-red-400' onClick={() => {setEditProduct(null);}}>Cancel</div> */}
                            <div className="flex">
                                <div onClick={() => {enterChangeProduct(editProduct.productUPC)}} className={`m-auto mr-0 basis-70 text-xl font-bold border border-black rounded-l-lg flex py-1 text-center justify-center ${((changeProduct.newVendor && changeProduct.newVendor != editProduct.productVendor) || (changeProduct.newName && changeProduct.newName.length > 0 && changeProduct.newName != editProduct.productName) || ((!(editProduct.productSmallUPC) && changeProduct.newSmallUPC && changeProduct.newSmallUPC.length == 8) || (editProduct.productSmallUPC && !(changeProduct.newSmallUPC)) || (editProduct.productSmallUPC && changeProduct.newSmallUPC && changeProduct.newSmallUPC.length == 8 && editProduct.productSmallUPC != changeProduct.newSmallUPC))) ? 'bg-green-400' : 'bg-green-100'}`}>
                                    <div>Save Product Info</div>
                                    <div className="w-7 ml-1"><img src={tick}/></div>
                                </div> 
                                <div onClick={() => {setEditProduct(null);}} className='m-auto ml-0 basis-30 bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center'>
                                    <div>Cancel</div>
                                    <div className="w-7 ml-1"><img src={cross}/></div>
                                </div>
                            </div>
                        </div>
                    : moveUPC ?
                        <div className="text-center p-1 font-bold text-xl">
                            Moving Product: {productList.find(product => product.productUPC === moveUPC).productName} ({moveUPC}) To:
                            <select defaultValue={currentSection._id} onChange={(e) => setSectionSelect(e.target.value)} className={`${sectionSelect && (sectionSelect != currentSection._id) ? 'border-2 border-black' : 'border-2 border-red-500'} p-1 rounded-md my-2 text-xl font-bold`}>
                                {Object.entries(sections).map(([key, value]) => (
                                    <option key={key} id={value._id} value={value._id}>{value.section}</option>
                                ))}
                            </select>
                            <div className="flex">
                                <div className={`m-auto mr-0 basis-70 text-xl font-bold border border-black rounded-l-lg flex py-1 text-center justify-center ${sectionSelect && (sectionSelect != currentSection._id) ? 'bg-green-400' : 'bg-green-100'}`} onClick={() => moveListProduct(moveUPC, sectionSelect)}>
                                    <div>Move Product</div>
                                    <div className="w-7 ml-1"><img src={tick}/></div>
                                </div> 
                                <div className='m-auto ml-0 basis-30 bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center' onClick={() => setMoveUPC(null)}>
                                    <div>Cancel</div>
                                    <div className="w-7 ml-1"><img src={cross}/></div>
                                </div>
                            </div>
                        </div>
                    : deleteUPC ?
                        <div className="bg-red-200 text-center p-1 font-bold text-xl">
                            Delete Product: {productList.find(product => product.productUPC === deleteUPC).productName} ({deleteUPC}) From App Database?
                            <div className="grid grid-cols-2 p-1">
                                <div onClick={() => deleteListProduct(deleteUPC)} className="bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 justify-center">
                                    <div className="">Confirm</div>
                                    <div className="w-7 ml-1"><img src={tick}/></div>
                                </div>
                                <div onClick={() => setDeleteUPC(null)} className="bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center">
                                    <div className="">Cancel</div>
                                    <div className="w-7 ml-1"><img src={cross}/></div>
                                </div>
                            </div>

                        </div>
                    :
                        <div>
                            <div className="flex justify-center mt-4">
                                <div className="print:hidden flex justify-center items-center font-serif font-bold text-center text-lg ml-1 mr-4">{`Product List for ${currentSection.section}`}</div>
                                <div className="flex p-1 items-center border-2 border-black text-center font-serif text-l font-bold bg-red-400 justify-center rounded-lg" onClick={() => {setEditingProducts(false)}}>Back to Section Check</div>
                            </div>
                            <table className={"w-full"}>
                                <tbody>
                                    <tr className={"hidden md:table-row h-[24px]"}>
                                        <th className={`w-[20.00%]`}>UPC</th>
                                        <th className={`w-[60.00%]`}>Product Name</th>
                                        <th className={`w-[10.00%]`}>Vendor</th>
                                        <th className={`w-[10.00%]`}>Small UPC</th>
                                    </tr>
                                    <tr className={"table-row md:hidden h-[24px]"}>
                                        <th className={`w-[50.00%]`}></th>
                                        <th className={`w-[50.00%]`}></th>
                                    </tr>
                                    {productEditRows()}
                                </tbody>
                            </table>
                        </div>
                :
                <div>
                    <div className="text-3xl font-serif pt-4">Current Section:</div>
                    <div className="text-2xl font-serif font-bold">{currentSection.section}</div>
                    {params.id == "6795e982c4e5586be7dc5bfc" && (new Date().getDay() == 6 || new Date().getDay() < 3) ? 
                        <div className="text-2xl font-serif font-bold">*Saturday Check - Just Tim's Dispenser / Dairyland Cartons and Jugs*</div>
                    : null}
                    <div className="text-2xl font-serif">Check for any products expiring until:</div>
                    {currentSection.section == "Health & Beauty" 
                        ?
                        <div className="text-2xl font-bold">{monthNames[addDays(currentSection.expiryRange).getMonth()] + " " + addDays(currentSection.expiryRange).getFullYear()}</div>
                        :
                        <div className="text-2xl font-bold">{monthNames[addDays(currentSection.expiryRange).getMonth()] + " " + addDays(currentSection.expiryRange).getDate() + " " + addDays(currentSection.expiryRange).getFullYear()}</div>
                    }
                    {/* <div className="text-2xl font-serif">Or any products where the expiry date just states the months of:</div>
                    <div className="text-2xl font-bold">{String(currentSection.upcomingMonths).split(",").join(", ")}</div> */}
                    { currentSection.section == "Frozen" ?
                        <div className="text-xl font-bold">
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(On M&M products, the four digit number ending in ${new Date().getFullYear() - 2020 - 1} and the first three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))}.)` 
                            : 
                                `(On M&M products, any four digit number ending in ${new Date().getFullYear() - 2020 - 1} OR ending in ${addDays(currentSection.expiryRange).getFullYear() - 2020 - 1} and the first three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))})`
                            }
                            <br/>
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(Or on rare items, the five digit number beginning with ${new Date().getFullYear() - 2000 - 1} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))}.)` 
                            : 
                                `(Or on rare items, any five digit number beginning with ${new Date().getFullYear() - 2000 - 1} OR beginning with ${addDays(currentSection.expiryRange).getFullYear() - 2000 - 1} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))})`
                            }
                        </div>   
                    : currentSection.section == "Cottage Candy" ?
                        <div className="text-xl font-bold">
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(On Cottage Candy, the five digit number beginning with ${new Date().getFullYear() - 2000} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))}.)` 
                            : 
                                `(On Cottage Candy, any five digit number beginning with ${new Date().getFullYear() - 2000} OR beginning with ${addDays(currentSection.expiryRange).getFullYear() - 2000} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))})`
                            }
                        </div>
                    : currentSection.section == "Pastry" ?
                        <div className="text-xl font-bold">
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(On some products, the five digit number beginning with ${new Date().getFullYear() - 2000 - 1} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))}.)` 
                            : 
                                `(On some products, any five digit number beginning with ${new Date().getFullYear() - 2000 - 1} OR beginning with ${addDays(currentSection.expiryRange).getFullYear() - 2000 - 1} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))})`
                            }
                        </div>
                    : null
                    }
                    {
                        params.id == "6795e982c4e5586be7dc5bfc" && (new Date().getDay() == 6 || new Date().getDay() < 3) ?
                        null :
                        <div>
                            <div className="text-xl font-bold pt-4">Input or Scan Product UPC:</div>
                            <input type="text" inputmmode="numeric" pattern="[0-9]*" autoFocus={currentSection.section != "Dairy, Tims Section (Cooler 10)"} onInput={(e)=>checkInput(e.target.value)} onPaste={(e)=>checkInput(e.target.value)} className="my-3 text-2xl text-center border border-black rounded-md bg-gray-100"/>
                            <div className="text-lg text-red-600 font-bold py-1">{smallAlert}</div>
                        </div>
                    }
                    {params.id == "6795e982c4e5586be7dc5bfc" ? 
                        <div>
                            <div className="text-center font-serif text-xl font-bold">{new Date().getDay() == 6 || new Date().getDay() < 3 ? 'C' : 'Or c'}hoose a popular milk product:</div>
                            <div>{milkButtons()}</div>
                        </div> 
                    : 
                        null
                    }
                    <div className="bg-gray-300 border border-black m-2 text-xl font-bold py-1" onClick={()=> setNewCheckedDate()}>Finished Checking Section</div>
                    { productList && validUPCs ? 
                        <div className="flex justify-center mb-8 mt-16">
                            <div className="flex w-1/2 h-10 p-1 items-center mx-1 border-2 border-black text-center font-serif text-l font-bold bg-purple-400 justify-center rounded-lg" onClick={() => setEditingProducts(true)}>Product List</div>                
                        </div>
                    : null }
                </div>
            : currentProduct.length > 0 ?
                <div>
                    <div className="font-serif pt-6 text-xl font-bold">Current Product:</div>
                    <div className="text-xl">{currentProduct[0].name}</div>
                    <div className="flex pb-1 pt-4">
                        <div className="m-auto text-xl basis-64 font-bold">Choose Expiry Date:</div>
                        <div onClick={()=>cancelInput()} className="basis-32 bg-red-400 text-xl text-center font-bold border border-black rounded-lg flow flex py-1 justify-center">
                            <div>Cancel</div>
                            <div className="w-7 ml-1"><img src={cross}/></div>
                        </div>
                    </div>
                    {/* <div className="bg-green-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(null)}>Already Expired</div> */}
                    <div>{dateList(false)}</div>
                    <div className="h-10" id="pageBottom"></div>
                </div>
            :
                <div className="pt-6">
                    <div className="font-serif text-2xl">Unknown product with UPC:</div>
                    <div className="justify-items-center">
                        <Barcode 
                            value={currentUPC} 
                            format="CODE128" 
                            width={2} 
                            height={75}
                            displayValue={true}
                        />
                    </div>
                    <div className="font-serif text-3xl pb-4">Enter Expiry Date, then Scan Barcode in Product Lookup and Enter Info:</div>
                    <div className="justify-items-center">
                        <select defaultValue={'DEFAULT'} name="currentDateDropdown" onChange={(e) => {updateNew({ productExpiry: e.target.childNodes[e.target.selectedIndex].id})}} className={`${newProduct.productExpiry ? 'border-2 border-black' : 'border-2 border-red-500'} p-1 rounded-md mx-4 my-2 text-xl font-bold`}>
                            <option disabled value="DEFAULT">--Set Initial Expiry Date</option>
                            {dateList(true)}
                        </select>
                        <div className="lg:w-1/2">
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Product Name:</div>
                                <input onChange={(e) => updateNew({ productDesc: e.target.value})} type="text" placeholder="Enter Product Name" className={`${newProduct.productDesc ? 'border-2 border-black' : 'border-2 border-red-500'} px-2 text-xl lg:w-3/4`}/>
                            </div>
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Size (Optional):</div>
                                <input onChange={(e) => updateNew({ productSize: e.target.value})} type="text" className="px-2 border-2 border-black text-xl lg:w-3/4"/>
                            </div>
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Small UPC (If Exists):</div>
                                <input onChange={(e) => updateNew({ productSmallUPC: e.target.value})} type="text" inputmmode="numeric" pattern="[0-9]*" className="px-2 border-2 border-black text-xl lg:w-3/4"/>
                            </div>
                        </div> 
                    </div>           
                    <select defaultValue={'DEFAULT'} name="vendorMenu" onChange={(e) => updateNew({ productVendor: e.target.value})} className={`${newProduct.productVendor ? 'border-2 border-black' : 'border-2 border-red-500'} p-1 rounded-md m-4 text-xl font-bold`}>
                        <option disabled value="DEFAULT">--Select Product Vendor</option>
                        {vendors
                        .filter((vendor) => vendor != "Tim Hortons")
                        .filter((vendor) => vendor != "Farmers Favorite")
                        .filter((vendor) => vendor != "Quality Deli")
                        .map(function(i) {
                            return <option key={i.replace(" ","")}>{i}</option>;
                        })}
                    </select>
                    <div className="flex">
                        <div onClick={() => enterNewProduct()} className={`m-auto mr-0 basis-70 ${(newProduct.productExpiry && newProduct.productVendor && newProduct.productDesc.length > 0) ? "bg-green-400" : "bg-green-100"} text-xl font-bold border border-black rounded-l-lg flex py-1 text-center justify-center`}>
                            <div>Enter New Product</div>
                            <div className="w-7 ml-1"><img src={tick}/></div>
                        </div>
                        <div onClick={()=>cancelInput()} className="m-auto ml-0 basis-30 bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center">
                            <div>Cancel</div>
                            <div className="w-7 ml-1"><img src={cross}/></div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
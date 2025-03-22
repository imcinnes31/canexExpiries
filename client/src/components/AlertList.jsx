import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {monthNames, vendorList} from "../constants.jsx"

import cross from "../assets/cross.png";
import tick from "../assets/check.png";

const Pull = (props) => (
    <div>
        {props.params.type == "pulls" ?
            <div id={`${props.product.productUPC}`} onAnimationEnd={()=>props.animationEnds(props.pullID)} className={`bg-gray-100 p-2 m-3 border border-gray-400 rounded-sm ${props.pullMenuValue.clicked == true ? 'animate-hide' : ''}`}>
                <div id={`productName${props.product.productUPC}`} className="bg-white text-center p-1 font-bold text-xl">
                    {props.product.productName}
                </div>
                <div className="grid grid-cols-2">
                    <div className="bg-white border border-black text-center font-serif font-bold text-l">
                        {props.product.productSection}
                    </div>
                    <div className="bg-white border border-black text-center text-l tracking-wide">
                        {props.product.productUPC}
                    </div>
                </div>
                <div>
                    {props.nonCredits.includes(props.product.productVendor) ?
                        <div className="flex w-full pt-2">
                            <div className="border border-black rounded-l-lg text-xl font-bold bg-gray-300 text-center basis-64 m-auto py-1">Pull Amt:</div>
                            <select name="pullNumberMenu" id={`numberPull${props.product.productUPC}`} onChange={(e) => props.setPullNumber(e)} className="text-xl basis-24 font-bold border border-black">
                                {Array.from(Array(50), (e, i) => {
                                    return <option key={i}>{i}</option>
                                })}
                            </select>
                            <div id={`pullProduct${props.product.productUPC}`} className={`${props.pullMenuValue.amount > 0 ? 'bg-green-400' : 'bg-green-100'} text-xl basis-48 font-bold border border-black flex py-1 justify-center`} {...(props.pullMenuValue.amount > 0 ? { onClick: () => {props.deleteProduct(props.pullID, true)}} : {})}><div className="">Pull</div><div className="w-7 ml-1"><img src={tick}/></div></div>
                            <div className="bg-red-400 basis-24 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center" onClick={() => props.deleteProduct(props.pullID,false)}><div className="w-7"><img src={cross}/></div></div>
                        </div>
                    :
                        <div>
                            <div className="text-center text-xl font-bold font-serif p-1">Credit Product</div>
                            <div className="grid grid-cols-2">
                                <div id={`pullProduct${props.product.productUPC}`} className='bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 justify-center' onClick={() => props.deleteProduct(props.pullID,false)}><div className="">Pull</div><div className="w-7 ml-1"><img src={tick}/></div></div>
                                <div className="bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center" onClick={() => props.deleteProduct(props.pullID,false)}><div className="">Sold Out</div><div className="w-7 ml-1"><img src={cross}/></div></div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        : props.params.type == "discounts" ?
            <div id={`${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`} onAnimationEnd={()=>props.animationEnds(props.pullID)} className={`bg-gray-100 p-2 m-3 border border-gray-400 rounded-sm ${props.pullMenuValue.clicked == true ? 'animate-hide' : ''}`}>
                <div id={`productName${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`} className="bg-white text-center p-1 font-bold text-xl">
                    {props.product.productName}
                </div>
                <div className="grid grid-cols-2">
                    <div className="bg-white border border-black text-center font-serif font-bold text-l">
                        {props.product.productSection}
                    </div>
                    <div className="bg-white border border-black text-center text-l tracking-wide">
                        {props.product.productUPC}
                    </div>
                </div>
                <div className="text-center text-xl font-bold font-serif p-1">
                    {"Expires " + monthNames[new Date(props.product.productExpiry).getMonth()] + " " + new Date(props.product.productExpiry).getDate()}
                </div>
                <div className="grid grid-cols-2 p-1">
                    <div className="bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 justify-center" onClick={() => props.discountProduct(props.pullID,props.product.productExpiry)}>
                        <div className="">Stickered</div>
                        <div className="w-7 ml-1"><img src={tick}/></div>
                    </div>
                    <div className="bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center" onClick={() => props.soldOutProduct(props.pullID,props.product.productExpiry)}>
                        <div className="">Sold Out</div>
                        <div className="w-7 ml-1"><img src={cross}/></div>
                    </div>
                </div>
            </div>
        : "Error "}
    </div>
);

function pullList(products, setProducts, pullAmounts, setPullAmounts, nonCredits, setNonCredits, params) {    
    function setPullNumber(e) {
        const currentPull = pullAmounts[e.target.id.replace("numberPull","")];
        currentPull['amount'] = parseInt(e.target.value);
        setPullAmounts(currentPulls => ({...currentPulls, [e.target.id.replace("numberPull","")]: currentPull}));
    }

    async function deleteProduct(divID, recording = null) {
        if (recording == true) {
            try {
                await fetch(`http://localhost:5050/record/expiryRecords/${divID}&${pullAmounts[divID]['amount']}`, {
                    method: "POST",
                });
            } catch (error) {
              console.error('A problem occurred with your fetch operation: ', error);
            }
        }
        const currentPull = pullAmounts[divID];
        currentPull['clicked'] = true;

        const prodUPC = divID.substring(0,12);
        try {
            await fetch(`http://localhost:5050/record/products/${prodUPC}`, {
                method: "DELETE",
            });
            setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull}));
        } catch (error) {
          console.error('A problem occurred with your fetch operation: ', error);
        }
    } 

    async function soldOutProduct(divID,productExpiry) {
        const currentPull = pullAmounts[divID];
        currentPull['clicked'] = true;
        const prodUPC = divID.substring(0,12);
        try {
            await fetch(`http://localhost:5050/record/discounts/${prodUPC}&${productExpiry}`, {
                method: "DELETE",
            });
            setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull})); 
        } catch (error) {
          console.error('A problem occurred with your fetch operation: ', error);
        }
    }

    async function discountProduct(divID) {
        const currentPull = pullAmounts[divID];
        currentPull['clicked'] = true;
        const prodUPC = divID.substring(0,12);
        try {
            await fetch(`http://localhost:5050/record/discounts/${prodUPC}`, {
                method: "PATCH",
            });
            setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull}));
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
        }
    }

    function alertAnimationEnd(productID) {
        const newProducts = products.filter((pl) => pl.productUPC !== productID.substring(0,12));
        setProducts(newProducts);
    }

    useEffect(() => {
        function getNonCredits() {
            const nonCreditVendors = vendorList.filter(vendor => vendor.credit == false).map(vendor => vendor.name);
            setNonCredits(nonCreditVendors);
        }
        async function getPulls() {
            const response = params.type == "pulls" ? 
                await fetch(`http://localhost:5050/record/products/`) : 
                params.type == "discounts" ? 
                await fetch(`http://localhost:5050/record/discounts/`) : null;
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const productData = await response.json();
            const initialPullAmounts = {};
            if (params.type == "discounts") {
                const filteredProductData = productData.filter((product) => nonCredits.includes(product.productVendor))
                for (const x in productData) {
                    initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")] = {};
                    initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['amount'] = 0;
                    initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['clicked'] = false;
                    initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['name'] = productData[x].productName;
                }
                setProducts(filteredProductData);
            } else if (params.type == "pulls") {
                for (const x in productData) {
                    initialPullAmounts[productData[x].productUPC] = {};
                    initialPullAmounts[productData[x].productUPC]['amount'] = 0;
                    initialPullAmounts[productData[x].productUPC]['clicked'] = false;
                    initialPullAmounts[productData[x].productUPC]['name'] = productData[x].productName;
                }
                setProducts(productData);
            }
            setPullAmounts(initialPullAmounts);
        }
        getNonCredits();
        getPulls();
        return;
    }, []);

    return products.map((product) => {
        const pullID = params.type == "discounts" ? product.productUPC + (new Date(product.productExpiry).toISOString().split('T')[0].replaceAll("-","")) : product.productUPC;
        return (
            <Pull
                pullID={pullID}
                product={product}
                deleteProduct={deleteProduct}
                discountProduct={() => discountProduct(pullID)}
                soldOutProduct={() => soldOutProduct(pullID,product.productExpiry)}
                setPullNumber={(e) => setPullNumber(e)}
                nonCredits = {nonCredits}
                animationEnds={() => alertAnimationEnd(pullID)}
                pullMenuValue = {pullAmounts[pullID]}
                params={params}
                key={pullID}
            />
        );
    });
}

export default function AlertList() {
    const params = useParams();
    const [products, setProducts] = useState([]);
    const [pullAmounts, setPullAmounts] = useState({});
    const [nonCredits, setNonCredits] = useState([]);

    return (
        <div>
            <div className="font-bold text-center text-xl pt-2">
                {
                    params.type == "pulls" ? 
                        "Products to Pull" : 
                    params.type == "discounts" ? 
                        "Products to Mark as 50% off":
                        "Error"
                }
            </div>
            <div>
                {
                    params.type == "pulls" || params.type == "discounts" ? 
                        pullList(products, setProducts, pullAmounts, setPullAmounts, nonCredits, setNonCredits, params) :
                        "Error"
                }
            </div>
        </div>
    );
}
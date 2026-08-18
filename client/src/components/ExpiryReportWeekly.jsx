import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {monthNames, milkProducts, titleCase} from "../constants.jsx"
import canexLogo from "../assets/canex.png";
import fix from "../assets/wrench.png";
import cross from "../assets/cross.png";
import tick from "../assets/check.png";
import {REACT_APP_API_URL} from "../../index.js"
import Barcode from 'react-barcode';

export default function ExpiryReportWeekly() {
    const params = useParams();
    const [productReport, setProductReport] = useState({});
    const [expiryRecords, setExpiryRecords] = useState({});
    const [reportLoaded, setReportLoaded] = useState(false);
    const [editingAmounts, setEditingAmounts] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editAmount, setEditAmount] = useState(0);
    const [editReason, setEditReason] = useState("expired");

    useEffect(() => {
        getReport();
        return;
    }, []);

    async function getReport() {
        window.scrollTo(0,0);
        const weekID = params.reportDate;
        const response = await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords/${weekID}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            alert("Failed to get report data. Please go back and try again.");
            return;
        }
        const reportData = await response.json();

        const filteredReport2 = reportData.filter((report) => !(report.demoRecord == true)).reduce((accumulator, currentObject) => {
            accumulator[currentObject._id] = currentObject;
            return accumulator;
        }, {});

        setExpiryRecords(filteredReport2);

        const grouped = Object.groupBy(
            Object.values(filteredReport2), 
            (item) => item.productUPC
        );        
        const groupedWithInner = Object.fromEntries(
            Object.entries(grouped).map(([key, value]) => [key, { records: value }])
        );
        for (const x in groupedWithInner) {
            const responseProduct = await fetch(`${REACT_APP_API_URL}/expiries/products/${x}`);
            if (!responseProduct.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to get report data. Please go back and try again.");
                return;
            }
            const productData = await responseProduct.json();
            groupedWithInner[x].productName = productData[0].name;
            for (const y in groupedWithInner[x].records) {
                if (!(groupedWithInner[x].records[y].reason)) {
                    groupedWithInner[x].records[y].reason = "expired";
                }
            }
        }

        setProductReport(groupedWithInner);

        setReportLoaded(true);
    }

    function organizeAmounts(numbers) {
        let amountString = "";
        if (numbers['expired']) {
            amountString += (" " + numbers['expired'] + " Expired,");
        }
        if (numbers['damaged']) {
            amountString += (" " + numbers['damaged'] + " Damaged,");
        }
        if (numbers['store']) {
            amountString += (" " + numbers['store'] + " Store Use,");
        }
        amountString = amountString.trim().substring(0,amountString.length - 2);
        return amountString;
    }
        
    function NonMilkRow(props) {
        return (
            <>
                <tr className="hidden md:table-row h-[25px]">
                    <td className={'border-none leading-none'}></td>
                    <td className={'text-center text-xs leading-none'}>{props.productInfo.productName}</td>
                    <td className={'text-center text-base leading-none'}>{props.productUPC}</td>
                    <td className={'text-center text-base text-base leading-none leading-none'}>
                        {props.totalProducts > 0 ? 
                            <div className="flex justify-center items-center h-full w-full">
                                <Barcode 
                                    value={props.productUPC} 
                                    format="CODE128" 
                                    width={1.5} 
                                    height={15}
                                    margin={0,5,0,5}
                                    displayValue={false}
                                    background="transparent"
                                /> 
                            </div>
                        : null}
                    </td>
                    <td className={'text-center text-base font-bold leading-none'}>{props.totalProducts}</td>
                    <td className={'text-center text-base leading-none'}>{props.totalType == "store" ? "Store Use" : titleCase(props.totalType)}</td>
                </tr>
                <tr className="table-row md:hidden border-black border-l-4 border-t-4 border-r-4 h-[25px]">
                    <td className={'text-center text-xs leading-none'}>{props.productInfo.productName}</td>
                    <td className={'text-center text-base leading-none'} colspan='2'>{props.productUPC}</td>
                </tr>
                <tr className="table-row md:hidden border-black border-l-4 border-b-4 border-r-4 h-[25px]">
                    <td className={'text-center text-base text-base leading-none leading-none'}>
                        {props.totalProducts > 0 ? 
                            <div className="flex justify-center items-center h-full w-full">
                                <Barcode 
                                    value={props.productUPC} 
                                    format="CODE128" 
                                    width={1.5} 
                                    height={15}
                                    margin={0,5,0,5}
                                    displayValue={false}
                                    background="transparent"
                                /> 
                            </div>
                        : null}
                    </td>
                    <td className={'text-center text-base font-bold leading-none'}>{props.totalProducts}</td>
                    <td className={'text-center text-base leading-none'}>{props.totalType == "store" ? "Store Use" : titleCase(props.totalType)}</td>
                </tr>
            </>
        );
    }

    function NonMilkProduct(props) {
        return Object.entries(props.productInfo.totals).map(([type, amount]) => (
            <NonMilkRow 
                key={props.productUPC + type}
                productInfo={props.productInfo}
                productUPC={props.productUPC}
                totalProducts={amount}
                totalType={type}
            />
        ))
    }

    function MilkProduct(props){
        let productAmounts = null;
        if (props.milkReport[props.currentProduct.productUPC]) {
            productAmounts = organizeAmounts(props.milkReport[props.currentProduct.productUPC].reasonTotals);
        }

        return(
            <>
                <tr className={`hidden md:table-row ${props.groupIndex == 0 ? 'bg-green-100' : props.groupIndex == 1 ? 'bg-blue-100' : props.groupIndex == 2 ? 'bg-orange-100' : 'bg-red-200'} h-[26px]`}>
                    {props.productIndex == 0 ? 
                        <td className={'text-center border-none'} rowSpan={props.totalProducts}>{props.productSize}</td> 
                    : null}
                    <td className={'text-center text-base leading-none'}>{props.currentProduct.desc}</td>
                    <td className={'text-center text-base leading-none'}>{props.currentProduct.productUPC}</td>
                    <td className={'text-center font-bold text-base leading-none'}>{productAmounts ? productAmounts : null}</td>
                    <td className={'text-center text-base text-base leading-none leading-none'}>
                        {productAmounts ? 
                            <div className="flex justify-center items-center h-full w-full">
                                <Barcode 
                                    value={props.currentProduct.productUPC} 
                                    format="CODE128" 
                                    width={1.5} 
                                    height={15}
                                    margin={0,5,0,5}
                                    displayValue={false}
                                    background="transparent"
                                /> 
                            </div>
                        : null}
                    </td>
                </tr>
                <tr className={`table-row md:hidden border-l-4 border-t-4 border-r-4 border-black ${props.groupIndex == 0 ? 'bg-green-100' : props.groupIndex == 1 ? 'bg-blue-100' : props.groupIndex == 2 ? 'bg-orange-100' : 'bg-red-200'} h-[26px]`}>
                    {props.productIndex == 0 ? 
                        <td className={'text-center border-none'} rowSpan={props.totalProducts * 2}>{props.productSize}</td> 
                    : null}
                    <td className={'border-l-4 border-black text-center text-base leading-none'}>{props.currentProduct.desc}</td>
                    <td className={'border-l-4 border-black text-center font-bold text-base leading-none'}>{productAmounts ? productAmounts : null}</td>
                </tr>
                <tr className={`table-row md:hidden border-l-4 border-b-4 border-r-4 border-black ${props.groupIndex == 0 ? 'bg-green-100' : props.groupIndex == 1 ? 'bg-blue-100' : props.groupIndex == 2 ? 'bg-orange-100' : 'bg-red-200'} h-[26px]`}>
                    <td className={'border-l-4 border-black text-center text-base leading-none'}>{props.currentProduct.productUPC}</td>
                    <td className={'border-l-4 border-black text-center text-base text-base leading-none leading-none'}>
                        {productAmounts ? 
                            <div className="flex justify-center items-center h-full w-full">
                                <Barcode 
                                    value={props.currentProduct.productUPC} 
                                    format="CODE128" 
                                    width={1.5} 
                                    height={15}
                                    margin={0,5,0,5}
                                    displayValue={false}
                                    background="transparent"
                                /> 
                            </div>
                        : null}
                    </td>
                </tr>
            </>
        );
    }

    function MilkGroup(props){
        const milkProductsArray = [].concat.apply([], milkProducts.map(type => type.products)).map(product => product.productUPC);
        const groupedMilkProducts = Object.fromEntries(
            Object.entries(productReport).filter(([key]) => milkProductsArray.includes(key))
        ); 

        for (const [key, value] of Object.entries(groupedMilkProducts)) {
            const totalByReason = value.records.reduce((accumulator, current) => {
                accumulator[current.reason] = (accumulator[current.reason] || 0) + parseInt(current.amount);
                return accumulator;
            }, {});
            value['reasonTotals'] = totalByReason;
        }
        return(
            <div>
                <table className={`w-full`}>
                    <tbody>
                        <tr className={`${props.groupIndex > 0 ? "invisible" : ""} hidden md:table-row h-[27px]`}>
                            <th className={'w-[8.75%] bg-white'}></th>
                            <th className={'w-[12.75%] bg-white'}></th>
                            <th className={`w-[20.75%] ${props.groupIndex == 0 ? "border-black border-2" : ""} bg-gray-100 text-xl font-normal leading-none`}>UPC</th>
                            <th className={`w-[32.75%] ${props.groupIndex == 0 ? "border-black border-2" : ""} bg-gray-100 text-xl font-normal leading-none`}>Qty</th>
                            <th className={`w-[25.00%] ${props.groupIndex == 0 ? "border-black border-2" : ""} bg-gray-100 text-xl font-normal leading-none`}>Barcode</th>
                        </tr> 
                        <tr className={`${props.groupIndex > 0 ? "invisible" : ""} table-row md:hidden h-[27px]`}>
                            <th className={'w-[20.00%] bg-white'}></th>
                            <th className={'w-[35.00%] bg-white'}></th>
                            <th className={`w-[45.00%] bg-white`}></th>
                        </tr> 
                        {
                            props.products.map((product,index) => 
                                <MilkProduct 
                                    key={product.productUPC}
                                    productUPC={product.productUPC}
                                    productSize={props.sizeDesc}
                                    productIndex={index}
                                    groupIndex={props.groupIndex}
                                    totalProducts={props.products.length}
                                    currentProduct={milkProducts[props.groupIndex].products[index]}
                                    milkReport={groupedMilkProducts}
                                />
                            )
                        }
                    </tbody>
                </table>
            </div>
        );
    }

    function milkGroups() {  
        return milkProducts.map((group,index) =>
            <MilkGroup 
                key={group.size}
                sizeDesc={group.size}
                products={group.products}
                groupIndex={index}
            />
        ); 
    }

    function nonMilkGroups() {  
        const milkProductsArray = [].concat.apply([], milkProducts.map(type => type.products)).map(product => product.productUPC);

        const groupedNonMilkProducts = Object.fromEntries(
            Object.entries(productReport).filter(([key]) => !(milkProductsArray.includes(key)))
        ); 
        for (const x in groupedNonMilkProducts) {

            const result = groupedNonMilkProducts[x].records.reduce((acc, item) => {
                if (!acc[item.reason]) {
                    acc[item.reason] = 0;
                }
                acc[item.reason] += parseInt(item.amount);
                return acc;
            }, {});

            groupedNonMilkProducts[x].totals = result;
        }

        const nonMilkData = Object.values(
            Object.values(productReport).map(({ writeOffDate, _id, ...reducedDictionary }) => reducedDictionary).filter(item => !(milkProductsArray.includes(item["productUPC"])))
            .reduce((accumulator, currentItem) => {
                const upc = currentItem.productUPC;

                if (accumulator[upc]) {
                    accumulator[upc].amount += parseInt(currentItem.amount);
                } else {
                    accumulator[upc] = { ...currentItem };
                    accumulator[upc].amount = parseInt(currentItem.amount);
                }

                return accumulator;
            }, {})
        );

        return Object.entries(groupedNonMilkProducts).map(([productUPC, productInfo]) => (
            <NonMilkProduct 
                key={productUPC}
                productUPC={productUPC}
                productInfo={productInfo}
            />
        ));
    }

    async function saveChanges(recordId) {
        if (editAmount == 0) {
            try {
                await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords/${recordId}`, {
                    method: "DELETE",
                });
                getReport();
            } catch (error) {
                console.error('A problem occurred with your fetch operation: ', error);
                alert("Failed to delete this expiry record. Please try again.")
            }
        } else if (editAmount !== expiryRecords[recordId].amount || editReason !== expiryRecords[recordId].reason) {
            try {
                await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords/${recordId}&${editAmount}&${editReason}`, {
                    method: "PATCH",
                });
                getReport();
            } catch (error) {
                console.error('A problem occurred with your fetch operation: ', error);
                alert("Failed to modify this expiry record. Please try again.")
            }
        }
        setEditItem(null);
    }

    function EntryRow(props) {
        return (
            <tr className={'bg-gray-100'}>
                <td className={"text-center"}>{props.entry.productName}</td>
                <td className={"text-center px-1"}>{props.entry.productUPC}</td>
                <td>
                    <div className={"flex"}>
                        <div className={"flex w-1/2 flex items-center justify-center"}>{props.entry.recordAmount}</div>                    
                        <div className={"flex w-1/2 flex items-center justify-center"}><img className={"w-100 sm:w-1/2 pr-2"} src={fix} onClick={() => {setEditItem(props.entry.recordId);setEditAmount(props.entry.recordAmount);setEditReason(props.entry.recordReason ? props.entry.recordReason : 'expired')}}/></div>
                    </div>
                </td>
                <td className={"text-center"}>{props.entry.recordReason == "store" ? 'Store Use' : titleCase(props.entry.recordReason)}</td>
            </tr>
        );
    }
    
    function DateEntry(props) {
        return (
            <table className={"w-full"}>
                <tbody>
                    <tr className={"h-[24px]"}>
                        <th className={`w-[60.00%]`}>Product Name</th>
                        <th className={`w-[20.00%]`}>Product UPC</th>
                        <th className={`w-[10.00%]`}>Amount</th>
                        <th className={`w-[10.00%]`}>Reason</th>
                    </tr>
                    {props.date.map((entryData) => (
                        <EntryRow
                            key={entryData._id}
                            entry={entryData}
                        />
                    ))} 
                </tbody>
            </table>
        );
    }
    
    function editingDates() {
        for (const [key, value] of Object.entries(productReport)) {
            value['productUPC'] = key;
        }
        const productArray = Object.values(productReport);

        const unwoundProductData = productArray.flatMap(parent => 
            parent.records.map(record => ({
                productUPC: parent.productUPC,
                productName: parent.productName,
                recordDate: record.writeOffDate,
                recordAmount: record.amount,
                recordId: record._id,
                recordReason: record.reason
            }))
        );

        const groupedByDateData = Object.groupBy(Object.values(unwoundProductData), item => item.recordDate);
        const sortedDictionary = Object.fromEntries(
            Object.entries(groupedByDateData).sort((a, b) => new Date(b[0]) - new Date(a[0]))
        );

        return Object.entries(sortedDictionary).map(([key, value]) => (
            <div className="mt-4">
                <div className="font-bold text-xl font-serif underline">{monthNames[parseInt(key.substring(5,7)) - 1] + " " + parseInt(key.substring(8,10)) + ", " + key.substring(0,4)}</div>
                {
                    <DateEntry
                        key={key}
                        date={value}
                    />
                }
            </div>
        ));
    }

    return (
        <div>
            <div className={"screen:hidden text-xl pl-1"}>4375 - Winnipeg</div>
            <div className={"screen:hidden text-xl pl-1"}>Store Spoilage log - {monthNames[parseInt(params.reportDate.substring(0,2)) - 1]} {params.reportDate.substring(2,6)}</div>
            <div className={"screen:hidden text-xl pl-1"}>On Products Entered by CANEX Expiry Date Tracker</div>
            {reportLoaded == true ?
                editingAmounts ? null :
                <div className="print:hidden w-15 h-15 p-2 my-2 mx-10 border-2 border-black text-center font-serif text-l font-bold bg-gray-200" onClick={() => window.print()}>Print Report</div>
            : 
                <div className="mt-10 justify-items-center">        
                    <div className="h-50 w-80 overflow-hidden relative"><img className="print:hidden animate-load" src={canexLogo}/></div>
                    <div className="h-50 text-3xl text-center font-bold">Loading...</div>
                </div>
            }
            <div className="print:hidden flex justify-center pt-6">
                {!(editItem || editingAmounts) ? 
                    <div className="print:hidden flex justify-center items-center h-10 font-serif font-bold text-center text-lg w-3/4">{monthNames[parseInt(params.reportDate.substring(0,2)) - 1]} {parseInt(params.reportDate.substring(2,4))}, {params.reportDate.substring(4,8)} to {monthNames[parseInt(params.reportDate.substring(8,10)) - 1]} {parseInt(params.reportDate.substring(10,12))}, {params.reportDate.substring(12,16)}</div>
                : null}
                { 
                    reportLoaded ? 
                        !(editingAmounts) ?
                            <div className="flex w-1/4 h-10 p-1 items-center mx-1 border-2 border-black text-center font-serif text-l font-bold bg-purple-400 justify-center rounded-lg" onClick={() => setEditingAmounts(true)}>Modify</div>                
                        : 
                            !(editItem) ?
                                <div className="flex">
                                    <div className="print:hidden flex justify-center items-center h-10 font-serif font-bold text-center text-lg mx-1">{`Editing Records for ${monthNames[parseInt(params.reportDate.substring(0,2)) - 1]} ${parseInt(params.reportDate.substring(2,4))}, ${params.reportDate.substring(4,8)} to ${monthNames[parseInt(params.reportDate.substring(8,10)) - 1]} ${parseInt(params.reportDate.substring(10,12))}, ${params.reportDate.substring(12,16)}`}</div>
                                    <div className="flex h-10 p-1 items-center border-2 border-black text-center font-serif text-l font-bold bg-red-400 justify-center rounded-lg" onClick={() => setEditingAmounts(false)}>Back</div>
                                </div>
                            : null
                    : null
                }
            </div>
            {editingAmounts ? 
                editItem ?
                    <div className="text-center justify-center">
                        <div className="font-serif text-2xl font-bold">Correcting Record For:</div>
                        <div className="text-xl">{`${productReport[expiryRecords[editItem].productUPC].productName} (${expiryRecords[editItem].productUPC})`}</div>
                        <div className="text-xl font-bold">{"Written off on " + monthNames[parseInt(expiryRecords[editItem].writeOffDate.substring(5,7)) - 1] + " " + parseInt(expiryRecords[editItem].writeOffDate.substring(9,11)) + ", " + expiryRecords[editItem].writeOffDate.substring(0,4)}</div>
                        <div className="flex mt-4 justify-center">
                            <div className="mx-1 my-auto text-lg font-serif font-bold">Edit Amount:</div>
                            <select name="editAmountMenu" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="text-xl basis-24 py-1 font-bold border border-black rounded-md">
                                {Array.from(Array(50), (e, i) => {
                                    return <option key={i}>{i}</option>
                                })}
                            </select>
                        </div>
                        <div className="flex justify-center">
                            <div className="my-auto text-lg font-serif font-bold">Edit Reason:</div>
                            <select defaultValue={expiryRecords[editItem].reason} name="reasonMenu" onChange={(e) => setEditReason(e.target.value)} className="border border-black p-1 rounded-md m-4 text-xl font-bold">
                                <option value="damaged">Damaged</option>
                                <option value="store">Store Use</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>

                        <div className="flex justify-center">
                            <div className={`${editAmount != parseInt(expiryRecords[editItem].amount) || editReason != expiryRecords[editItem].reason ? 'bg-green-400' : 'bg-green-100'} text-xl basis-48 font-bold border border-black rounded-l-lg py-1 justify-center w-1/2 flex`} onClick={ () => {editAmount != parseInt(expiryRecords[editItem].amount) || editReason != expiryRecords[editItem].reason ? saveChanges(editItem) : null;} }>
                                <div>{editAmount == 0 ? "Delete Record" : "Change Record"}</div>
                                <div className="w-7 ml-1"><img src={tick}/></div>
                            </div>                      
                            <div className="bg-red-400 basis-24 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center w-1/2" onClick={() => setEditItem(null)}>
                                <div>Cancel</div>
                                <div className="w-7 ml-1"><img src={cross}/></div>
                            </div>
                        </div>
                    </div>
                :
                    <div>
                        {editingDates()}
                    </div> 
                : 
                    <div>
                        <div className="pt-[24px]">
                            {milkGroups()}
                        </div>
                        <table className={'w-full'}>
                            <tbody>
                                <tr className={"hidden md:table-row invisible h-[24px]"}>
                                    <th className={'w-[8.75%]'}>0</th>
                                    <th className={'w-[33.50%]'}>0</th>
                                    <th className={`w-[16.50%]`}>0</th>
                                    <th className={`w-[25.00%]`}>0</th>
                                    <th className={`w-[5.50%]`}>0</th>
                                    <th className={`w-[10.75%]`}>0</th>
                                </tr>
                                <tr className="hidden md:table-row h-[25px]">
                                    <th className={'w-[8.75%] invisible'}></th>
                                    <th className={'w-[33.50%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>Item Description</th>
                                    <th className={'w-[16.50%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>UPC</th>
                                    <th className={'w-[25.00%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>Barcode</th>
                                    <th className={'w-[5.50%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>Qty</th>
                                    <th className={'w-[10.75%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>Reason</th>
                                </tr>
                                <tr className="h-[25px] table-row md:hidden">
                                    <th className={'w-[50.00%] bg-white'}></th>
                                    <th className={'w-[25.00%] bg-white'}></th>
                                    <th className={'w-[25.00%] bg-white'}></th>
                                </tr>
                                {nonMilkGroups()}
                            </tbody>
                        </table>
                    </div>
                }
        </div>
    );   
}

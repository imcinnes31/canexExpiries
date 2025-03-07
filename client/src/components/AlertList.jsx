import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

const Pull = (props) => (
    <div id={`${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`} onAnimationEnd={()=>props.animationEnds(props.pullID)} className={`${props.pullMenuValue.clicked == true ? 'animate-hide' : ''}`}>
        <div>
            {props.product.productName}
        </div>
        {props.params.type == "pulls" ?
            <div>
                <label htmlFor="pullNumberMenu">Number to pull:</label>
                <select name="pullNumberMenu" id={`numberPull${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`} onChange={(e) => props.setPullNumber(e)}>
                    {Array.from(Array(10), (e, i) => {
                        return <option key={i}>{i}</option>
                    })}
                </select>
                <div id={`pullProduct${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`} className={`${props.pullMenuValue.amount > 0 ? 'bg-green-400' : 'bg-green-100'}`} onClick={() => props.pullProduct(props.pullID)}>Pull</div>
                <div className="bg-red-400" onClick={() => props.deleteProduct(props.pullID)}>Sold Out</div>
            </div>
        :
            <div>
                {"Expires " + monthNames[new Date(props.product.productExpiry).getMonth()] + " " + new Date(props.product.productExpiry).getDate()}
                <div>
                    <div className="bg-green-400">Stickered</div>
                    <div className="bg-red-400">Sold Out</div>
                </div>
            </div>
        }
    </div>
);

function pullList(products, setProducts, pullAmounts, setPullAmounts, params) {    
    function setPullNumber(e) {
        const currentPull = pullAmounts[e.target.id.replace("numberPull","")];
        currentPull['amount'] = parseInt(e.target.value);
        setPullAmounts(currentPulls => ({...currentPulls, [e.target.id.replace("numberPull","")]: currentPull}));
    }

    async function pullProduct(divID) {
        if (pullAmounts[divID]['amount'] > 0) {  // TODO: get value from state DONE
            const currentPull = pullAmounts[divID];
            currentPull['clicked'] = true;
            // TODO: create then call API to add to "pull report"
            // TODO: create then call API to delete product
            const prodUPC = divID.substring(0,12);
            await fetch(`http://localhost:5050/record/products/${prodUPC}`, {
                method: "DELETE",
            });
            setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull}));
        }
    }

    async function deleteProduct(divID) {
        const currentPull = pullAmounts[divID];
        currentPull['clicked'] = true;
        // TODO: set "sold out" button to call this function
        // TODO: create then call API to delete product
        const prodUPC = divID.substring(0,12);
        await fetch(`http://localhost:5050/record/products/${prodUPC}`, {
            method: "DELETE",
        });
        setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull}));
    } 

    function alertAnimationEnd(productID) {
        const newProducts = products.filter((pl) => pl.productUPC !== productID.substring(0,12));
        setProducts(newProducts);
        // TODO: erase product from product state DONE
    }

      useEffect(() => {
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
          for (const x in productData) {
            initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")] = {};
            initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['amount'] = 0;
            initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['clicked'] = false;
          }
          setPullAmounts(initialPullAmounts);
          setProducts(productData);
        }
        getPulls();
        return;
      }, []);    // TODO: remove this to only happen once DONE

    return products.map((product) => {
        const pullID = product.productUPC + (new Date(product.productExpiry).toISOString().split('T')[0].replaceAll("-",""));
      return (
        <Pull
            pullID={pullID}
            product={product}
            deleteProduct={() => deleteProduct(pullID)}
            pullProduct={() => pullProduct(pullID)}
            setPullNumber={(e) => setPullNumber(e)}
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
    // TODO: add pullNumber and setPullNumber useState DONE

    return (
        <div>
            <div className="font-bold">
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
                        pullList(products, setProducts, pullAmounts, setPullAmounts, params) :
                        "Error"
                }
            </div>
        </div>
    );
}
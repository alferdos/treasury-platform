import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI, postDataAPI } from "../../utils/API";
import Modal from "@material-ui/core/Modal";
import GlobalTypes from "../../redux/actions/GlobalTypes";
import swal from "sweetalert";
import ReactHighcharts from 'react-highcharts/ReactHighstock.src'
//import priceData from './assets/btcdata.json'
import moment from 'moment'
import RiyalSymbol from "../RiyalSymbol"

//create property component to write all details from form.

const TradeProperty = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [blockchain, setBlockchain] = useState([]);
    const [buytrade, setBuyTrade] = useState([]);
    const [selltrade, setSellTrade] = useState([]);
    const [marketdisable, setMarketDisable] = useState(false);
    const [tradeError, setTradeError] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [chartdata, setChartData] = useState([]);
    const [volumedata, setVolumeData] = useState([]);

    const options = {style: 'currency', currency: 'SAR'};
    const numberFormat = new Intl.NumberFormat('en-SA', options);
    // Last traded price from transactions
    const lastPrice = transactions.length > 0 ? transactions[0].price : null;
    const configPrice = {
        yAxis: [{
            offset: 20,
            height: '70%',
            labels: {
                formatter: function () {
                    return numberFormat.format(this.value) 
                },
                x: -15,
                style: {
                    "color": "#000", "position": "absolute"
                },
                align: 'left'
            },
        }, {
            // Volume axis
            top: '72%',
            height: '26%',
            offset: 0,
            labels: {
                formatter: function () {
                    return this.value + ' units';
                },
                align: 'left',
                x: 5,
                style: { color: '#888' }
            },
            title: { text: 'Volume', style: { color: '#888' } },
            gridLineWidth: 0,
        }],
        tooltip: {
            shared: true,
            formatter: function () {
                let s = '<b>' + moment(this.x).format('MMM Do YYYY, h:mm') + '</b>';
                this.points && this.points.forEach(function(point) {
                    if (point.series.name === 'Price') {
                        s += '<br/>Price: ' + numberFormat.format(point.y);
                    } else if (point.series.name === 'Volume') {
                        s += '<br/>Volume: ' + point.y + ' units';
                    }
                });
                return s;
            }
        },
        plotOptions: {
            column: {
                borderRadius: 2,
            },
            series: {
                //showInNavigator: true,
            }
        },
        rangeSelector: {
            buttons: [{
                type: 'day',
                count: 1,
                text: '1d',
            }, {
                type: 'day',
                count: 7,
                text: '7d'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'month',
                count: 3,
                text: '3m'
            }, {
                type: 'all',
                text: 'All'
            }],
            selected: 4
        },
        title: {
            text: lastPrice ? `Last Price: SAR ${lastPrice}` : 'Price Chart'
        },
        chart: {
            height: 600,
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true
        },
        xAxis: {
            type: 'datetime',
        },
        series: [{
            name: 'Price',
            type: 'spline',
            data: chartdata,
            yAxis: 0,
            tooltip: {
                valueDecimals: 2
            },
            color: '#8B7355',
            lineWidth: 2,
        }, {
            name: 'Volume',
            type: 'column',
            data: volumedata,
            yAxis: 1,
            color: 'rgba(139, 115, 85, 0.5)',
            tooltip: {
                valueSuffix: ' units'
            },
        }]
    };

    const { auth } = useSelector((state) => state);

    async function getTrade() {
        var hrefPath = window.location.href;
        var id = hrefPath.split("/")[5];
        var getProperty = await getDataAPI("/get_property/" + id);
        var getBlockchain = await getDataAPI("/getPropBlockchainData/" + id);
        var getBuyTradeData = await getDataAPI("/getPropTrade/" + id + "?action=buy");
        var getSellTradeData = await getDataAPI("/getPropTrade/" + id + "?action=sell");
        var getChartData = await getDataAPI("/getChartData/" + id);
        // Fetch all market transactions for this property (not filtered by user)
        var getLatestTransaction = await getDataAPI("/getPropTransaction/" + id);
        setTransactions(getLatestTransaction.data);
        setData(Array.isArray(getProperty.data) ? getProperty.data : (getProperty.data ? [getProperty.data] : []));
        setBlockchain(Array.isArray(getBlockchain.data) ? getBlockchain.data : (getBlockchain.data ? [getBlockchain.data] : []));
        setBuyTrade(getBuyTradeData.data);
        setSellTrade(getSellTradeData.data);
        let chart=[];
        let volume=[];
        (getChartData.data).map(function(d){
            chart.push([
                d.time,
                d.price
            ]);
        });
        // Build volume data from transactions (group by day)
        const volMap = {};
        (getLatestTransaction.data || []).forEach(function(t) {
            const dayTs = new Date(t.createdAt).setHours(0,0,0,0);
            volMap[dayTs] = (volMap[dayTs] || 0) + (t.units || 0);
        });
        Object.keys(volMap).sort().forEach(function(ts) {
            volume.push([parseInt(ts), volMap[ts]]);
        });
        setChartData(chart);
        setVolumeData(volume);
        if(getBuyTradeData.data.length==0 && getSellTradeData.data.length==0){
            setMarketDisable(true);
        }
    }
    useEffect(() => {
        //setInterval(() => getTrade(), 5000);
        getTrade();
    }, [auth]);

    const marketTrade = async (e) => {
        e.preventDefault();
        if (!auth.data) {
            swal("Login Required", "Please log in to place an order.", "warning");
            return;
        }
        const form = e.target;
        const propertyId = form.elements['propertyId'];
        const units = form.elements['units'];
        const marketPrice = form.elements['marketPrice'];
        const price = form.elements['price'];
        const action = form.elements['action'];
        // Read radio group value correctly
        const priceTypeRadios = form.querySelectorAll('input[name="priceType"]');
        let priceTypeValue = 'marketPrice';
        priceTypeRadios.forEach(r => { if (r.checked) priceTypeValue = r.value; });

        let totalTokenSupply = document.querySelector(".totalTokenSupply").value;
        if (parseInt(units.value) > parseInt(totalTokenSupply)) {
            swal("Error", "Units requested exceed total token supply!", "error");
            return;
        }
        if (!units.value || parseInt(units.value) < 1) {
            swal("Error", "Please enter a valid number of units.", "error");
            return;
        }
        let details = {
            propertyId: propertyId.value,
            userId: auth.data.user._id,
            units: units.value,
            priceType: priceTypeValue,
            marketPrice: marketPrice ? marketPrice.value : "0",
            price: price ? price.value : "0",
            action: action.value,
        };
        postDataAPI("trade", details).then(function (response) {
            if (response.data.status == 0) {
                const errors = response.data.errors || {};
                setTradeError(errors);
                // Show a clear user-facing message for common cases
                if (errors.price && errors.price.toLowerCase().includes('balance')) {
                    swal("Insufficient Balance", "You don't have enough balance to place this buy order. Please top up your account.", "error");
                } else if (errors.units && (errors.units.toLowerCase().includes('unit') || errors.units.toLowerCase().includes('don'))) {
                    swal("Insufficient Units", errors.units || "You don't have enough units to sell.", "error");
                } else {
                    const msg = Object.values(errors).filter(Boolean).join(' ') || 'Please check your order details.';
                    swal("Order Failed", msg, "error");
                }
            }
            else if (response.data.status == -1) {
                getTrade();
                setTradeError(response.data.errors || {});
                swal("Partial Success", response.data.message, "warning");
            }
            else {
                getTrade();
                setTradeError({});
                swal("Order Placed", response.data.message, "success");
            }
        })
        .catch(function (error) {
            console.log(error);
            swal("Error", "Something went wrong. Please try again.", "error");
        });
    };

    const BuySellClickHandler = (action) => {
        document.querySelector("select[name='action']").value = action;
        // Scroll to the order form with a fixed offset so it lands at the top of the viewport
        const form = document.querySelector(".marketTrade");
        if (form) {
            const y = form.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
    
    return (
        <div>
            {data
                ? data.map((property) => (
                    <div className="main_content" key={property._id}>
                        <section className="main_listing">
                            <div className="container">
                                <div className="inner_list">
                                    <h3>{property.title}</h3>
                                    <h3>
                                        Address:<span>{property.address}</span>
                                    </h3>
                                    <div className="list_grd">
                                        <div
                                            id="carouselExampleControls"
                                            className="carousel slide"
                                            data-bs-ride="carousel">
                                            <div className="carousel-inner">
                                                {(property.imageName && Array.isArray(property.imageName) && property.imageName.length > 0) ? property.imageName.map((imgName, key) => (
                                                    <div key={`img${key}`} className={`carousel-item ${(key == 0) ? 'active' : ''}`}>
                                                        <img src={`${imgName}`} alt={property.title} />
                                                    </div>
                                                )) : (
                                                    <div className="carousel-item active">
                                                        <img src="/img/al_narjes.jpg" alt={property.title} />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className="carousel-control-prev"
                                                type="button"
                                                data-bs-target="#carouselExampleControls"
                                                data-bs-slide="prev">
                                                <span
                                                    className="carousel-control-prev-icon"
                                                    aria-hidden="true"></span>
                                                <span className="visually-hidden">Previous</span>
                                            </button>
                                            <button
                                                className="carousel-control-next"
                                                type="button"
                                                data-bs-target="#carouselExampleControls"
                                                data-bs-slide="next">
                                                <span
                                                    className="carousel-control-next-icon"
                                                    aria-hidden="true"></span>
                                                <span className="visually-hidden">Next</span>
                                            </button>
                                        </div>

                                        <div className="lis_col">
                                            <div className="tab_le upper_table">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>QTY</th>
                                                            <th>Bid</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {buytrade.length!=0 ? buytrade.map((b, i) => (
                                                            <tr key={`buy${i}`}>
                                                                <td>{b.units} units</td>
                                                                <td><RiyalSymbol size="0.85em" />{b.price}</td>
                                                            </tr>
                                                        )) : <tr><td colSpan={2}>Order book is empty!.</td></tr>}
                                                    </tbody>
                                                </table>
                                                <table className="table tab2">
                                                    <thead>
                                                        <tr>
                                                            <th>Ask</th>
                                                            <th>QTY</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selltrade.length!=0 ? selltrade.map((s, i) => (
                                                            <tr key={`sell${i}`}>
                                                                <td><RiyalSymbol size="0.85em" />{s.price}</td>
                                                                <td>{s.units} units</td>
                                                            </tr>
                                                        )) : <tr><td colSpan={2}>Order book is empty!.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <h4>Latest Transactions</h4>
                                            <div className="tab_le single_table">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Price</th>
                                                            <th>QTY</th>
                                                            <th>DATE</th>
                                                            <th>TIME</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.length === 0?
                                                            <tr>
                                                                <td colSpan={4}>No transactions to show.</td>
                                                            </tr>
                                                            :
                                                            transactions.map((t, i) => {
                                                                return <tr key={`tranx${i}`}>
                                                                    <td><RiyalSymbol size="0.85em" />{t.price ? t.price : "23.00"}</td>
                                                                    <td>{t.units} units</td>
                                                    <td>{t.createdAt ? t.createdAt.split("T").shift().replace(/-/g, "/") : "-"}</td>
                                                    <td>{t.createdAt ? t.createdAt.split("T")[1].substring(0, 5) : "-"}</td>
                                                                </tr>
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="token_row">
                                                <h3>Unit Price: <RiyalSymbol />{property.tokenPrice}</h3>
                                                <input type="hidden" className="totalTokenSupply" value={property.totalTokenSupply}/>
                                                <div className="btns">
                                                    <button
                                                        type="button"
                                                        className="btn"
                                                        onClick={() => BuySellClickHandler("buy")}>
                                                        Buy
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn2"
                                                        onClick={() => BuySellClickHandler("sell")}>
                                                        Sell
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="container">
                                <form className="marketTrade" onSubmit={marketTrade.bind(this)}>
                                    <input type="hidden" name="propertyId" value={`${blockchain && blockchain.length > 0 ? blockchain[0].propertyId : ""}`} />
                                    <input type="hidden" name="marketPrice" value="0" />
                                    <div className="tocken_detail">
                                        <div className="tocken_details">
                                            <div className="tock_detail">
                                                <input
                                                    type="text"
                                                    name="unitName"
                                                    className="form-control"
                                                    placeholder="Unit Name"
                                                    value={blockchain && blockchain.length > 0 ? blockchain[0].contractName : ""}
                                                    onChange={() => {}}
                                                    readOnly
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    name="unitId"
                                                    className="form-control"
                                                    placeholder="Unit Id"
                                                    value={blockchain && blockchain.length > 0 ? blockchain[0].symbol : ""}
                                                    onChange={() => {}}
                                                    readOnly
                                                    required
                                                />
                                            </div>
                                            <div className="tock_detail2">
                                                <select className="form-select" name="action">
                                                    <option value="buy">Buy</option>
                                                    <option value="sell">Sell</option>
                                                </select>
                                                {tradeError?.action && <span className="error">{tradeError.action}</span>}
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control"
                                                    placeholder="Units"
                                                    name="units"
                                                />
                                                {tradeError?.units && <span className="error">{tradeError.units}</span>}
                                            </div>
                                        </div>
                                        <div className="tocken_price">
                                            <h3>Price</h3>
                                            <div className="radio_tok">
                                                <div className="radio_in">
                                                    <div>
                                                        <label className="contain">
                                                            {(marketdisable==false)?(
                                                                <input type="radio" name="priceType" value="customPrice" />
                                                            ):(
                                                                <input type="radio" name="priceType" value="customPrice" checked/>
                                                            )}
                                                            <span className="checkmark"></span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="form-control"
                                                            placeholder="Price"
                                                            name="price"
                                                        />
                                                    </div>
                                                    {tradeError?.price && <span className="error">{tradeError.price}</span>}
                                                </div>
                                                <div>
                                                    <label className="contain">
                                                        {(marketdisable==false)?(
                                                            <input type="radio" name="priceType" value="marketPrice" checked/>
                                                        ):(
                                                            <input type="radio" name="priceType" value="marketPrice" disabled/>
                                                        )}
                                                        <span className="checkmark"></span>Market Price
                                                    </label>
                                                </div>
                                                {tradeError?.priceType && <span className="error">{tradeError.priceType}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btnClick place-order-btn"
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '14px 24px',
                                            marginTop: '20px',
                                            background: '#8B7355',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            letterSpacing: '0.5px',
                                            cursor: 'pointer',
                                        }}
                                    >Place Order</button>
                                </form>
                            </div>
                        </section>

                        <section>
                            <div className="container">
								<div className="highChartContainer">
									{
										(chartdata.length==0)?(<div className="blankMap"><span>Transaction is blank</span></div>):""
									}
									<ReactHighcharts config = {configPrice}></ReactHighcharts>
								</div>
                            </div>
                        </section>

                        <section className="Related">
                            <div className="container">
                                <div className="inner_related">
                                    <h3>Related updates</h3>
                                    <ul>
                                        <li>
                                            <a href="#">Link to news about property</a>
                                        </li>
                                        <li>
                                            <a href="#">Link to news about property #2</a>
                                        </li>
                                        <li>
                                            <a href="#">Link to news about property #3</a>
                                        </li>
                                        <li>
                                            <a href="#">Link to news about property #4</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                )) : ""}
        </div>
    );
};

export default TradeProperty;

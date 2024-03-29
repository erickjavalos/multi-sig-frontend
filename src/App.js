import React, { useEffect, useState } from 'react';
import axios from "axios";
import DateTimePicker from 'react-datetime-picker';
import './App.css';
import "../public/images/header.jpeg";
import background from "../public/images/header.jpeg";

import { View, Text, Image, StyleSheet } from 'react-native';

import {Helmet} from 'react-helmet';
import '../public/css/header.css'

// import Mint from "./Mint";

import NamiWalletApi, { Cardano } from './nami-js';
import blockfrostApiKey from '../config.js'; 
let nami;

var backendServer = "https://asdr898as7d8c989sd7fhn.herokuapp.com/"
// var backendServer = "http://localhost:5001/"

export default function App() {
    const [connected, setConnected] = useState()
    // connect nami wallet
    useEffect(() => {

        async function t() {

            const S = await Cardano();
            nami = new NamiWalletApi(
                S,
                window.cardano,
               blockfrostApiKey
            )

            if (await nami.isInstalled()) {
                await nami.isEnabled().then(result => { 
                    console.log("nami connected");
                    setConnected(result) 
                })
                
                // console.log(await nami.getAddress())
            }
        }

        t()
    }, [])

    // process mint request after user builds nft 
    function processMintRequest() {
        axios.post(backendServer,{"state": "startMint"})
          .then(() => console.log("hello world sent"))
          .catch(err => {
            console.log(err)
        })
    
        axios.get(backendServer,  { crossdomain: true }).then(response => {
            // retrieve hashed metadata from backend server
            var hashedMeta = response.data.hashedMeta
    
            async function setupTransaction() {
                let paymentAddress = await nami.getAddress() // nami wallet address
                

                let recipients = [
                    {address: "addr_test1qrnns8ctrctt5ga9g990nc4d7pt0k25gaj0mnlda320ejmprlzyh4mr2psnrgh6ht6kaw860j5rhv44x4mt4csl987zslcr4p6", amount: "10"}, // Seller Wallet, NFT price 10ADA
                    {address: paymentAddress,  amount: "0",
                     mintedAssets:[
                         {
                            "assetName":"Test1",
                            "quantity":"1",
                            "policyId":"58a8abbedbb77785b8163e14d2d32783f4f66b77dea08c6ef30b279a",
                            "policyScript":"8201828200581cd53436e6be4ee8d9c4dce7866a166cf26160f047dd4540437f17074282051a041bd09f"}]} // NFTs to be minted
                    ] // list of recipients

                let dummyMetadata =  {"721":
                    {"36aa169af7dc9bb5a566987191221f2d7a92aab211350f7119fc1541": // policyId
                    {"Test1": // NFTName
                    {"name":"sfgsdfgdfsg",
                    "description":"gsdffsgdfsgdfsgdfsg",
                    "image":"isdgdfsgafsgdfdfsgdfsgdfsgdfsgdfsgdfsgdfsgdfgdfgdfsgdfsgdfsgdfsg"}}
                    }
                }
              

                let transaction = await nami.transaction( 
                    {
                        PaymentAddress : paymentAddress, 
                        recipients : recipients,
                        metadata : dummyMetadata, 
                        metadataHash : hashedMeta, 
                        addMetadata : false, 
                        utxosRaw : (await nami.getUtxosHex()),
                        multiSig : true
                    }
                ) 


                // console.log("trying to sign transaction")
                const witnessBuyer = await nami.signTx(transaction, true)
                // console.log(witnessBuyer)

                axios.post(backendServer,
                    {"witnessBuyer": witnessBuyer,
                     "transaction": transaction})
                    .then(() => console.log("hello world sent"))
                    .catch(err => {
                        console.log(err)
                    })


            }
           
            setupTransaction()
        });
    
        
      }
    
    const connect = async () => {
        // Connects nami wallet to current website 
        await nami.enable()
            .then(result => setConnected(result))
            .catch(e => console.log(e))
    }

    return (
    
        <>
        {/* Global top level color */}
        
        <div className="application">
            <Helmet>
                <style>{'body { background-color: #050549;}'}</style>
            </Helmet>

            {/* site header and nami connection */}
            <div className = "head-text">
                <div className = "head-image">  
                    <img src={require("../public/images/header.jpeg").default} width="100%" height="100%"></img>
                </div>
                <div class='text-on-image'>
                    <button className={`button ${connected ? "success" : ""}`} onClick={connect} > {connected ? "Nami Connected" : "Connect to Nami"} </button>
                </div>

            </div>

            {/* Warnings Text */}
            <div className="warnings">
                {/* <h1 background-color = "white">This is a heading</h1> */}
                <h4><b>Warnings</b></h4>
                <h4><i>If you do not have Nami Wallet installed you can download the chrome extension <a href="https://namiwallet.io/" target="_blank"> here</a></i></h4>
                <h4><i>If issues with your Nami wallet persists, we suggest creating a new Nami wallet.</i></h4>
                <h4><i>Allow one transaction to clear prior to submitting another transaction.</i></h4>
                <h4><i>Please be patient with transaction times as the blockchain may be congested. </i></h4>
            </div>

            {/*Minting Process*/}
            <div className="warnings">
                <button className="buttonMint" onClick={processMintRequest}> 
                    Mint NFT
                </button>
            </div>

            {/* <div position="relative" width="100%">
                <img src={require("../public/images/header.jpeg").default} width="100%" height="100%"></img>
                <b position="absolute" top="200px" left= "0" width="100%" >yoo</b>
            </div> */}
            
        </div>
            {/* <div>
                <img src={require("../public/images/header.jpeg").default} width="100%" height="100%">

                </img>
            </div>     */}
        
        {/* <div className="row" >
            <h1> 1. Connect your website to Nami Wallet</h1>
        </div>
        <div className="row" >
            <button className={`button ${connected ? "success" : ""}`} onClick={connect} > {connected ? "Connected" : "Connect to Nami"} </button>
        </div>
        <div>
            <button onClick={processMintRequest}> 
                Mint NFT
            </button>
        </div> */}
        </>
        )
      }


    // return (
    //   <div className="App">
    //     <header className="App-header">
    //       <Mint />
    //     </header>
    //   </div>
    // );
//   }



// export default function App() {
//     return (<h1>SETUPPPPP GGGGGG</h1>)
// }


/*

export default function App() {
    const [connected, setConnected] = useState()
    const [address, setAddress] = useState()
    const [nfts, setNfts] = useState([])
    const [balance, setBalance] = useState()
    const [transaction, setTransaction] = useState()
    const [amount, setAmount] = useState("10")
    const [txHash, setTxHash] = useState()
    const [recipientAddress, setRecipientAddress] = useState("addr_test1qqsjrwqv6uyu7gtwtzvhjceauj8axmrhssqf3cvxangadqzt5f4xjh3za5jug5rw9uykv2klc5c66uzahu65vajvfscs57k2ql")
    const [witnesses, setWitnesses] = useState()
    const [policy, setPolicy] = useState()
    const [builtTransaction, setBuiltTransaction] = useState() 

    const [complextxHash, setComplextxHash] = useState()
    const [policyExpiration, setPolicyExpiration] = useState(new Date());
    const [complexTransaction, setComplexTransaction] = useState({recipients: [{address:"addr_test1qqsjrwqv6uyu7gtwtzvhjceauj8axmrhssqf3cvxangadqzt5f4xjh3za5jug5rw9uykv2klc5c66uzahu65vajvfscs57k2ql", 
        amount: "3", 
        mintedAssets:[{assetName: "MyNFT", quantity:'1',  policyId: "Example PolicyID", 
        policyScript:"ExamplePolicy"}] }]})

    useEffect(() => {
        const defaultDate = new Date();
        defaultDate.setTime(defaultDate.getTime() + (1 * 60 * 90 * 1000))
        setPolicyExpiration(defaultDate);

    }, [])
    useEffect(() => {
        async function t() {

            const S = await Cardano();
            nami = new NamiWalletApi(
                S,
                window.cardano,
               blockfrostApiKey
            )


            if (await nami.isInstalled()) {
                await nami.isEnabled().then(result => { setConnected(result) })

            }
        }

        t()
    }, [])



   
    const connect = async () => {
        // Connects nami wallet to current website 
        await nami.enable()
            .then(result => setConnected(result))
            .catch(e => console.log(e))
    }

    const getAddress = async () => {
        // retrieve address of nami wallet
        if (!connected) {
            await connect()
        }
        await nami.getAddress().then((newAddress) => { console.log(newAddress); setAddress(newAddress) })
    }


    const getBalance = async () => {
        if (!connected) {
            await connect()
        }
        await nami.getBalance().then(result => { console.log(result); setNfts(result.assets); setBalance(result.lovelace) })
    }


    const buildTransaction = async () => {
        if (!connected) {
            await connect()
        }

        const recipients = [{ "address": recipientAddress, "amount": amount }]
        let utxos = await nami.getUtxosHex();
        const myAddress = await nami.getAddress();
        
        let netId = await nami.getNetworkId();
        const t = await nami.transaction({
            PaymentAddress: myAddress,
            recipients: recipients,
            metadata: null,
            utxosRaw: utxos,
            networkId: netId.id,
            ttl: 3600,
            multiSig: null
        })
        console.log(t)
        setTransaction(t)
    }



    const buildFullTransaction = async () => {
        if (!connected) {
            await connect()
        }
        try {
        const recipients = complexTransaction.recipients
        const metadataTransaction = complexTransaction.metadata
        console.log(metadataTransaction)
        let utxos = await nami.getUtxosHex();
        
        const myAddress = await nami.getAddress();
        console.log(myAddress)
        let netId = await nami.getNetworkId();

        const t = await nami.transaction({
            PaymentAddress: myAddress,
            recipients: recipients,
            metadata: metadataTransaction,
            utxosRaw: utxos,
            networkId: netId.id,
            ttl: 3600,
            multiSig: null
        })
        setBuiltTransaction(t)
        const signature = await nami.signTx(t)
        console.log(t, signature, netId.id)
        const txHash = await nami.submitTx({
            transactionRaw: t,
            witnesses: [signature],

            networkId: netId.id
        })
        console.log(txHash)
        setComplextxHash(txHash)
    } catch (e){
        console.log(e)
    }
    }


    
    const signTransaction = async () => {
        if (!connected) {
            await connect()
        }

        const witnesses = await nami.signTx(transaction)
        setWitnesses(witnesses)
    }

    const submitTransaction = async () => {
        let netId = await nami.getNetworkId();
        const txHash = await nami.submitTx({
            transactionRaw: transaction,
            witnesses: [witnesses],

            networkId: netId.id
        })
        setTxHash(txHash)

    }

    const createPolicy = async () => {
        console.log(policyExpiration)
        try {
            await nami.enable()


            const myAddress = await nami.getHexAddress();
            
            let networkId = await nami.getNetworkId()
            const newPolicy = await nami.createLockingPolicyScript(myAddress, networkId.id, policyExpiration)

            setPolicy(newPolicy)
            setComplexTransaction((prevState) => 
            {const state = prevState;   state.recipients[0].mintedAssets[0].policyId = newPolicy.id; 
                state.recipients[0].mintedAssets[0].policyScript = newPolicy.script; 
                state.metadata = {"721": {[newPolicy.id]: 
                    {[state.recipients[0].mintedAssets[0].assetName]: {name: "MyNFT", description: "Test NFT", image: "ipfs://QmUb8fW7qm1zCLhiKLcFH9yTCZ3hpsuKdkTgKmC8iFhxV8"}} }};
                 return {...state}})

        } catch (e) {
            console.log(e)
        }

    }

    return (<>
        <div className="container">
            <h1 style={{ textAlign: "center" }}>Introduction to basic Nami wallet functionalities</h1>
            <p>In these small examples we demonstrate basic Nami wallet functionalities.</p>
            <p>If you do not have Nami Wallet installed you can download Nami Wallet <a href="https://namiwallet.io/" target="_blank"> here</a>.</p>
            <div className="container">
                <div className="row" >
                    <h1> 1. Connect your website to Nami Wallet</h1>
                </div>
                <div className="row" >
                    <button className={`button ${connected ? "success" : ""}`} onClick={connect} > {connected ? "Connected" : "Connect to Nami"} </button>
                </div>
                <div className="row" >
                    <h1> 2. Retrieve your Nami wallet address</h1>
                </div>
                <div className="row" >
                    <button className={`button ${address ? "success" : ""}`} onClick={getAddress}> Get Your Address </button>
                    {address && <div className="item address">
                        <p>My Address:  {address} </p>
                    </div>}
                </div>
                <div className="row" >
                    <h1> 3. Retrieve your balance and NFTs</h1>
                </div>
                <div className="row" >
                    <button className={`button ${balance ? "success" : ""}`} onClick={getBalance}> Get Your Balance and NFTs </button>
                    {balance && <> <div className="column" >
                        <div className="item balance"><p>Balance ₳:  {balance / 1000000.} </p>

                        </div>


                        {nfts.map((nft) => {
                            return <><div className="item nft"><p>unit: {nft.unit}</p>
                                <p>quantity: {nft.quantity}</p>
                                <p>policy: {nft.policy}</p>
                                <p>name: {nft.name}</p>
                                <p>fingerprint: {nft.fingerprint}</p>
                            </div>
                            </>

                        })}
                    </div>
                    </>
                    }

                </div>
                <div className="row" >
                    <h1> 4. Build Transaction</h1>
                </div>
                <div className="row" >
                    <button className={`button ${(transaction) ? "success" : ""}`} onClick={() => { if (amount && recipientAddress) buildTransaction() }}> Build Transaction</button>
                    <div className="column" >



                        <div className="item address"><p> Amount</p><input style={{ width: "400px", height: "30px", }}
                            value={amount}
                            onChange={(event) => setAmount(event.target.value.toString())} /></div>

                        <div className="item address"><p> Recipient Address</p>
                            <input style={{ width: "400px", height: "30px" }}
                                value={recipientAddress}
                                onChange={(event) => setRecipientAddress(event.target.value.toString())} /></div>

                    </div>




                </div>

                <div className="row" >
                    <h1> 5. Sign Transaction</h1>
                </div>
                <div className="row" >
                    <button className={`button ${(witnesses) ? "success" : ""}`} onClick={() => { if (transaction) signTransaction() }}> Sign Transaction</button>
                    <div className="column" >






                    </div>
                </div>
                <div className="row" >
                    <h1> 6. Submit Transaction</h1>
                </div>
                <div className="row" >
                    <button className={`button ${(txHash) ? "success" : ""}`} onClick={() => { console.log(witnesses); if (witnesses) submitTransaction() }}> Submit Transaction</button>

                    <div className="column" >
                        <div className="item address">
                            <p>TxHash:  {txHash} </p>
                        </div>





                    </div>

                </div>
                <div className="row" >
                    <h1> 7. Create Policy Script</h1>
                </div>
                <div className="row" >
                    <button className={`button ${(policy) ? "success" : ""}`} onClick={() => { if (policyExpiration) createPolicy() }}> Create Policy</button>

                    <div className="column" >
                    <p>Set Policy Expriaton Date: <DateTimePicker
                               
                               onChange={setPolicyExpiration}
                               value={policyExpiration}
                               minDate={new Date()}
                           />
                           </p>
                        <div className="item address">
                        
                            <p>policyId:  {policy?.id} </p>
                            <p>policyScript:  {policy?.script} </p>
                            <p>paymentKeyHash:  {policy?.paymentKeyHash} </p>
                            <p>ttl:  {policy?.ttl} </p>
                        </div>





                    </div>

                </div>



            </div>

            

                <div className="row" >
                    <h1> 8. Build Full Transaction (incl. Minting)</h1>
                </div>
                <div className="row" >
                    <button className={`button ${(complextxHash) ? "success" : ""}`} onClick={ buildFullTransaction}> Build Transaction</button>
                    <div className="column" >


                    <div className="item address">
                            <p>Complex TxHash:  {complextxHash} </p>
                        </div>

                        <div className="item address"><p> Recipients Input</p><textarea style={{ width: "400px", height: "500px", }}
                            value={JSON.stringify(complexTransaction)}
                            onChange={(event) => 
                            {setComplexTransaction((prevState) =>( {...JSON.parse(event.target.value)}))}} />
                            </div>

                      

                   
                    <div className="item address"><p>Transaction Hash: </p> <textarea style={{ width: "400px", height: "500px", }} 
                    value={builtTransaction} />

                    </div>
                    </div>



                </div>
            
            
        </div>

    </>
    )
}
*/
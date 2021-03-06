import React,{useState, useEffect} from 'react'
import './App.css';
import 'remixicon/fonts/remixicon.css'
import polygonLogo from './assets/matic-logo.png';
import TwitterLogo from './assets/twitter-app.png';
import InstaLogo from './assets/ig-instagram.png';
import LinkedinLogo from './assets/linkedin-app.png';
import Chekclogo from './assets/check.png';
import ethLogo from './assets/eth-logo.png';
import {ethers} from "ethers";
import contractAbi from './utils/contractABI.json';
import { networks } from './utils/netwroks';
const tld = '.dope';
const CONTRACT_ADDRESS = '0xd11d553266221236b56Cb22ea870E038F930030B';
const TWITTER_HANDLE = "TanmaySinghKush";
const TWITTER_LINK =  `https://twitter.com/${TWITTER_HANDLE}`;
const LinkedIn_Link = `https://www.linkedin.com/in/tanmay-singh-760962128/`;
const Insta_Link = 'https://www.instagram.com/tanmay888/'

const App = () => {

  const [currentAccount, setCurrentAccount] = useState('');
  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [network, setNetwork] = useState('');
  const [editing, setEditing] = useState(false);
  const [mints, setMints] = useState([]);
  const [loading, setLoading] = useState(false);

     

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }
			
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }



  const checkIfWalletIsConnected =  async () => {
		// First make sure we have access to window.ethereum
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have MetaMask!");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

  const accounts = await ethereum.request({method: 'eth_accounts'});

  if (accounts.length !== 0) {
    const account = accounts[0];
    console.log("found an authorized account", account);
     setCurrentAccount(account);
  } else {
    console.log("no authorized account found");
  }
    
    const chainId = await ethereum.request({method: 'eth_chainId'});
        setNetwork(networks[chainId]);
        ethereum.on('chainChanged', handleChainChanged);

        function handleChainChanged(_chainId) {
          window.location.reload();
        }

  }




  const renderNotConnectedContainer = () =>  {
   
    if(currentAccount){
      return <div className="right">
         {currentAccount ? <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />: null }
   
         {currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> :  null}
      </div>
    }else{
       return <button className='connect-wallet-button' onClick={connectWallet}>Connect Wallet</button>
    }

  };

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
        });
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {	
                  chainId: '0x13881',
                  chainName: 'Polygon Mumbai Testnet',
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                  nativeCurrency: {
                      name: "Mumbai Matic",
                      symbol: "MATIC",
                      decimals: 18
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    } 
  }


  const fetchMints = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        // You know all this
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
          
        // Get all the domain names from our contract
        const names = await contract.getAllNames();
          
        // For each name, get the record and the address
        const mintRecords = await Promise.all(names.map(async (name) => {
        const mintRecord = await contract.records(name);
        const owner = await contract.domains(name);
        return {
          id: names.indexOf(name),
          name: name,
          record: mintRecord,
          owner: owner,
        };
      }));
  
      console.log("MINTS FETCHED ", mintRecords);
      setMints(mintRecords);
      }
    } catch(error){
      console.log(error);
    }
  }


  useEffect(() => {
    if (network === 'Polygon Mumbai Testnet') {
      fetchMints();
    }
  }, [currentAccount, network]);

  

  const renderInputForm = () =>{
    
    if(network !== 'Polygon Mumbai Testnet') {
     return (
      <div className="connect-wallet-container">
        <p className='connect-text'>Please connect to the Polygon mumbai testnet</p>
        <button className='switch-button' onClick={switchNetwork}>Click here to switch</button>
      </div>
      )
    }

    return (
    
      <div className="form-container">

      <p id='mint-domain-text'>Mint your Domain here ????</p>
      <div className="first-row">   
        <input
          type="text"
          value={domain}
          placeholder='domain'
          onChange={e => setDomain(e.target.value)}
        />
        <p className='tld'> {tld} </p>
      </div>

      <input
        type="text"
        value={record}
        placeholder='you are dope'
        onChange={e => setRecord(e.target.value)}
      />

      {editing ? (
      <div className="button-container">
        <button className="cta-button mint-button" disabled={null} onClick={updateDomain}>
          Set record
        </button>
        <button className="cta-button mint-button" onClick={()=> 
         {setEditing(false)}}>
          Cancel
        </button>
    </div>
    ) : (

      <div>
        {loading ?  <div className='loader-wrapper'> <div className='loader'><div className='loader loader-inner'></div></div></div> :   <button className='mint-button' disabled={null} onClick={mintDomain}>
               Mint
             </button> }
      </div>

    )}
  
    </div>

    );
  }



  useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

  
  
  const updateDomain = async () => {
    if (!record || !domain) { return }
    setLoading(true);
    console.log("Updating domain", domain, "with record", record);
      try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
  
        let tx = await contract.setRecord(domain, record);
        await tx.wait();
        console.log("Record set https://mumbai.polygonscan.com/tx/"+tx.hash);
  
        fetchMints();
        setRecord('');
        setDomain('');
      }
      } catch(error) {
        console.log(error);
      }
    setLoading(false);
  }
  

  const renderMints = () => {
    if (currentAccount && mints.length > 0) {
      return (
        <div className="mint-container">
          <p className="subtitle"> Recently minted domains!</p>
          <div className="mint-list">
            { mints.map((mint, index) => {
              return (
                <div className="mint-item" key={index}>
                  <div className='mint-row'>
                    <a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
                      <p className="underlined">{' '}{mint.name}{tld}{' '}</p>
                    </a>
                    {/* If mint.owner is currentAccount, add an "edit" button*/}
                    { mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                      <button className="edit-button" onClick={() => editRecord(mint.name)}>
                        <img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
                      </button>
                      :
                      null
                    }
                  </div>
            <p className='record'> {mint.record} </p>
          </div>)
          })}
        </div>
      </div>);
    }
  };

   
  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain) { return }
    // Alert the user if the domain is too short
    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long');
      return;
    }
    // Calculate price based on length of domain (change this to match your contract)	
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
    console.log("Minting domain", domain, "with price", price);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        setLoading(true);
        let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
  
        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
          
          // Set the record for the domain
          tx = await contract.setRecord(domain, record);
          await tx.wait();
  
          console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
          
          setRecord('');
          setDomain('');
          setLoading(false);
        }
        else {
          alert("Transaction failed! Please try again");
        }
      }
    }
    catch(error){
      console.log(error.data);
       setLoading(false);

    }
  }


    const mainContent = () => {

      return (
             
    <main className='main-content'>

       <div className='main-content-container bg-blur'>        
        {currentAccount && renderInputForm()}
       </div>  
       
       <div className='mint-content'>
         {mints && renderMints()}
       </div>
      
    </main>

      )
    }



  const welcomeContent = () => {
      return (
        <div className="middle-content">
            <h1>Welcome to <span>Dope</span> Domains</h1>    
            <img src={Chekclogo} className="welcome-image"/>
        </div>
      )
  }



  const editRecord = (name) => {
    console.log("Editing record for", name);
    setEditing(true);
    setDomain(name);
  }


  return (
    <div className="container">
         <nav className='nav-container'>
           <p className='logo-text'><span>Dope</span>Domains</p>
            {renderNotConnectedContainer()}
         </nav>

    
           {currentAccount ? mainContent(): welcomeContent()}

          
        <div className='icons-wrapper'>
        
            <a className='footer-content1' href={Insta_Link}><i className='ri-instagram-line icon'></i></a> 
            <a  className='footer-content2'
                    href={TWITTER_LINK}><i className='ri-twitter-line icon'></i></a>  
            <a className='footer-content3' href={LinkedIn_Link}><i className='ri-linkedin-box-line icon'></i></a>     
  
        </div>   
        
    </div>
);
}


export default App;
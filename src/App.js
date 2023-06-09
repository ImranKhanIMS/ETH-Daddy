import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Search from './components/Search'
import Domain from './components/Domain'

// ABIs
import ETHDaddy from './abis/ETHDaddy.json'

// Config
import config from './config.json';

// tokens convertor
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

function App() {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");

  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)

  const [ethDaddy, setEthDaddy] = useState(null)
  const [domains, setDomains] = useState([])

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()

    const ethDaddy = new ethers.Contract(config[network.chainId].ETHDaddy.address, ETHDaddy, provider)
    setEthDaddy(ethDaddy)

    const maxSupply = await ethDaddy.maxSupply()
    const domains = []
    
    for (var i = 1; i<= maxSupply; i++) {
      const domain = await ethDaddy.getDomain(i)
      domains.push(domain)
    }

    setDomains(domains)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ 'method': 'eth_requestAccounts' })
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)
    })
  }

  // Withdraw Balence
  const withdrawBalence = async () => {
    const signer = await provider.getSigner()
    const transaction = await ethDaddy.connect(signer).withdraw()
    await transaction.wait()
  }

  // List Domain
  const listDomain = async () => {
    // console.log(name,' ', cost);
    const signer = await provider.getSigner()
    const transaction = await ethDaddy.connect(signer).list(name, tokens(cost))
    await transaction.wait()

    loadBlockchainData()
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <Search />

      <div className='cards__section'>

        <h2 className='cards__title'>Why you need a domain name.</h2>
        <p className='cards__description'>
          Own your custom username, use it across services, and
          be able to store on avatar and other profile data.
        </p>

        <hr />

        <div className='cards'>
          {domains.map((domain, index) => (
            <Domain domain={domain} ethDaddy={ethDaddy} provider={provider} id={index+1} key={index} />
          ))}
        </div>

            {account == '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'?
                        <>
                              <br />
                          <button type='button' className='card__button' onClick={withdrawBalence}> Withdraw All Balence</button>
                              <br /> <br />

                          <div>
                            <input type='text' onChange={(e) => setName(e.target.value)} value={name} />
                            <input type='text' onChange={(e) => setCost(e.target.value)} value={cost}/>
                            <button type='button' className='card__button' onClick={listDomain}>Add Domain</button>
                          </div>
                        </>
             : ''}

      </div>

    </div>
  );
}

export default App;
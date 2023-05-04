// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  const NAME = 'Imran Khan'
  const SYMBOL = 'ETHD'

  const ETHDaddy = await ethers.getContractFactory('ETHDaddy')
  const ethDaddy = await ETHDaddy.deploy('Imran Khan', 'ETHD')
  await ethDaddy.deployed();

  console.log(`Deployed Domain Contract at: ${ethDaddy.address}\n`)

  const names = ['imran.eth', 'haris.eth', 'owais.eth', 'babrak.eth', 'hashir.eth', 'haneef.eth', 'mohsin.eth', 'rehan.eth', 'basit.eth', 'jawad.eth', 'jameel.eth']
  const costs = [tokens(10), tokens(20), tokens(15), tokens(10), tokens(12), tokens(12), tokens(10), tokens(10), tokens(18), tokens(20), tokens(30)]

  for (var i=0; i<11; i++) {
    const transaction = await ethDaddy.connect(deployer).list(names[i], costs[i])
    await transaction.wait()

    console.log(`Listed Domains ${i+1}: ${names[i]}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

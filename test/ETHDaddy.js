const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("ETHDaddy", () => {

  let ethDaddy
  let deployer, owner1

  const NAME = 'Imran Khan'
  const SYMBOL = 'ETHD'

  beforeEach(async ()  => {
    [deployer, owner1] = await ethers.getSigners();

    const ETHDaddy = await ethers.getContractFactory('ETHDaddy')
    ethDaddy = await ETHDaddy.deploy('Imran Khan', 'ETHD')

    // List Domain
    const transaction = await ethDaddy.connect(deployer).list('imran.eth', tokens(10))
  })
  
  describe("Deployment", () => {
    it("Name is set to Imran Khan", async () => {
      let result = await ethDaddy.name()
      expect(result).to.eq(NAME)
    })
  
    it("Symbol is set to ETHD", async () => {
      let result = await ethDaddy.symbol()
      expect(result).to.eq(SYMBOL)
    })

    it("Address of owner is Deployer", async () => {
      let result = await ethDaddy.owner()
      expect(result).to.eq(deployer.address)
    })

    it("Returns the max supply", async () => {
      let result = await ethDaddy.maxSupply()
      expect(result).to.eq(1)
    })

    it("Returns the total supply", async () => {
      let result = await ethDaddy.totalSupply()
      expect(result).to.eq(0)
    })
  })

  describe("Domain", () => {
    it("Returns domain attributes", async () => {
      let result = await ethDaddy.domains(1)
      expect(result.name).to.eq("imran.eth")
      expect(result.cost).to.eq(tokens(10))
      expect(result.isOwned).to.eq(false)
    })
  })


  describe("Minting", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", "ether")

    beforeEach(async () => {
      const transaction = await ethDaddy.connect(owner1).mint(ID, {value: AMOUNT})
      await transaction.wait()
    })

    it("Update the owner", async () => {
      let owner = await ethDaddy.ownerOf(ID)
      expect(owner).to.eq(owner1.address)
    })

    it("Update the domain status", async () => {
      let result = await ethDaddy.getDomain(ID)
      expect(result.isOwned).to.eq(true)
    })

    it("Update the contract balance", async () => {
      let result = await ethDaddy.getBalance()
      expect(result).to.eq(AMOUNT)
    })

    it("Returns the total supply after minting", async () => {
      let result = await ethDaddy.totalSupply()
      expect(result).to.eq(1)
    })
  })
  

  describe("Withdrawing", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", "ether")

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await ethDaddy.connect(owner1).mint(ID, {value: AMOUNT})
      await transaction.wait()

      transaction = await ethDaddy.connect(deployer).withdraw()
      await transaction.wait()
    })

    it ('Update the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it ('Update the contract balance', async () => {
      const result = await ethDaddy.getBalance()
      expect(result).to.be.equal(0)
    })
  })

})

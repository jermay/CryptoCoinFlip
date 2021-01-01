const BN = web3.utils.BN;
const MockToken = artifacts.require("MockToken");

contract('MockToken', (accounts) => {
  let contractInstance;
  const testAccount = accounts[1];

  describe('init', ()=>{
    it('should be deployed', async ()=>{
      const deployedInstance = await MockToken.deployed();
      expect(deployedInstance).to.exist;
    });
  });

  beforeEach(async ()=>{
    contractInstance = await MockToken.new();
  });

  describe('mint', ()=>{
    it('should mint the specified number of tokens to the given address', async()=>{
      const expAmount = new BN('100');
      await contractInstance.mint(testAccount, expAmount);

      const result = await contractInstance.balances(testAccount);
      expect(result.toString(10)).to.equal(expAmount.toString(10));
    });
  });

  describe('balanceOf', () => {
    it('should return the balance of the given account', async() =>{
      const expAmount = new BN('100');
      await contractInstance.mint(testAccount, expAmount);

      const result = await contractInstance.balanceOf(testAccount);

      expect(result.toString(10)).to.equal(expAmount.toString(10));
    });
  })
  
});

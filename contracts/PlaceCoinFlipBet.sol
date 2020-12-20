pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";
import "./Ownable.sol";

contract PlaceCoinFlipBet is VRFConsumerBase, Ownable {
    using SafeMathChainlink for uint256;

    struct Bet {
        address player;
        bool betOn;
        uint256 amount;
    }

    // oracle properties
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 internal linkPriceInWei;

    // betting
    mapping(address => uint256) balances;
    mapping(bytes32 => Bet) bets; // queryId => Bet

    event BetPlaced(
        bytes32 indexed id,
        address indexed player,
        uint256 amount,
        bool betOn
    );
    event BetResult(
        bytes32 indexed id,
        address indexed player,
        bool flipResult,
        uint256 payout
    );

    constructor(address vrfCoordinatorAddress, address linkTokenAddress)
        public
        VRFConsumerBase(
            vrfCoordinatorAddress,
            linkTokenAddress
        )
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10**18; // 0.1 LINK
        linkPriceInWei = 0.02 ether; // 0.02 ETH/LINK
    }

    function getMyBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function getBet(bytes32 id)
        public
        view
        returns (
            address player,
            bool betOn,
            uint256 amount
        )
    {
        return (bets[id].player, bets[id].betOn, bets[id].amount);
    }

    function placeBet(bool betOn, uint256 amount) public {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        require(amount <= maxBet(), "bet above max");
        require(
            balances[msg.sender] >= amount.add(getOracleCost()),
            "insufficient funds"
        );
        require(amount >= minBet(), "bet below min");

        bytes32 queryId = _getRequestId();
        bets[queryId] = Bet(msg.sender, betOn, amount);
        emit BetPlaced(queryId, msg.sender, amount, betOn);

        flipCoin();
    }

    function _getRequestId() internal view returns (bytes32) {
        uint256 nonce = nonces[keyHash];
        uint256 preSeed = makeVRFInputSeed(
            keyHash,
            block.timestamp,
            address(this),
            nonce
        );
        return makeRequestId(keyHash, preSeed);
    }

    function minBet() public pure returns (uint256) {
        return 0.001 ether;
    }

    function maxBet() public view returns (uint256) {
        return balances[owner] / 100;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        // 0 = heads = false
        // 1 = tails = true
        bool result = (randomness % 2) == 1;
        Bet memory bet = bets[requestId];
        uint256 payoutAmt = payout(bet, result);
        emit BetResult(requestId, bet.player, result, payoutAmt);
    }

    function payout(Bet memory bet, bool flipResult) private returns (uint256) {
        if (bet.betOn != flipResult) {
            balances[bet.player] = balances[bet.player].sub(bet.amount).sub(
                getOracleCost()
            );
            balances[owner] = balances[owner].add(bet.amount);
            return 0;
        }

        uint256 grossWinnings = bet.amount.mul(2);
        uint256 netWinnings = grossWinnings.sub(getOracleCost());
        balances[owner] = balances[owner].sub(grossWinnings);
        balances[bet.player] = balances[bet.player].add(netWinnings);

        return netWinnings;
    }

    function setLinkPrice(uint256 priceInWei) public onlyOwner {
        require(priceInWei > 0, "must be greater than zero");
        linkPriceInWei = priceInWei;
    }

    function getOracleCost() public view returns (uint256) {
        return fee * (linkPriceInWei / 10e18);
    }

    function flipCoin() public returns (bytes32) {
        return requestRandomness(keyHash, fee, block.timestamp);
    }

    function addFunds() external payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function withdrawFunds(uint256 amount) external {
        require(amount <= address(this).balance, "exceeds contract balance");
        require(amount <= balances[msg.sender], "exceeds player balance");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        msg.sender.transfer(amount);
    }

    receive() external payable {
        balances[owner] = balances[owner].add(msg.value);
    }

    function destroy() external onlyOwner {
        selfdestruct(owner);
    }
}

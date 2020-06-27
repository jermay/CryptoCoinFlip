pragma solidity 0.5.12;
import "./provableAPI.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract PlaceCoinFlipBet is Ownable, usingProvable {

    using SafeMath for uint;

    struct Bet {
        address player;
        bool betOn;
        uint amount;
    }

    mapping(address => uint) balances;
    mapping(bytes32 => Bet) bets; // queryId => Bet

    event BetPlaced(bytes32 indexed id, address indexed player, uint amount, bool betOn);
    event BetResult(bytes32 indexed id, address indexed player, bool flipResult, uint payout);

    // constructor() public {
    //     flipCoin();
    // }

    function getMyBalance() public view returns (uint) {
        return balances[msg.sender];
    }

    function getBet(bytes32 id) public view returns (address player, bool betOn, uint amount) {
        return (bets[id].player, bets[id].betOn, bets[id].amount);
    }

    function placeBet(bool betOn, uint amount) public {
        require(amount <= maxBet(), 'bet above max');
        require(balances[msg.sender] >= amount.add(getOracleCost()), 'insufficient funds');
        require(amount >= minBet(), 'bet below min');

        bytes32 queryId = flipCoin();
        bets[queryId] = Bet(msg.sender, betOn, amount);
        emit BetPlaced(queryId, msg.sender, amount, betOn);
    }

    function minBet() public pure returns(uint) {
        return 0.001 ether;
    }

    function maxBet() public view returns(uint) {
        return balances[owner] / 100;
    }

    function __callback(bytes32 _queryId, string memory _result) public {
        bool result = uint(keccak256(abi.encodePacked(_result))) % 2 == 0;
        Bet memory bet = bets[_queryId];
        uint payoutAmt = payout(bet, result);
        emit BetResult(_queryId, bet.player, result, payoutAmt);
    }

    function payout(Bet memory bet, bool flipResult) private returns(uint) {
        if (bet.betOn != flipResult) {
            balances[bet.player] = balances[bet.player]
                .sub(bet.amount)
                .sub(getOracleCost());
            balances[owner] = balances[owner]
                .add(bet.amount);
            return 0;
        }

        uint grossWinnings = bet.amount.mul(2);
        uint netWinnings = grossWinnings
            .sub(getOracleCost());
        balances[owner] = balances[owner]
            .sub(grossWinnings);
        balances[bet.player] = balances[bet.player]
            .add(netWinnings);

        return netWinnings;
    }

    function getOracleCost() internal returns(uint) {
        return provable_getPrice("RANDOM");
    }

    // tails = true, heads = false
    function flipCoin() public returns (bytes32) {
        return provable_newRandomDSQuery(0, 1, 200000);
    }

    function addFunds() external payable {
        balances[msg.sender] = balances[msg.sender]
            .add(msg.value);
    }

    function withdrawFunds(uint amount) external {
        require(amount <= balances[msg.sender], 'withdraw exceeds balance');
        balances[msg.sender] = balances[msg.sender]
            .sub(amount);
        msg.sender.transfer(amount);
    }

    function () external payable {
        balances[owner] = balances[owner]
            .add(msg.value);
    }

    function destroy() external onlyOwner {
        selfdestruct(owner);
    }
}

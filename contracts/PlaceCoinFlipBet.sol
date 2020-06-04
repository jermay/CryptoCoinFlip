pragma solidity 0.5.12;
import './provableAPI.sol';
import './Ownable.sol';

contract PlaceCoinFlipBet is Ownable, usingProvable {

    struct Bet {
        address player;
        bool betOn;
        uint amount;
    }

    mapping(address => uint) balances;
    mapping(bytes32 => Bet) bets; // queryId => Bet

    event BetPlaced(bytes32 id, address player, uint amount, bool betOn);
    event BetResult(bytes32 id, bool flipResult, uint payout);

    // constructor() public {
    //     provable_setProof(proofType_Ledger);
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
        require(amount <= balances[msg.sender], 'bet above balance');
        require(amount >= minBet(), 'bet below min');

        // Get test queryId to store the bet before flipCoin() invokes the callback.
        // When provableAPI is called can return queryId from flipCoin()
        // as it won't be invoking the callback directly
        // (and trying to access the bet info before it's recorded)
        bytes32 queryId = getQueryId();
        bets[queryId] = Bet(msg.sender, betOn, amount);
        emit BetPlaced(queryId, msg.sender, amount, betOn);
        flipCoin();
    }

    function minBet() public pure returns(uint) {
        return 0.001 ether;
    }

    function maxBet() public view returns(uint) {
        return balances[owner] / 100;
    }

    function __callback(bytes32 _queryId, string memory _result) public {
        bool result = uint(keccak256(abi.encodePacked(_result))) % 2 == 0;
        uint payoutAmt = payout(_queryId, result);
        emit BetResult(_queryId, result, payoutAmt);
    }

    function payout(bytes32 queryId, bool flipResult) private returns(uint) {
        Bet memory bet = bets[queryId];
        if (bet.betOn != flipResult) {
            balances[bet.player] -= bet.amount;
            balances[owner] += bet.amount;
            return 0;
        }

        uint winnings = bet.amount * 2;
        balances[owner] -= winnings;
        balances[bet.player] += winnings;

        return winnings;
    }

    // tails = true, heads = false
    function flipCoin() public returns (bytes32) {
        bytes32 queryId = getQueryId();
        string memory random = now % 2 == 0 ? "0" : "1";
        __callback(queryId, random);

        return queryId;
    }

    function getQueryId() internal view returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(msg.sender)));
    }

    function addFunds() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdrawFunds(uint amount) external {
        require(amount <= balances[msg.sender], 'withdraw exceeds balance');
        balances[msg.sender] -= amount;
        msg.sender.transfer(amount);
    }

    function () external payable {
        balances[owner] += msg.value;
    }

    function destroy() external onlyOwner {
        selfdestruct(owner);
    }
}

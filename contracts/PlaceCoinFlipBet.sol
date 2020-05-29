pragma solidity 0.5.12;
import './Ownable.sol';

contract PlaceCoinFlipBet is Ownable {

    mapping(address => uint) balances;
    mapping(uint => address) bets; // queryId => player address

    event BetPlaced(uint id, address player, uint amount, bool betOn);
    event BetResult(uint id, bool flipResult, uint payout);
    uint private betId = 0;

    function getMyBalance() public view returns (uint) {
        return balances[msg.sender];
    }

    function placeBet(bool betOn, uint amount) public returns (bool) {
        require(amount <= maxBet(), 'bet above max');
        require(amount <= balances[msg.sender], 'bet above balance');
        require(amount >= minBet(), 'bet below min');
        bool result = flipCoin();
        uint payoutAmt = payout(msg.sender, betOn, result, amount);
        emit BetResult(++betId, result, payoutAmt);
        return true;
    }

    function minBet() public pure returns(uint) {
        return 0.001 ether;
    }

    function maxBet() public view returns(uint) {
        return balances[owner] / 100;
    }

    function payout(address player, bool betOn, bool flipResult, uint betAmount) private returns(uint) {
        if (betOn != flipResult) {
            balances[player] -= betAmount;
            balances[owner] += betAmount;
            return 0;
        }

        uint winnings = betAmount * 2;
        balances[owner] -= winnings;
        balances[player] += winnings;

        return winnings;
    }

    // tails = true, heads = false
    function flipCoin() public view returns (bool) {
        return (now % 2) == 0;
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

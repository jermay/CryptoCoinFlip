pragma solidity ^0.6.6;

contract Ownable {
    address payable public owner;

    modifier onlyOwner(){
        require(msg.sender == owner, 'Sender must be owner');
        _;
    }

    constructor() public{
        owner = msg.sender;
    }
}

pragma solidity >=0.4.21 <0.6.0;

contract Storage {
	address public owner;

	modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

	constructor() public {
        owner = msg.sender;
	}

	function withdraw(uint amount) onlyOwner public returns(bool) {
        require(amount <= getBalance());
        address(uint160(owner)).transfer(amount);
        return true;
    }

    function getBalance() public returns(uint) {
    	return address(this).balance;
	}

	function() payable external {
	
	}
}
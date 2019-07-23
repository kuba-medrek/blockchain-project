pragma solidity >=0.4.21 <0.6.0;

contract Storage {
	address public owner;

	constructor() public {
        owner = msg.sender;
	}

	function withdrawEth(uint amount) public payable {
		require (msg.sender == owner);
        require(amount <= getBalance());
        msg.sender.transfer(amount);
    }

	function getBalance() public view returns(uint256) {
		return address(this).balance;
	}

	function getPaid() public payable {
	}

	function() payable external {
	}
}
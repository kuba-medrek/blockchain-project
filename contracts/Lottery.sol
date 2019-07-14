pragma solidity >=0.4.21 <0.6.0;

// 1 ether = 1000000000000000000 wei

contract Lottery {
	mapping (address => uint) public players_inputs;
	address[] public players;
	address public owner;
	enum LotteryStatus {Open, Closed}
	LotteryStatus state;

    constructor() public {
        owner = msg.sender;
        state = LotteryStatus.Open;
	}

	function getNumberOfPlayers() public returns(uint256) {
		return players.length;
	}

	function getBalance() public returns(uint256) {
		address(this).balance;
	}

	function play() public payable {
		require(msg.value > 0.001 ether);
		require(state == LotteryStatus.Open);

		players_inputs[msg.sender] = msg.value;
		players.push(msg.sender);
	}

	function chooseWinner() public {
		require(msg.sender == owner);
		require(getBalance() > 1.00 ether);
	}

	function cleanMapping() internal {
		for(uint i=0; i < players.length; ++i){
			players_inputs[players[i]] = 0;
		}
		players.length = 0;
	}

	function boom(address payable recipient) public {
		require(msg.sender == owner);
		selfdestruct(recipient);
	}

	function random(uint scope) private view returns (uint) {
		return uint(keccak256(abi.encodePacked(now, block.difficulty, players))) % scope;
 	}
}
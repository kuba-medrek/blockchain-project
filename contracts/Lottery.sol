pragma solidity >=0.4.21 <0.6.0;

// 1 ether = 1000000000000000000 wei

import "./Storage.sol";

contract Lottery {
	address private ethStorage;
	address[] public players;
	address public owner;
	uint public tickets;
	uint public ticketPrice;
	uint public gamesPlayed;
	address[] public winners;
	enum LotteryStatus {Open, Closed}
	LotteryStatus state;

    constructor(address secondContract) public {
    	ethStorage = secondContract;
        owner = msg.sender;
        tickets = 15;
        state = LotteryStatus.Open;
        ticketPrice = 1 ether;
        gamesPlayed = 0;
	}

	function getNumberOfPlayers() public returns(uint256) {
		return players.length;
	}

	function getBalance() public view returns(uint256) {
		return address(this).balance;
	}

	function play(uint tickets_bought) public payable returns(bool) {
		require(state == LotteryStatus.Open);
		require(tickets_bought <= tickets);

		tickets -= tickets_bought;

		for(uint i=0; i < tickets_bought; ++i){
			players.push(msg.sender);
		}

		if(tickets == 0) chooseWinner();
		return true;
	}

	function chooseWinner() public {
		state = LotteryStatus.Closed;
		uint winner_number = random(players.length);
		address payable winner = make_payable(players[winner_number]);
		winners.push(players[winner_number]);
		winner.transfer(getBalance() * 7/10);
		make_payable(ethStorage).transfer(getBalance());
		restartLottery();
	}

	function restartLottery() internal {
		players.length = 0;
		tickets = 15;
		gamesPlayed += 1;
		state = LotteryStatus.Open;
	}

	function destroy_contract(address payable recipient) public {
		require(msg.sender == owner);
		selfdestruct(recipient);
	}

	function random(uint scope) public view returns (uint) {
		return uint(keccak256(abi.encodePacked(now, block.difficulty, players))) % scope;
 	}

 	function make_payable(address x) internal pure returns (address payable) {
      return address(uint160(x));
  	}
}
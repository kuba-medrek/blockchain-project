pragma solidity >=0.4.25 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Lottery.sol";

contract TestLottery {
	function testPlayers() public {
		Lottery lot = Lottery(DeployedAddresses.Lottery());
		Assert.equal(lot.getNumberOfPlayers(), 0, "Players in new contract were not empty");
	}
}
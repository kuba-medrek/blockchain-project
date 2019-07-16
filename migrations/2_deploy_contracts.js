var Storage = artifacts.require("Storage");
var Lottery = artifacts.require("Lottery");

module.exports = function(deployer) {
	deployer.deploy(Storage)
	.then(() => Storage.deployed())
	.then(() => deployer.deploy(Lottery, Storage.address));
}
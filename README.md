# Blockchain project

This application makes it possible to play lottery on Ethereum network with use of smart contracts.

## Contracts

Contracts are set up at [/contracts] directory. Number of tokens in game, token price and reward percentage could be changed.

Run `truffle migrate` to deploy contracts.

## User interface

User interface at [/UI] directory is web application connected with wallet, allowing user to play deployed lottery.

On server side software use [/build/Lottery.json] to read address etc.
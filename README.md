# Decentralized Voting Application

This is a demo application to implement voting in solidity smart contract using ReactJS. 

[Youtube Tutorial](https://youtu.be/eCn6mHTpuM0)

## Installation

After you cloned the repository, you want to install the packages using

```shell
npm install
```

You first need to compile the contract and upload it to the blockchain network. Run the following commands to compile and upload the contract.

```shell
npx hardhat compile
npx hardhat run --network volta scripts/deploy.js
```

Once the contract is uploaded to the blockchain, copy the contract address and copy it in the .env file. You can also use another blockchain by writing the blockchain's endpoint in hardhat-config.

Once you have pasted your private key and contract address in the .env file, simply run command

```shell
npm start
```

# Voting System Contract

This Solidity smart contract implements a simple voting system where users can cast votes for different candidates. The contract allows adding new candidates, casting votes, and querying the current status of the voting process.

## Key Components

### Structs

- **Candidate**: Represents a candidate in the election. It includes:
  - `name`: A string representing the candidate's name.
  - `voteCount`: An unsigned integer representing the number of votes received by the candidate.

### State Variables

- **candidates**: An array of `Candidate` structs that stores all registered candidates.
- **owner**: The address of the contract deployer who has exclusive permissions to manage the contract.
- **voters**: A mapping that tracks whether an address has already voted.
- **votingStart** and **votingEnd**: Timestamps indicating the start and end times of the voting period.

### Constructor

The constructor initializes the contract with:
- An array of candidate names (`_candidateNames`) and a duration for the voting period (`_durationInMinutes`). It sets up the initial state of the contract, including registering the initial candidates and setting the voting start time to the current block timestamp.

### Functions

#### `addCandidate(string memory _name)`

Allows the contract owner to add a new candidate to the voting pool. Only callable by the contract owner due to the `onlyOwner` modifier.

#### `vote(uint256 _candidateIndex)`

Enables a voter to cast a vote for a specific candidate by providing the candidate's index in the `candidates` array. Checks ensure that the voter has not already voted and that the candidate index is valid.

#### `getAllVotesOfCandidates()`

Returns an array of all candidates and their vote counts. Useful for viewing the current standings after voting has concluded.

#### `getVotingStatus()`

Checks if the current block timestamp falls within the voting period, returning a boolean value indicating whether voting is currently active.

#### `getRemainingTime()`

Calculates and returns the remaining time until the voting period ends. Returns 0 if voting has already ended.


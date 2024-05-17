import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAbi, contractAddress } from "./Constant/constant";
import Login from "./Components/Login";
import Finished from "./Components/Finished";
import Connected from "./Components/Connected";
import "./App.css";

function App() {
	const [provider, setProvider] = useState(null);
	const [account, setAccount] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [votingStatus, setVotingStatus] = useState(true);
	const [remainingTime, setremainingTime] = useState("");
	const [candidates, setCandidates] = useState([]);
	const [number, setNumber] = useState("");
	const [timeInSeconds, setTimeInSeconds] = useState(0);
	const [CanVote, setCanVote] = useState(true);

	const formatTime = (totalSeconds) => {
		let days = Math.floor(totalSeconds / 86400); // 86400 seconds in a day
		let hours = Math.floor((totalSeconds % 86400) / 3600); // 3600 seconds in an hour
		let minutes = Math.floor(((totalSeconds % 86400) % 3600) / 60); // 60 seconds in a minute
		let seconds = totalSeconds % 60; // Remaining seconds

		return `${String(days).padStart(2, "0")}:${String(hours).padStart(
			2,
			"0"
		)}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	};

	useEffect(() => {
		getCandidates();
		getRemainingTime();
		getCurrentStatus();
		if (window.ethereum) {
			window.ethereum.on("accountsChanged", handleAccountsChanged);
		}

		return () => {
			if (window.ethereum) {
				window.ethereum.removeListener(
					"accountsChanged",
					handleAccountsChanged
				);
			}
		};
	});

  

	useEffect(() => {
		const intervalId = setInterval( () => {
			setremainingTime(formatTime(timeInSeconds));

			// Check if the countdown has finished
			if (timeInSeconds <= 0) {
				clearInterval(intervalId);
				setremainingTime("00:00:00");
			}
		}, 1000);

		return () => clearInterval(intervalId);
	}, [timeInSeconds]);

	async function vote() {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const contractInstance = new ethers.Contract(
			contractAddress,
			contractAbi,
			signer
		);

		const tx = await contractInstance.vote(number);
		await tx.wait();
		canVote();
	}

	async function canVote() {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const contractInstance = new ethers.Contract(
			contractAddress,
			contractAbi,
			signer
		);
		const voteStatus = await contractInstance.voters(await signer.getAddress());
		setCanVote(voteStatus);
	}

	async function getCandidates() {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const contractInstance = new ethers.Contract(
			contractAddress,
			contractAbi,
			signer
		);
		const candidatesList = await contractInstance.getAllVotesOfCandiates();
		const formattedCandidates = candidatesList.map((candidate, index) => {
			return {
				index: index,
				name: candidate.name,
				voteCount: candidate.voteCount.toNumber(),
			};
		});
		setCandidates(formattedCandidates);
	}

	async function getCurrentStatus() {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const contractInstance = new ethers.Contract(
			contractAddress,
			contractAbi,
			signer
		);
		const status = await contractInstance.getVotingStatus();
		console.log(status);
		setVotingStatus(status);
	}

	async function getRemainingTime() {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const contractInstance = new ethers.Contract(
			contractAddress,
			contractAbi,
			signer
		);
		// const time = await contractInstance.getRemainingTime();
		// setremainingTime(parseInt(time, 16));
		const timeInSeconds = parseInt(
			await contractInstance.getRemainingTime(),
			10
		); // Parse as decimal
		setTimeInSeconds(timeInSeconds);

		// Update the countdown every second
	}

	function handleAccountsChanged(accounts) {
		if (accounts.length > 0 && account !== accounts[0]) {
			setAccount(accounts[0]);
			canVote();
		} else {
			setIsConnected(false);
			setAccount(null);
		}
	}

	async function connectToMetamask() {
		if (window.ethereum) {
			try {
				const provider = new ethers.providers.Web3Provider(window.ethereum);
				setProvider(provider);
				await provider.send("eth_requestAccounts", []);
				const signer = provider.getSigner();
				const address = await signer.getAddress();
				setAccount(address);
				console.log("Metamask Connected : " + address);
				setIsConnected(true);
				canVote();
			} catch (err) {
				console.error(err);
			}
		} else {
			console.error("Metamask is not detected in the browser");
		}
	}

	async function handleNumberChange(e) {
		setNumber(e.target.value);
	}

	return (
		<div className="App">
			{votingStatus ? (
				isConnected ? (
					<Connected
						account={account}
						candidates={candidates}
						remainingTime={remainingTime}
						number={number}
						handleNumberChange={handleNumberChange}
						voteFunction={vote}
						showButton={CanVote}
					/>
				) : (
					<Login connectWallet={connectToMetamask} />
				)
			) : (
				<Finished />
			)}
		</div>
	);
}

export default App;
import type NodeCG from '@nodecg/types';
import type { ExampleReplicant, Prediction, TwitchPredictionResponse } from '../types/schemas';
import type { PredictionButton } from '../types/schemas';

module.exports = function (nodecg: NodeCG.ServerAPI) {
	const twitchCredentials = nodecg.Replicant('twitchCredentials', 'twitch-bundle')

	const leftName = nodecg.Replicant('leftName', 'aoe-4-civ-draft')
	const rightName = nodecg.Replicant('rightName', 'aoe-4-civ-draft')



	const twitchPredictionLength = nodecg.Replicant('twitchPredictionLength', 'twitch-predictions') as unknown as number
	const twitchPredictionActive = nodecg.Replicant('twitchPredictionActive', 'twitch-predictions')

	const twitchActivePredictionID = nodecg.Replicant('twitchActivePredictionID', 'twitch-predictions')

	const leftButtonOption = nodecg.Replicant('leftButtonOption', 'twitch-predictions')
	const rightButtonOption = nodecg.Replicant('rightButtonOption', 'twitch-predictions')

	const leftPoints = nodecg.Replicant('leftPoints', 'twitch-predictions')
	const rightPoints = nodecg.Replicant('rightPoints', 'twitch-predictions')

	const predictionTimeRemaining = nodecg.Replicant('predictionTimeRemaining', 'twitch-predictions')

	let _json: Prediction

	nodecg.listenFor('cancelPrediction', async (_val, ack) => {

		let body = {
			//@ts-ignore
			"broadcaster_id": twitchCredentials.value.connectedAs.id,
			"id": twitchActivePredictionID.value,
			"status": "CANCELED",
		}

		const response = await fetch("https://api.twitch.tv/helix/predictions", {
			body: JSON.stringify(body),
			headers: {
				//@ts-ignore
				Authorization: `Bearer ${twitchCredentials.value.accessToken}`,
				//@ts-ignore
				"Client-Id": twitchCredentials.value.clientId,
				"Content-Type": "application/json"
			},
			method: "PATCH"
		}).then(data => {
			if (data.status === 200) {
				twitchPredictionActive.value = false
				twitchActivePredictionID.value = ''
				console.log("Canceled Prediction")
			} else {
				console.log(data.status)
				return
			}
		})
	})

	nodecg.listenFor('endPrediction', async (_val, ack) => {

		console.log(_val)

		let body = {
			//@ts-ignore
			"broadcaster_id": twitchCredentials.value.connectedAs.id,
			"id": twitchActivePredictionID.value,
			"status": "RESOLVED",
			"winning_outcome_id": _val.id
		}

		const response = await fetch("https://api.twitch.tv/helix/predictions", {
			body: JSON.stringify(body),
			headers: {
				//@ts-ignore
				Authorization: `Bearer ${twitchCredentials.value.accessToken}`,
				//@ts-ignore
				"Client-Id": twitchCredentials.value.clientId,
				"Content-Type": "application/json"
			},
			method: "PATCH"
		}).then(data => {
			if (data.status === 200) {
				twitchPredictionActive.value = false
				twitchActivePredictionID.value = ''
				console.log("Ended Prediction with winner: " + _val.title)
			} else {
				console.log(data.status)
				return
			}
		})
	})

	nodecg.listenFor('startPrediction', async (_val, ack) => {
		nodecg.log.info('Create Prediction');

		const leftScore = nodecg.Replicant('leftScore', 'aoe4-score-display')
		const rightScore = nodecg.Replicant('rightScore', 'aoe4-score-display')

		//Score of players + 1 is the game we're playing
		//@ts-ignore
		let game = leftScore.value + rightScore.value + 1

		let body = {
			//@ts-ignore
			"broadcaster_id": twitchCredentials.value.connectedAs.id,
			//@ts-ignore
			"title": `Who will win game ${game}?`,
			"outcomes": [
				{ "title": leftName.value },
				{ "title": rightName.value }],
			//@ts-ignore
			"prediction_window": twitchPredictionLength._value
		}

		//@ts-ignore
		const response = await fetch("https://api.twitch.tv/helix/predictions", {
			body: JSON.stringify(body),
			headers: {
				//@ts-ignore
				Authorization: `Bearer ${twitchCredentials.value.accessToken}`,
				//@ts-ignore
				"Client-Id": twitchCredentials.value.clientId,
				"Content-Type": "application/json"
			},
			method: "POST"
		}).then(async data => {
			if (data.status === 200) {
				twitchPredictionActive.value = true
				await getPrediction(1)
				await setTitleID()
				updatePrediction();

			} else {
				console.log(data.status)
				return
			}
		})

		// @ts-ignore
		ack(null, 'complete');
	});

	nodecg.listenFor('getLatestPrediction', async (_val, ack) => {
		console.log("getLatestPrediction")
		await getPrediction(1)
		await setTitleID()
		updatePrediction();
	})

	async function getPrediction(amount: number) {
		let status: number;
		//@ts-ignore
		const response = await fetch(`https://api.twitch.tv/helix/predictions?broadcaster_id=${twitchCredentials.value.connectedAs.id}&first=${amount}`, {
			headers: {
				//@ts-ignore
				Authorization: `Bearer ${twitchCredentials.value.accessToken}`,
				//@ts-ignore
				"Client-Id": twitchCredentials.value.clientId
			}
		})
			.then((res) => {
				status = res.status;
				return res.json()
			})
			.then((jsonResponse) => {
				_json = jsonResponse.data[0]

			})
			.catch((err) => {
				// handle error
				console.error(err);
			});

	}

	function updatePrediction() {
		console.log("Updating prediction")
		//console.log(Date.now())
		//console.log(_json.created_at)
		//console.log(Date.parse(_json.created_at))
		//console.log(_json.prediction_window)
		//console.log(_json.prediction_window * 1000)
		//console.log(Date.parse(_json.created_at) + _json.prediction_window)

		let _prediction_window = _json.prediction_window * 1000
		

		let timeRemaining = Date.parse(_json.created_at) + _prediction_window - Date.now()
		console.log("Time Remaing: " + timeRemaining)
		
		if(timeRemaining <= 0 || _json.status !== "ACTIVE") {
			console.log("Prediction window closed")
			//Stop countdown of timer on dashboard
			predictionTimeRemaining.value = "Time's up!"
			return;
		}

		//Set time remaining replicant
		predictionTimeRemaining.value = (timeRemaining / 1000).toFixed(0) + " sec(s) left"
		//Update the points
		leftPoints.value = _json.outcomes[0].channel_points
		rightPoints.value = _json.outcomes[1].channel_points

		getPredictionPercentages()
		
		//Do it all over again
		setTimeout(predictionLoop, 1000)
	}

	async function predictionLoop() {
		await getPrediction(1)
		await setTitleID()
		updatePrediction();
	}

	async function getPredictionPercentages() {
		console.log('Getting channel points predicted on each option')
		leftPoints.value = _json.outcomes[0].channel_points
		rightPoints.value = _json.outcomes[1].channel_points
	}

	async function setTitleID() {
		console.log('Setting title and ID of buttons')
		twitchActivePredictionID.value = _json.id


		leftButtonOption.value = {
			id: _json.outcomes[0].id,
			title: _json.outcomes[0].title
		}

		rightButtonOption.value = {
			id: _json.outcomes[1].id,
			title: _json.outcomes[1].title
		}
	}
};

import type NodeCG from '@nodecg/types';
import type { ExampleReplicant } from '../types/schemas';
import type { PredictionButton } from '../types/schemas';


module.exports = function (nodecg: NodeCG.ServerAPI) {
	const twitchCredentials = nodecg.Replicant('twitchCredentials', 'twitch-bundle')

	const leftName = nodecg.Replicant('leftName', 'aoe-4-civ-draft')
	const rightName = nodecg.Replicant('rightName', 'aoe-4-civ-draft')

	const leftScore = nodecg.Replicant('leftScore', 'score-display') as unknown as number
	const rightScore = nodecg.Replicant('rightScore', 'score-display') as unknown as number

	const twitchPredictionLength = nodecg.Replicant('twitchPredictionLength', 'twitch-predictions') as unknown as number
	const twitchPredictionActive = nodecg.Replicant('twitchPredictionActive', 'twitch-predictions')

	const twitchActivePredictionID = nodecg.Replicant('twitchActivePredictionID', 'twitch-predictions')

	const leftButtonOption = nodecg.Replicant('leftButtonOption', 'twitch-predictions')
	const rightButtonOption = nodecg.Replicant('rightButtonOption', 'twitch-predictions')

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

		//@ts-ignore
		console.log(twitchPredictionLength._value)

		//@ts-ignore
		//Score of players + 1 is the game we're playing
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
		}).then(data => {
			if (data.status === 200) {
				twitchPredictionActive.value = true
				getPrediction()
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
		getPrediction()
	})

	async function getPrediction() {
		let status: number;
		//@ts-ignore
		const response = await fetch(`https://api.twitch.tv/helix/predictions?broadcaster_id=${twitchCredentials.value.connectedAs.id}&first=1`, {
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
				console.log(jsonResponse);
				console.log(jsonResponse.data[0].outcomes);
				twitchActivePredictionID.value = jsonResponse.data[0].id

				leftButtonOption.value = {
					id: jsonResponse.data[0].outcomes[0].id,
					title: jsonResponse.data[0].outcomes[0].title
				}

				rightButtonOption.value = {
					id: jsonResponse.data[0].outcomes[1].id,
					title: jsonResponse.data[0].outcomes[1].title
				}

			})
			.catch((err) => {
				// handle error
				console.error(err);
			});

	}

	async function getPredictionPercentages() {

	}
};

import React, { useEffect, useState } from 'react';
import { useReplicant } from 'use-nodecg';
import type { PredictionButton } from '../types/schemas';

export function TwitchPredictions() {


	const [twitchPredictionLength, set_twitchPredictionLength] = useReplicant<number>('twitchPredictionLength', 120);
	const [twitchPredictionActive, set_twitchPredictionActive] = useReplicant<boolean>('twitchPredictionActive', false);
	const [twitchActivePredictionID, set_twitchActivePredictionID] = useReplicant<string>('twitchActivePredictionID', '');

	const [leftButtonOption, set_leftButtonOption] = useReplicant<PredictionButton>('leftButtonOption', { id: '', title: '' });
	const [rightButtonOption, set_rightButtonOption] = useReplicant<PredictionButton>('rightButtonOption', { id: '', title: '' });

	function startPrediction() {
		//@ts-ignore
		nodecg.sendMessage('startPrediction', 'testing')
	}

	function cancelPrediction() {
		//@ts-ignore
		nodecg.sendMessage('cancelPrediction', 'testing')
	}

	function getPrediction() {
		//@ts-ignore
		nodecg.sendMessage('getLatestPrediction', 'testing Stuff')
	}

	function endPrediction(option) {
		//@ts-ignore
		nodecg.sendMessage('endPrediction', option)
	}

	return (
		<>
			<p>twitchActivePredictionID {twitchActivePredictionID}<input type="checkbox" checked={twitchPredictionActive} /></p>
			<button className='twitch' onClick={getPrediction}>Debug Option Get Prediction</button>
			{twitchPredictionActive ?
				<div>
					<div className='predictionOptions'>
						<button className='predictionOption' onClick={() => endPrediction(leftButtonOption)}>{leftButtonOption?.title || ''}</button>
						<button className='predictionOption' onClick={() => endPrediction(rightButtonOption)}>{rightButtonOption?.title || ''}</button>
					</div>
					<button className='cancel' onClick={cancelPrediction}>Force Cancel Prediction</button>
				</div>
				:
				<div>
					<label>Prediction Window (seconds) </label>
					<input type="number" min="30" max="1800" value={twitchPredictionLength} onChange={(event) => { set_twitchPredictionLength(event.target.value as unknown as number) }} />
					<button className='twitch' onClick={startPrediction}>Start Twitch Prediction</button>
				</div>}
		</>
	)
}
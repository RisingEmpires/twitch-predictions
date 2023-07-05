import React, { useEffect, useState } from 'react';
import { useReplicant } from 'use-nodecg';
import type { PredictionButton } from '../types/schemas';

export function TwitchPredictions() {


	const [twitchPredictionLength, set_twitchPredictionLength] = useReplicant<number>('twitchPredictionLength', 120);
	const [twitchPredictionActive, set_twitchPredictionActive] = useReplicant<boolean>('twitchPredictionActive', false);
	const [twitchActivePredictionID, set_twitchActivePredictionID] = useReplicant<string>('twitchActivePredictionID', '');

	const [leftButtonOption, set_leftButtonOption] = useReplicant<PredictionButton>('leftButtonOption', { id: '', title: '' });
	const [rightButtonOption, set_rightButtonOption] = useReplicant<PredictionButton>('rightButtonOption', { id: '', title: '' });

	const [leftPoints, set_leftPoints] = useReplicant<number>('leftPoints', 0);
	const [rightPoints, set_rightPoints] = useReplicant<number>('rightPoints', 0);

	const [predictionTimeRemaining, set_predictionTimeRemaining] = useReplicant<string>('predictionTimeRemaining', '');

	const [isOpen, setIsOpen] = useState(false);

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

	function toggle() {
		setIsOpen((isOpen) => !isOpen);
	}

	return (
		<>
			<button className='debugButton' onClick={toggle}>Show Debug Options</button>
			{isOpen ?
				<div className='debugOptions'>
					<p>twitchActivePredictionID {twitchActivePredictionID}<input type="checkbox" checked={twitchPredictionActive} /></p>
					<button className='twitch' onClick={getPrediction}>Debug Option Get Prediction</button>
					<input type="number" value={leftPoints ?? 0} onChange={(newValue) => set_leftPoints(newValue.target.value as unknown as number)} />
					<input type="number" value={rightPoints ?? 0} onChange={(newValue) => set_rightPoints(newValue.target.value as unknown as number)} />
				</div> : <></>
			}
			{twitchPredictionActive ?
				<div>
					<h1 className='predictionTimeRemaining'>{predictionTimeRemaining}</h1>
					<div className='predictionOptions'>
						<div className='predictionOption'>
							<h1>{leftPoints}</h1>
							<button className='predictionOption' onClick={() => endPrediction(leftButtonOption)}>{leftButtonOption?.title || ''}</button>
						</div>
						<h1>{(leftPoints / (+leftPoints + +rightPoints) * 100).toFixed(2)}%</h1>
						<div className='predictionOption'>
							<h1>{rightPoints}</h1>
							<button className='predictionOption' onClick={() => endPrediction(rightButtonOption)}>{rightButtonOption?.title || ''}</button>
						</div>
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
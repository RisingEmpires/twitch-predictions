export * from './exampleReplicant';

export interface PredictionButton {
	id: string
	title: string
}

export interface TwitchPredictionResponse {
	data: Prediction[]
}

export interface Prediction {
	id: string
	broadcaster_id: string
	broadcaster_name: string
	broadcaster_login: string
	title: string
	winning_outcome_id: null,
	outcomes: Outcome[]
	prediction_window: number
	status: string
	created_at: string
	ended_at: string
	locked_at: string
}

export interface Outcome {
	id: string
	title: string
	users: number
	channel_points: number
	top_predictors: string
	color: string
}
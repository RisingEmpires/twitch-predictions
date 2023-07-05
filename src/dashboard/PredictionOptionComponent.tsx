import React, { useCallback } from 'react';
import { PredictionButton } from '../types/schemas';

type PredictionOption = {
    click: PredictionButton
    points: number
}

export const PredictionOptionComponent = ({click, points}: PredictionOption) => {
    return (
        <div>

        </div>
    )
}
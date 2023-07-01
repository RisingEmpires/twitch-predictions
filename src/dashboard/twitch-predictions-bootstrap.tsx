import React from 'react';
import { createRoot } from 'react-dom/client';
import { TwitchPredictions } from './TwitchPredictions';

const root = createRoot(document.getElementById('root')!);
root.render(<TwitchPredictions />);

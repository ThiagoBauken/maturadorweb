
import { createContext } from 'react';
import { BulkSenderContextType } from '../types';

export const BulkSenderContext = createContext<BulkSenderContextType | undefined>(undefined);

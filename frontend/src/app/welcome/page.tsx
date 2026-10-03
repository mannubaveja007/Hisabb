import type { Metadata } from 'next';
import { WelcomeSequence } from './WelcomeSequence';

export const metadata: Metadata = {
  title: 'Hisabb — बोलो. हिसाब हो गया.',
  description: 'A voice-led credit ledger for shopkeepers.',
};

export default function WelcomePage() {
  return <main><WelcomeSequence /></main>;
}

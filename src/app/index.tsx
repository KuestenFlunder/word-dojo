import type { Metadata } from 'expo-router/server';

import { StartBildschirm } from '@/screens/StartBildschirm';

export function generateMetadata(): Metadata {
  return { title: 'Word Dojo', description: 'Englisch-Vokabeln üben im Word Dojo.' };
}

export default function Start() {
  return <StartBildschirm />;
}

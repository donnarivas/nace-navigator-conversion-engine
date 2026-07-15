/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDwcVUe39Vd7L80aJGG426c8OXmQgAvkVk",
  authDomain: "soy-orbit-z40ks.firebaseapp.com",
  projectId: "soy-orbit-z40ks",
  storageBucket: "soy-orbit-z40ks.firebasestorage.app",
  messagingSenderId: "843753220215",
  appId: "1:843753220215:web:51bb8118a4b51b8b8bfe72"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom databaseId provided in config using getFirestore(app, databaseId)
const db = getFirestore(app, "ai-studio-leaflaboutreacht-4fba94b1-bca0-4de7-bd69-aefd8248fa16");

export { db };

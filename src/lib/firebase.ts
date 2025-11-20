import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-5544143673-c70bc",
  "appId": "1:841445316402:web:703e6db8dff926d990e92b",
  "apiKey": "AIzaSyAeHovZiIfMso8YAw4ProjG3wLiHfU6SKg",
  "authDomain": "studio-5544143673-c70bc.firebaseapp.com",
  "messagingSenderId": "841445316402",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };

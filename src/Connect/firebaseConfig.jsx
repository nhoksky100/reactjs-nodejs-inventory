// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // import { getAnalytics } from "firebase/analytics";
// import 'firebase/auth';
// import 'firebase/firestore';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyA5uvhn73Ob7uGLe22ONkODnZknvSZch_Q",
//   authDomain: "managersms-af138.firebaseapp.com",
//   projectId: "managersms-af138",
//   storageBucket: "managersms-af138.appspot.com",
//   messagingSenderId: "854917461526",
//   appId: "1:854917461526:web:a91a900c793956eb386737",
//   measurementId: "G-VLSEVLRGXC"
// };

// // Initialize Firebase
// export default initializeApp(firebaseConfig);
// // export default getAnalytics(app);
// firebaseConfig.jsx

import {initializeApp} from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore'; // Import firestore module if you need it

const firebaseConfig = {
  apiKey: "AIzaSyA5uvhn73Ob7uGLe22ONkODnZknvSZch_Q",
  authDomain: "managersms-af138.firebaseapp.com",
  projectId: "managersms-af138",
  // Add other parameters as needed
};

export default initializeApp(firebaseConfig);



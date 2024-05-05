// Fonction pour bloquer la navigation vers l'arrière et l'avant après la connexion
const blockNavigation = () => {
  history.pushState(null, null, location.href);
  window.onpopstate = function(event) {
    history.go(1);
  };
}

// Ajout de la fonction blockNavigation() sans modifier le reste du code
const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyDAjHW6t2SYJBjkpxHIDLu8zjaxbqVG9p8",
  authDomain: "applicationbdd.firebaseapp.com",
  databaseURL: "https://applicationbdd-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "applicationbdd",
  storageBucket: "applicationbdd.appspot.com",
  messagingSenderId: "513799976823",
  appId: "1:513799976823:web:d440c5e4298ebc4f319372"
});

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

// Sign up function
const signUp = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Firebase code for signing up
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((result) => {
      // Signed up successfully, redirect to testseulcorrecte.html
      window.location.href = "Html/Affichage(page3).html";
    })
    .catch((error) => {
      console.error(error.code);
      console.error(error.message);
      // Handle sign up errors here...
    });
}

// Sign In function
const signIn = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Firebase code for signing in
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((result) => {
      // Signed in successfully, redirect to testseulcorrecte.html
      window.location.href = 'Html/Affichage(page3).html';
    })
    .catch((error) => {
      console.error(error.code);
      console.error(error.message);
      // Handle sign in errors here...
    });
}

// Appel de la fonction blockNavigation() après le chargement de la page
window.onload = function() {
  blockNavigation();
};

// ==========================================
// BLOQUER LE RETOUR ARRIÈRE
// ==========================================

const blockNavigation = () => {
    history.pushState(null, null, location.href);

    window.onpopstate = function() {
        history.go(1);
    };
};


// ==========================================
// INSCRIPTION
// ==========================================

const signUp = async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "https://mini-jul-dad-tomorrow.trycloudflare.com/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        console.log("Inscription réussie :", data);

        window.location.href =
            "Html/Affichage(page3).html";

    } catch (error) {

        console.error("Erreur inscription :", error);

        alert("Impossible de contacter le serveur.");
    }
};


// ==========================================
// CONNEXION
// ==========================================

const signIn = async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "https://mini-jul-dad-tomorrow.trycloudflare.com/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        console.log("Connexion réussie :", data);

        localStorage.setItem(
            "currentUser",
            JSON.stringify(data.user)
        );

        window.location.href =
            "Html/Affichage(page3).html";

    } catch (error) {

        console.error("Erreur connexion :", error);

        alert("Impossible de contacter le serveur.");
    }
};


// ==========================================
// CHARGEMENT DE LA PAGE
// ==========================================

window.onload = function() {
    blockNavigation();
};
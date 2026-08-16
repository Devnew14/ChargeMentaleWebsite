// javascript
let usersName = [];
let usersData = {};
let myChart = null;
let usersInfo = {};


// ==================================================
// RÉCUPÉRATION DES DONNÉES DEPUIS MYSQL
// ==================================================

async function RecupererDonnees() {

    try {

        const response = await fetch(
            "https://mini-jul-dad-tomorrow.trycloudflare.com/api/evaluations/individuelles"
        );

        if (!response.ok) {

            throw new Error(
                "Erreur HTTP : " + response.status
            );

        }

        const data = await response.json();

        console.log(
            "Données reçues depuis MySQL :",
            data
        );


        // Réinitialiser les données
        usersName = [];
        usersData = {};
        usersInfo = {};


        // ==================================================
        // PARCOURIR LES UTILISATEURS
        // ==================================================

        for (const fullName in data) {

            const user = data[fullName];


            /*
             * Vérifier que l'utilisateur possède
             * réellement des évaluations.
             */
            if (
                user &&
                user.note &&
                Object.keys(user.note).length > 0
            ) {

                // Nom
                usersName.push(fullName);


                // Évaluations
                usersData[fullName] =
                    user.note;


                // Informations utilisateur
                usersInfo[fullName] = {

                    nom:
                        user.nom || "",

                    prenom:
                        user.prenom || "",

                    date_naissance:
                        user.date_naissance || "",

                    sexe:
                        user.sexe || "",

                    metier:
                        user.metier || ""

                };
            }
        }


        console.log(
            "Utilisateurs :",
            usersName
        );

        console.log(
            "Évaluations :",
            usersData
        );

        console.log(
            "Informations utilisateurs :",
            usersInfo
        );


        // Remplir le sélecteur
        chargeSelcteurName();


    } catch (error) {

        console.error(
            "Erreur lors de la récupération des données depuis MySQL :",
            error
        );

        alert(
            "Impossible de récupérer les évaluations individuelles."
        );
    }
}


// ==================================================
// AFFICHER LE GRAPHIQUE
// ==================================================

function afficherGraphique(
    fullName,
    ladate
) {

    // Vérifier l'utilisateur
    if (
        !usersData[fullName]
    ) {

        console.error(
            "Utilisateur introuvable :",
            fullName
        );

        return;
    }


    // Récupérer l'évaluation
    const evaluation =
        usersData[fullName][ladate];


    if (!evaluation) {

        console.error(
            "Évaluation introuvable :",
            ladate
        );

        return;
    }


    // Afficher les informations
    chargenfos(fullName);


    // Récupérer le canvas
    const canvas =
        document.getElementById(
            "graphique"
        );


    if (!canvas) {

        console.error(
            "Element canvas #graphique introuvable."
        );

        return;
    }


    // ==================================================
    // RÉSULTATS
    // ==================================================

    const resultats =
        Array.isArray(evaluation.resultat)
            ? evaluation.resultat
            : [];


    if (resultats.length === 0) {

        console.error(
            "Aucun résultat pour cette évaluation."
        );

        return;
    }


    // ==================================================
    // FRÉQUENCE
    // ==================================================

    const frequence =
        Number(
            evaluation.frequence
        );


    if (
        !Number.isFinite(frequence) ||
        frequence <= 0
    ) {

        console.error(
            "Fréquence invalide :",
            evaluation.frequence
        );

        return;
    }


    // ==================================================
    // ÉCHELLE
    // ==================================================

    const echelle =
        Number(
            evaluation.echelle
        );


    console.log(
        "Évaluation sélectionnée :",
        {
            date: ladate,
            echelle: echelle,
            frequence: frequence,
            resultat: resultats
        }
    );


    // ==================================================
    // GÉNÉRER LES TEMPS
    // ==================================================

    const lesinter =
        generateStringValues(
            frequence,
            resultats.length
        );


    // ==================================================
    // CONTEXTE CANVAS
    // ==================================================

    const ctx =
        canvas.getContext("2d");


    // ==================================================
    // DÉTRUIRE L'ANCIEN GRAPHIQUE
    // ==================================================

    if (myChart !== null) {

        myChart.destroy();

        myChart = null;
    }


    // ==================================================
    // CRÉER LE GRAPHIQUE
    // ==================================================

    myChart = new Chart(
        ctx,
        {

            type: "line",

            data: {

                labels: lesinter,

                datasets: [

                    {

                        label:
                            fullName,

                        data:
                            resultats,

                        fill:
                            false,

                        borderColor:
                            "rgb(75, 192, 192)",

                        backgroundColor:
                            "rgb(75, 192, 192)",

                        tension:
                            0.1,

                        pointRadius:
                            5,

                        pointHoverRadius:
                            7
                    }

                ]
            },


            options: {

                responsive: true,

                maintainAspectRatio: true,


                scales: {

                    y: {

                        beginAtZero: true,

                        min: 0,

                        max: echelle,

                        ticks: {

                            stepSize: 1

                        },

                        title: {

                            display: true,

                            text:
                                "Niveau Charge Mentale"

                        }
                    },


                    x: {

                        title: {

                            display: true,

                            text:
                                "Temps (seconde)"

                        }

                    }

                },


                plugins: {

                    title: {

                        display: true,

                        text:
                            "Évaluation individuelle - Échelle " +
                            echelle

                    },

                    legend: {

                        display: true

                    }

                }

            }

        }
    );
}


// ==================================================
// BOUTON VALIDER
// ==================================================

function inter() {

    const utilisateur =
        document.getElementById(
            "userDropdown"
        ).value;


    const date =
        document.getElementById(
            "datesTest"
        ).value;


    if (
        utilisateur !== "" &&
        date !== ""
    ) {

        afficherGraphique(
            utilisateur,
            date
        );

    } else {

        alert(
            "Sélectionner une date et/ou un utilisateur"
        );
    }
}


// ==================================================
// GÉNÉRER LES VALEURS DU TEMPS
// ==================================================

function generateStringValues(
    notificationFrequency,
    nb
) {

    const values = [];


    for (
        let i = 0;
        i < nb;
        i++
    ) {

        values.push(
            i * notificationFrequency
        );
    }


    return values;
}


// ==================================================
// REMPLIR LA LISTE DES UTILISATEURS
// ==================================================

function chargeSelcteurName() {

    const baliseSelecteur =
        document.getElementById(
            "userDropdown"
        );


    if (!baliseSelecteur) {

        console.error(
            "userDropdown introuvable."
        );

        return;
    }


    // Vider la liste
    baliseSelecteur.innerHTML = "";


    // Option par défaut
    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";

    defaultOption.text =
        "Choisissez un prénom";


    baliseSelecteur.appendChild(
        defaultOption
    );


    // Ajouter les utilisateurs
    usersName.forEach(
        user => {

            const option =
                document.createElement(
                    "option"
                );


            option.text =
                user;

            option.value =
                user;


            baliseSelecteur.appendChild(
                option
            );
        }
    );


    // Préparer les dates
    chargeSelcteurDate();
}


// ==================================================
// AFFICHER LES INFORMATIONS UTILISATEUR
// ==================================================

function chargenfos(fullName) {

    const userInfo =
        usersInfo[fullName];


    if (!userInfo) {

        console.error(
            "Informations utilisateur introuvables :",
            fullName
        );

        return;
    }


    const pnom =
        document.querySelector(
            ".p-nom"
        );


    const pprenom =
        document.querySelector(
            ".p-prenom"
        );


    const page =
        document.querySelector(
            ".p-age"
        );


    const psexe =
        document.querySelector(
            ".p-sexe"
        );


    const pmetier =
        document.querySelector(
            ".p-metier"
        );


    if (pnom) {

        pnom.textContent =
            "Nom: " +
            userInfo.nom;
    }


    if (pprenom) {

        pprenom.textContent =
            "Prénom: " +
            userInfo.prenom;
    }


    if (page) {

        let dateNaissance =
            userInfo.date_naissance;


        /*
         * La date MySQL peut être sous la forme :
         *
         * 2001-11-11T18:30:00.000Z
         *
         * On conserve seulement la date.
         */
        if (
            dateNaissance &&
            dateNaissance.includes("T")
        ) {

            dateNaissance =
                dateNaissance.split("T")[0];
        }


        page.textContent =
            "Date de Naissance: " +
            (dateNaissance || "");
    }


    if (psexe) {

        psexe.textContent =
            "Sexe: " +
            userInfo.sexe;
    }


    if (pmetier) {

        pmetier.textContent =
            "Métier: " +
            userInfo.metier;
    }
}


// ==================================================
// REMPLIR LA LISTE DES DATES
// ==================================================

function chargeSelcteurDate() {

    const nameSelected =
        document.getElementById(
            "userDropdown"
        ).value;


    const baliseSelecteurdate =
        document.getElementById(
            "datesTest"
        );


    if (!baliseSelecteurdate) {

        console.error(
            "datesTest introuvable."
        );

        return;
    }


    // Vider les anciennes dates
    baliseSelecteurdate.innerHTML =
        "";


    // Option par défaut
    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";

    defaultOption.text =
        "Choisissez une date";


    baliseSelecteurdate.appendChild(
        defaultOption
    );


    // Aucun utilisateur sélectionné
    if (
        !nameSelected ||
        !usersData[nameSelected]
    ) {

        return;
    }


    // Récupérer les évaluations
    const notes =
        usersData[nameSelected];


    // Ajouter les évaluations
    for (
        const noteKey in notes
    ) {

        const evaluation =
            notes[noteKey];


        const option =
            document.createElement(
                "option"
            );


        option.value =
            noteKey;


        /*
         * Affichage :
         *
         * 2026/08/16 - Échelle 10
         */
        const dateAffichee =
            noteKey
                .split("-")
                .slice(0, 3)
                .join("/");


        option.text =
            dateAffichee +
            " - Échelle " +
            evaluation.echelle;


        baliseSelecteurdate.appendChild(
            option
        );
    }
}


// ==================================================
// CHANGEMENT D'UTILISATEUR
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const userDropdown =
            document.getElementById(
                "userDropdown"
            );


        if (userDropdown) {

            userDropdown.addEventListener(
                "change",
                function () {

                    // Mettre à jour les dates
                    chargeSelcteurDate();


                    // Afficher les informations
                    const fullName =
                        userDropdown.value;


                    if (
                        fullName !== ""
                    ) {

                        chargenfos(
                            fullName
                        );
                    }


                    // Effacer l'ancien graphique
                    if (
                        myChart !== null
                    ) {

                        myChart.destroy();

                        myChart = null;
                    }
                }
            );
        }
    }
);


// ==================================================
// CHARGEMENT INITIAL
// ==================================================

RecupererDonnees();

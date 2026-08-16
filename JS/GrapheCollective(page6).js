let nameUser = [];
let usersData = {};
let keyDates = [];
let myCharts = [];


// ======================================================
// RÉCUPÉRER LES DONNÉES DEPUIS MYSQL
// ======================================================

function getDonnee() {

    fetch('https://mini-jul-dad-tomorrow.trycloudflare.com/api/evaluations/collectives')

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Erreur HTTP : ' + response.status
                );
            }

            return response.json();
        })

        .then(data => {

            console.log(
                "Données collectives reçues depuis MySQL :",
                data
            );

            nameUser = [];
            usersData = {};

            // Ton API renvoie un OBJET :
            // {
            //   "Jean Dupont": {
            //      "notes": {...}
            //   },
            //   ...
            // }

            for (const fullName in data) {

                nameUser.push(fullName);

                usersData[fullName] = data[fullName];
            }

            console.log(
                "Utilisateurs :",
                nameUser
            );

            console.log(
                "Données utilisateurs :",
                usersData
            );

            afficherUserProfils();
        })

        .catch(error => {

            console.error(
                "Erreur lors de la récupération des évaluations collectives :",
                error
            );
        });
}


// ======================================================
// REMPLIR LES DEUX LISTES D'UTILISATEURS
// ======================================================

function afficherUserProfils() {

    for (let i = 1; i <= 2; i++) {

        const selectElement =
            document.getElementById(
                `baliseSelectProfil${i}`
            );

        if (!selectElement) {

            console.error(
                `baliseSelectProfil${i} introuvable`
            );

            continue;
        }

        selectElement.innerHTML = "";

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.text =
            "Choisissez un utilisateur";

        selectElement.appendChild(
            defaultOption
        );


        nameUser.forEach(fullName => {

            const option =
                document.createElement("option");

            option.value = fullName;

            option.text = fullName;

            selectElement.appendChild(
                option
            );
        });


        selectElement.onchange = function () {

            const selectedUser =
                selectElement.value;

            afficherDate(
                selectedUser,
                i
            );
        };
    }
}


// ======================================================
// REGROUPER LES ÉVALUATIONS PAR DATE
// ======================================================

function regrouperNotesParDate(notes) {

    const notesParDate = {};

    keyDates = [];

    for (const date in notes) {

        const formattedDate =
            date
                .split("-")
                .slice(0, 3)
                .join("-");


        if (!keyDates.includes(formattedDate)) {

            keyDates.push(
                formattedDate
            );
        }


        if (!notesParDate[formattedDate]) {

            notesParDate[formattedDate] = [];
        }


        notesParDate[formattedDate].push(
            notes[date]
        );
    }

    return notesParDate;
}


// ======================================================
// AFFICHER LES DATES
// ======================================================

function afficherDate(
    selectedUser,
    chartIndex
) {

    const selectElement =
        document.getElementById(
            `baliseSelectDate${chartIndex}`
        );

    if (!selectElement) {

        console.error(
            `baliseSelectDate${chartIndex} introuvable`
        );

        return;
    }


    selectElement.innerHTML = "";


    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.text =
        "Choisissez une date";

    selectElement.appendChild(
        defaultOption
    );


    if (
        !selectedUser ||
        !usersData[selectedUser]
    ) {

        return;
    }


    const notes =
        usersData[selectedUser].notes;


    if (!notes) {

        return;
    }


    const notesParDate =
        regrouperNotesParDate(notes);


    keyDates.forEach(date => {

        const option =
            document.createElement("option");

        option.value = date;

        option.text = date;

        selectElement.appendChild(
            option
        );
    });


    selectElement.onchange = function () {

        const selectedDate =
            selectElement.value;

        if (!selectedDate) {

            return;
        }


        afficherGraphique(
            notesParDate[selectedDate],
            chartIndex
        );
    };
}


// ======================================================
// GÉNÉRER LES VALEURS DU TEMPS
// ======================================================

function generateStringValues(
    evaluations
) {

    const values = [];

    if (
        !evaluations ||
        evaluations.length === 0
    ) {

        return values;
    }


    const frequence =
        Number(
            evaluations[0].frequence
        );


    const nombreResultats =
        evaluations[0].resultats.length;


    for (
        let i = 0;
        i < nombreResultats;
        i++
    ) {

        values.push(
            i * frequence
        );
    }


    return values;
}


// ======================================================
// AFFICHER LE GRAPHIQUE
// ======================================================

function afficherGraphique(
    selectedUser,
    chartIndex
) {

    if (
        !selectedUser ||
        selectedUser.length === 0
    ) {

        console.error(
            "Aucune évaluation trouvée."
        );

        return;
    }


    const canvas =
        document.getElementById(
            `graphique${chartIndex}`
        );


    if (!canvas) {

        console.error(
            `graphique${chartIndex} introuvable`
        );

        return;
    }


    const lesinter =
        generateStringValues(
            selectedUser
        );


    const datasets = [];


    selectedUser.forEach(
        (evaluation, index) => {

            datasets.push({

                label:
                    "Estimation réalisée par : " +
                    evaluation.realisePar,

                data:
                    evaluation.resultats,

                fill: false,

                borderColor:
                    getGraphColor(index),

                tension: 0.1
            });
        }
    );


    const data = {

        labels: lesinter,

        datasets: datasets
    };


    const options = {

        scales: {

            y: {

                beginAtZero: true,

                title: {

                    display: true,

                    text:
                        "Niveau Charge Mental"
                }
            },

            x: {

                title: {

                    display: true,

                    text:
                        "Temps (seconde)"
                }
            }
        }
    };


    canvas.style.width = "30%";

    canvas.style.height = "15%";


    // Supprimer l'ancien graphique
    if (myCharts[chartIndex]) {

        myCharts[chartIndex].destroy();
    }


    // Créer le graphique
    myCharts[chartIndex] =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "line",

                data: data,

                options: options
            }
        );
}


// ======================================================
// COULEURS DES COURBES
// ======================================================

function getGraphColor(index) {

    const colors = [
        "blue",
        "red",
        "green",
        "black"
    ];

    return colors[
        index % colors.length
    ];
}


// ======================================================
// LANCER
// ======================================================

getDonnee();
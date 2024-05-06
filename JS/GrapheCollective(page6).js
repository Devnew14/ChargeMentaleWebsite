let nameUser = [];
let usersData = [];
let keyDates = [];
let myCharts = [];

function getDonnee() {
    // Récupérer les données depuis Firebase via l'URL spécifique
    fetch('https://applicationbdd-default-rtdb.europe-west1.firebasedatabase.app/utilisateurs.json')
        .then(response => response.json())
        .then(data => {
            // Parcourir chaque utilisateur
            for (const userId in data) {
                const user = data[userId];

                // Vérifier si l'utilisateur a des données d'évaluation collective
                if (user.nom && user.prenom && user.evaluations && user.evaluations.evaluation_collective) {
                    // Créer une clé composée du nom et du prénom
                    const fullName = `${user.prenom} ${user.nom}`;
                    // Ajouter le nom complet à la liste des utilisateurs
                    nameUser.push(fullName);
                    usersData[fullName] = user;
                }
            }

            // Une fois les données récupérées avec succès, appeler la fonction pour afficher les profils des utilisateurs
            afficherUserProfils();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données depuis Firebase:', error);
        });
}

function afficherUserProfils() {
    for (let i = 1; i <= 2; i++) {
        const selectElement = document.getElementById(`baliseSelectProfil${i}`);
        selectElement.innerHTML = ''; // reinitialiser la balise select  
        
        
        // Ajouter l'option par défaut "Choisissez un utilisateur"
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.text = "Choisissez un utilisateur";
        selectElement.appendChild(defaultOption);

        // Parcourir les noms d'utilisateurs et ajouter une option pour chaque nom au sélecteur
        nameUser.forEach(fullName => {
            const option = document.createElement('option');
            option.text = fullName;
            option.value = fullName;
            selectElement.appendChild(option);
        });

        selectElement.addEventListener('change', () => {
            const selectedUser = selectElement.value;
            afficherDate(selectedUser, i);
        });
    }
}

function regrouperNotesParDate(notes) {
    const notesParDate = {};
    keyDates = [];
    for (const date in notes) {
        const formattedDate = date.split('-').slice(0, 3).join('-');
        if (!keyDates.includes(formattedDate)) {
            // Si non, ajoutez formattedDate à keyDates
            keyDates.push(formattedDate);
        }
        if (!notesParDate[formattedDate]) {
            notesParDate[formattedDate] = [];
        }
        notesParDate[formattedDate].push(notes[date]);
    }
    return notesParDate;
}

function afficherDate(selectedUser, chartIndex) {
    const selectElement = document.getElementById(`baliseSelectDate${chartIndex}`);
    selectElement.innerHTML = ''; // reinitialiser la balise select  
    const dateTestCollectif = regrouperNotesParDate(usersData[selectedUser].evaluations.evaluation_collective.notes);

    // Ajouter l'option par défaut "Choisissez une date"
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.text = "Choisissez une date";
    selectElement.appendChild(defaultOption);


    keyDates.forEach(date => {
        const option = document.createElement('option');
        option.text = date;
        option.value = date;
        selectElement.appendChild(option);
    });

    selectElement.addEventListener('change', () => {
        const selectedDate = selectElement.value;
        afficherGraphique(dateTestCollectif[selectedDate], chartIndex);
    });
}

function generateStringValues(selectedUser) {
    const values = [];

    for (let i = 0; i <= selectedUser.length + 5; i++) {
        values.push((i * selectedUser[0].frequence));
    }

    return values;
}

function afficherGraphique(selectedUser, chartIndex) {
    console.log("ptr");
    const nbEval = selectedUser.length;
    console.log(selectedUser[0].resultats);

    const canvas = document.getElementById(`graphique${chartIndex}`);
    if (!canvas) {
        console.error(`Element canvas${chartIndex} non trouvé.`);
        return;
    }

    const lesinter = generateStringValues(selectedUser);
    const ctx = canvas.getContext('2d');
    let data = null;
    switch (nbEval) {
        case 1:
            data = {
                labels: lesinter,
                datasets: [
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[0].realisePar,
                        data: selectedUser[0].resultats,
                        fill: false,
                        borderColor: 'blue',
                        tension: 0.1
                    },
                ]
            };
            break;
        case 2:
            data = {
                labels: lesinter,
                datasets: [
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[0].realisePar,
                        data: selectedUser[0].resultats,
                        fill: false,
                        borderColor: 'blue',
                        tension: 0.1
                    },
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[1].realisePar,
                        data: selectedUser[1].resultats,
                        fill: false,
                        borderColor: 'red',
                        tension: 0.1
                    },
                ]
            };
            break;
        case 3:
            data = {
                labels: lesinter,
                datasets: [
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[0].realisePar,
                        data: selectedUser[0].resultats,
                        fill: false,
                        borderColor: 'blue',
                        tension: 0.1
                    },
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[1].realisePar,
                        data: selectedUser[1].resultats,
                        fill: false,
                        borderColor: 'red',
                        tension: 0.1
                    },
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[2].realisePar,
                        data: selectedUser[2].resultats,
                        fill: false,
                        borderColor: 'green',
                        tension: 0.1
                    },
                ]
            };
            break;
        case 4:
            data = {
                labels: lesinter,
                datasets: [
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[0].realisePar,
                        data: selectedUser[0].resultats,
                        fill: false,
                        borderColor: 'blue',
                        tension: 0.1
                    },
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[1].realisePar,
                        data: selectedUser[1].resultats,
                        fill: false,
                        borderColor: 'red',
                        tension: 0.1
                    },
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[2].realisePar,
                        data: selectedUser[2].resultats,
                        fill: false,
                        borderColor: 'green',
                        tension: 0.1
                    },
                    {
                        label: "Estimation réalisée par l'utilisateur: "+selectedUser[3].realisePar,
                        data: selectedUser[3].resultats,
                        fill: false,
                        borderColor: 'black',
                        tension: 0.1
                    },
                ]
            };
            break;
    }

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Niveau Charge Mental "
                }
            },
            x: {
                title: {
                    display: true,
                    text: "Temps (seconde)"
                }
            }
        }
    };

    canvas.style.width = "30%";
    canvas.style.height = "15%";

    if (myCharts[chartIndex]) {
        myCharts[chartIndex].destroy();
    }

    myCharts[chartIndex] = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}

getDonnee();

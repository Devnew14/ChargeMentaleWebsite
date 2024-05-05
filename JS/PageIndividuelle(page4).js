let usersData = {};
let repereID = 0;
let displayedNotes = {}; // Objet global pour suivre les notes affichées

const recreateButton = document.getElementById('reset-button');
recreateButton.addEventListener('click', () => {
    location.reload();
});

const newTableButton = document.getElementById('new-struc-button');

newTableButton.addEventListener('click', () => {
    // Appeler la fonction pour créer un nouveau tableau
    creerStructure();
});


function RecupererDonnees() {
    // Récupérer les données depuis Firebase via l'URL spécifique
    fetch('https://applicationbdd-default-rtdb.europe-west1.firebasedatabase.app/utilisateurs.json')
        .then(response => response.json())
        .then(data => {
            // Parcourir chaque utilisateur
            for (const userId in data) {
                const user = data[userId];

                // Vérifier si l'utilisateur a des données d'évaluations individuelles
                if (user.nom && user.prenom && user.evaluations && user.evaluations.evaluations_seul) {
                    // Créer une clé composée du nom et du prénom
                    const fullName = `${user.prenom} ${user.nom}`;
                    // Stocker les données d'évaluations individuelles sous la clé du nom complet
                    usersData[fullName] = user.evaluations.evaluations_seul;
                }
            }

            // Une fois les données récupérées avec succès, remplir le sélecteur avec les noms complets des utilisateurs
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données depuis Firebase:', error);
        });
}

RecupererDonnees();

// Fonction pour remplir le sélecteur avec les noms complets des utilisateurs
function remplirSelectAvecNomsComplets() {
    // Sélectionner le sélecteur
    const selectElement = document.getElementById('user-select'+repereID);

    // Parcourir les clés de usersData (les noms complets des utilisateurs)
    for (const fullName in usersData) {
        // Créer une option pour chaque nom complet
        const option = document.createElement('option');
        option.text = fullName;
        option.value = fullName;

        // Ajouter l'option au sélecteur
        selectElement.appendChild(option);
    }

    // Ajouter un écouteur d'événement pour détecter les changements de sélection dans le sélecteur
    selectElement.addEventListener('change', () => {
        const selectedUser = selectElement.value;
        afficherDonneesUtilisateur(selectedUser);
    });
}

function afficherDonneesUtilisateur(selectedUser) {
    const userNotes = usersData[selectedUser].note;

    // Sélectionner l'élément où afficher les données de l'utilisateur
    const userDataElement = document.getElementById('user-data' + (repereID - 1));

    // Effacer le contenu existant
    userDataElement.innerHTML = '';

    const selectDate = document.createElement('select');
    selectDate.id = 'note-date-select' + (repereID - 1);

    // Ajouter une option vide pour la première sélection
    const emptyOption = document.createElement('option');
    emptyOption.text = 'Choisir une évaluation';
    emptyOption.disabled = true;
    emptyOption.selected = true;
    selectDate.appendChild(emptyOption);

    // Remplir le sélecteur avec les dates des notes disponibles
    for (const noteKey in userNotes) {
        const option = document.createElement('option');
        option.text = `${noteKey}`;
        option.value = noteKey;
        selectDate.appendChild(option);
    }

    selectDate.addEventListener('change', () => {
        const selectedDate = selectDate.value;
        const datePrefix = selectedDate.split('-').slice(0, 3).join('-'); // Obtenir le préfixe de date
        afficherDetailsNote(datePrefix, userNotes); // Passer le préfixe et les notes
    });

    const noteDateContainer = document.getElementById('note-date-container' + (repereID - 1));
    noteDateContainer.innerHTML = '';
    noteDateContainer.appendChild(selectDate);
}

function afficherDetailsNote(datePrefix, userNotes) {
    const userDataTbody = document.getElementById('user-data' + (repereID - 1));

    // Parcourir les notes avec le même préfixe
    for (const noteKey in userNotes) {
        if (noteKey.startsWith(datePrefix) && !displayedNotes[noteKey]) {
            const noteDetails = userNotes[noteKey];

            // Obtenir uniquement la date sans le timestamp
            const dateOnly = noteKey.split('-').slice(0, 3).join('-'); // Année-mois-jour

            const newRow = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = dateOnly; // Afficher la date sans le timestamp

            const echelleCell = document.createElement('td');
            echelleCell.textContent = noteDetails.echelle;

            const frequenceCell = document.createElement('td');
            frequenceCell.textContent = noteDetails.frequence;


            const resultatsCell = document.createElement('td');
            resultatsCell.textContent = noteDetails.resultat.join(', ');

            const removeButtonCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Retirer';
            removeButton.addEventListener('click', () => {
                delete displayedNotes[noteKey];
                newRow.remove();
            });
            removeButtonCell.appendChild(removeButton);

            newRow.appendChild(dateCell);
            newRow.appendChild(echelleCell);
            newRow.appendChild(frequenceCell);
            newRow.appendChild(resultatsCell);
            newRow.appendChild(removeButtonCell);

            userDataTbody.appendChild(newRow);

            displayedNotes[noteKey] = true;
        }
    }
}


function creerStructure() {
    const structureContainer = document.createElement('div'); // Créer un conteneur pour la structure
    structureContainer.classList.add('structure-container'); // Ajouter une classe pour cibler le conteneur

    const selectLabel = document.createElement('label'); // Créer un label pour le selecteur
    selectLabel.textContent = "Choisir un utilisateur:"; // Texte du label
    const selectUser = document.createElement('select'); // Créer un selecteur
    selectUser.id = "user-select" + repereID; // Lui donne un id qui sera unique
    selectLabel.setAttribute('for', selectUser.id); // Associer le label au selecteur
    // Ajouter une option vide pour la première sélection
    const emptyOption = document.createElement('option');
    emptyOption.text = 'Liste des utilisateurs';
    emptyOption.disabled = true;
    emptyOption.selected = true;
    selectUser.appendChild(emptyOption);
    const dateContainer = document.createElement('div'); // Créer l'emplacement du sélecteur de date
    dateContainer.id = 'note-date-container' + repereID; // Lui donne un id qui sera unique

    const table = document.createElement('table'); // Créer le tableau
    table.id = "data-list" + repereID; // Lui donne un id unique
    const tableHead = document.createElement('thead');
    const tableHeadRow = document.createElement('tr');
    const headers = ['Date de l\'évaluation', 'Échelle d\'évaluation', 'Fréquence des notifications (en secondes)', 'Résultats des appuis'];
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        tableHeadRow.appendChild(header);
    });
    tableHead.appendChild(tableHeadRow);
    table.appendChild(tableHead);
    // Création du corps du tableau
    const tableBody = document.createElement('tbody');
    tableBody.id = 'user-data' + repereID;
    table.appendChild(tableBody);

    // Bouton pour supprimer la structure
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Supprimer';
    removeButton.addEventListener('click', () => {
        structureContainer.remove(); // Supprimer la structure du document
    });

    // Ajout des éléments créés au conteneur de structure
    structureContainer.appendChild(selectLabel); // Ajout du label
    structureContainer.appendChild(selectUser);
    structureContainer.appendChild(document.createElement('br'));
    structureContainer.appendChild(dateContainer);
    structureContainer.appendChild(document.createElement('br'));
    structureContainer.appendChild(table);
    structureContainer.appendChild(removeButton); // Ajout du bouton de suppression

    // Ajout de la structure complète au document
    document.body.appendChild(structureContainer);

    remplirSelectAvecNomsComplets(); // Remplir le sélecteur avec les noms complets des utilisateurs
    repereID++;
}


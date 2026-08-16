let usersData = {};
let repereID = 0;
let displayedNotes = {};


// ==========================================
// RESET
// ==========================================

const recreateButton =
    document.getElementById('reset-button');

recreateButton.addEventListener('click', () => {
    location.reload();
});


// ==========================================
// BOUTON NOUVELLE STRUCTURE
// ==========================================

const newTableButton =
    document.getElementById('new-struc-button');

newTableButton.addEventListener('click', () => {
    creerStructure();
});


// ==========================================
// RÉCUPÉRER LES DONNÉES
// ==========================================

async function RecupererDonnees() {

    try {

        const response = await fetch(
            'https://mini-jul-dad-tomorrow.trycloudflare.com/api/evaluations/collectives'
        );

        if (!response.ok) {
            throw new Error(
                'Erreur HTTP : ' + response.status
            );
        }

        const data = await response.json();

        // On garde directement la structure
        // renvoyée par notre API
        usersData = data;

        console.log(
            'Données collectives récupérées :',
            usersData
        );

        return true;

    } catch (error) {

        console.error(
            'Erreur lors de la récupération des données depuis MySQL :',
            error
        );

        return false;
    }
}


// ==========================================
// CHARGEMENT INITIAL
// ==========================================

RecupererDonnees();


// ==========================================
// REMPLIR LA LISTE DES UTILISATEURS
// ==========================================

function remplirSelectAvecNomsComplets() {

    const selectElement =
        document.getElementById(
            'user-select' + repereID
        );

    if (!selectElement) {
        return;
    }

    selectElement.innerHTML = '';


    const emptyOption =
        document.createElement('option');

    emptyOption.text =
        'Liste des utilisateurs';

    emptyOption.disabled = true;
    emptyOption.selected = true;

    selectElement.appendChild(
        emptyOption
    );


    for (const fullName in usersData) {

        const option =
            document.createElement('option');

        option.text = fullName;
        option.value = fullName;

        selectElement.appendChild(option);
    }


    selectElement.addEventListener(
        'change',
        () => {

            const selectedUser =
                selectElement.value;

            afficherDonneesUtilisateur(
                selectedUser
            );
        }
    );
}


// ==========================================
// AFFICHER LES DONNÉES D'UN UTILISATEUR
// ==========================================

function afficherDonneesUtilisateur(
    selectedUser
) {

    if (!usersData[selectedUser]) {
        return;
    }

    const userNotes =
        usersData[selectedUser].notes;


    const userDataElement =
        document.getElementById(
            'user-data' + (repereID - 1)
        );

    userDataElement.innerHTML = '';


    const selectDate =
        document.createElement('select');

    selectDate.id =
        'note-date-select' + (repereID - 1);


    const emptyOption =
        document.createElement('option');

    emptyOption.text =
        'Choisir une évaluation';

    emptyOption.disabled = true;
    emptyOption.selected = true;

    selectDate.appendChild(
        emptyOption
    );


    // Ajouter les évaluations disponibles
    for (const noteKey in userNotes) {

        const option =
            document.createElement('option');

        const noteDetails =
            userNotes[noteKey];

        option.text =
            `${noteKey} - ${noteDetails.realisePar}`;

        option.value =
            noteKey;

        selectDate.appendChild(
            option
        );
    }


    selectDate.addEventListener(
        'change',
        () => {

            const selectedDate =
                selectDate.value;

            const datePrefix =
                selectedDate
                    .split('-')
                    .slice(0, 3)
                    .join('-');

            afficherDetailsNote(
                datePrefix,
                userNotes
            );
        }
    );


    const noteDateContainer =
        document.getElementById(
            'note-date-container' +
            (repereID - 1)
        );

    noteDateContainer.innerHTML = '';

    noteDateContainer.appendChild(
        selectDate
    );
}


// ==========================================
// AFFICHER LES DÉTAILS
// ==========================================

function afficherDetailsNote(
    datePrefix,
    userNotes
) {

    const userDataTbody =
        document.getElementById(
            'user-data' + (repereID - 1)
        );


    for (const noteKey in userNotes) {

        if (
            noteKey.startsWith(datePrefix) &&
            !displayedNotes[noteKey]
        ) {

            const noteDetails =
                userNotes[noteKey];


            const dateOnly =
                noteKey
                    .split('-')
                    .slice(0, 3)
                    .join('-');


            const newRow =
                document.createElement('tr');


            // DATE
            const dateCell =
                document.createElement('td');

            dateCell.textContent =
                dateOnly;


            // ÉCHELLE
            const echelleCell =
                document.createElement('td');

            echelleCell.textContent =
                noteDetails.echelle;


            // FRÉQUENCE
            const frequenceCell =
                document.createElement('td');

            frequenceCell.textContent =
                noteDetails.frequence;


            // RÉALISÉ PAR
            const realiseParCell =
                document.createElement('td');

            realiseParCell.textContent =
                noteDetails.realisePar;


            // RÉSULTATS
            const resultatsCell =
                document.createElement('td');

            resultatsCell.textContent =
                noteDetails.resultats.join(', ');


            // BOUTON RETIRER
            const removeButtonCell =
                document.createElement('td');

            const removeButton =
                document.createElement('button');

            removeButton.textContent =
                'Retirer';


            removeButton.addEventListener(
                'click',
                () => {

                    delete displayedNotes[noteKey];

                    newRow.remove();
                }
            );


            removeButtonCell.appendChild(
                removeButton
            );


            // AJOUTER LES CELLULES
            newRow.appendChild(dateCell);
            newRow.appendChild(echelleCell);
            newRow.appendChild(frequenceCell);
            newRow.appendChild(realiseParCell);
            newRow.appendChild(resultatsCell);
            newRow.appendChild(removeButtonCell);


            userDataTbody.appendChild(
                newRow
            );


            displayedNotes[noteKey] = true;
        }
    }
}


// ==========================================
// CRÉER UNE STRUCTURE
// ==========================================

async function creerStructure() {

    // Si les données ne sont pas encore chargées
    if (Object.keys(usersData).length === 0) {

        const success =
            await RecupererDonnees();

        if (!success) {
            return;
        }
    }


    displayedNotes = {};


    const structureContainer =
        document.createElement('div');

    structureContainer.classList.add(
        'structure-container'
    );


    // LABEL
    const selectLabel =
        document.createElement('label');

    selectLabel.textContent =
        'Choisir un utilisateur:';


    // SELECT UTILISATEUR
    const selectUser =
        document.createElement('select');

    selectUser.id =
        'user-select' + repereID;


    selectLabel.setAttribute(
        'for',
        selectUser.id
    );


    const emptyOption =
        document.createElement('option');

    emptyOption.text =
        'Liste des utilisateurs';

    emptyOption.disabled = true;
    emptyOption.selected = true;

    selectUser.appendChild(
        emptyOption
    );


    // CONTENEUR DATE
    const dateContainer =
        document.createElement('div');

    dateContainer.id =
        'note-date-container' + repereID;


    // TABLE
    const table =
        document.createElement('table');

    table.id =
        'data-list' + repereID;


    const tableHead =
        document.createElement('thead');

    const tableHeadRow =
        document.createElement('tr');


    const headers = [
        "Date de l'évaluation",
        "Échelle d'évaluation",
        "Fréquence des notifications (en secondes)",
        "Estimée par",
        "Résultats des appuis"
    ];


    headers.forEach(headerText => {

        const header =
            document.createElement('th');

        header.textContent =
            headerText;

        tableHeadRow.appendChild(
            header
        );
    });


    tableHead.appendChild(
        tableHeadRow
    );

    table.appendChild(
        tableHead
    );


    // CORPS DU TABLEAU
    const tableBody =
        document.createElement('tbody');

    tableBody.id =
        'user-data' + repereID;

    table.appendChild(
        tableBody
    );


    // BOUTON SUPPRIMER
    const removeButton =
        document.createElement('button');

    removeButton.textContent =
        'Supprimer';


    removeButton.addEventListener(
        'click',
        () => {

            structureContainer.remove();
        }
    );


    // AJOUTER LES ÉLÉMENTS
    structureContainer.appendChild(
        selectLabel
    );

    structureContainer.appendChild(
        selectUser
    );

    structureContainer.appendChild(
        document.createElement('br')
    );

    structureContainer.appendChild(
        dateContainer
    );

    structureContainer.appendChild(
        document.createElement('br')
    );

    structureContainer.appendChild(
        table
    );

    structureContainer.appendChild(
        removeButton
    );


    document.body.appendChild(
        structureContainer
    );


    remplirSelectAvecNomsComplets();


    repereID++;
}
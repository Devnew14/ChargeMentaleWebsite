// javascript
let usersData = {};
let repereID = 0;
let displayedNotes = {};


// ==========================================
// BOUTON RESET
// ==========================================

const recreateButton = document.getElementById("reset-button");

if (recreateButton) {
    recreateButton.addEventListener("click", () => {
        location.reload();
    });
}


// ==========================================
// CHARGER LES DONNÉES DEPUIS NODE.JS
// ==========================================

async function RecupererDonnees() {

    try {

        const response = await fetch(
            "https://mini-jul-dad-tomorrow.trycloudflare.com/api/evaluations/individuelles"
        );

        if (!response.ok) {
            throw new Error(
                "Erreur lors de la récupération des évaluations"
            );
        }

        const data = await response.json();

        console.log(
            "Évaluations individuelles récupérées :",
            data
        );

        usersData = data;

        return usersData;

    } catch (error) {

        console.error(
            "Erreur lors de la récupération des données :",
            error
        );

        alert(
            "Impossible de récupérer les évaluations individuelles."
        );

        return {};
    }
}


// ==========================================
// REMPLIR LA LISTE DES UTILISATEURS
// ==========================================

function remplirSelectAvecNomsComplets(structureID) {

    const selectElement =
        document.getElementById(
            "user-select" + structureID
        );

    if (!selectElement) {
        return;
    }

    selectElement.innerHTML = "";

    const emptyOption =
        document.createElement("option");

    emptyOption.text =
        "Liste des utilisateurs";

    emptyOption.disabled = true;
    emptyOption.selected = true;

    selectElement.appendChild(
        emptyOption
    );


    for (const fullName in usersData) {

        const option =
            document.createElement("option");

        option.text =
            fullName;

        option.value =
            fullName;

        selectElement.appendChild(
            option
        );
    }


    selectElement.addEventListener(
        "change",
        () => {

            const selectedUser =
                selectElement.value;

            afficherDonneesUtilisateur(
                selectedUser,
                structureID
            );
        }
    );
}


// ==========================================
// AFFICHER LES DONNÉES D'UN UTILISATEUR
// ==========================================

function afficherDonneesUtilisateur(
    selectedUser,
    structureID
) {

    if (!usersData[selectedUser]) {
        return;
    }


    const userNotes =
        usersData[selectedUser].note || {};


    const noteDateContainer =
        document.getElementById(
            "note-date-container" + structureID
        );


    if (!noteDateContainer) {
        return;
    }


    noteDateContainer.innerHTML = "";


    const selectDate =
        document.createElement("select");


    selectDate.id =
        "note-date-select" + structureID;


    const emptyOption =
        document.createElement("option");

    emptyOption.text =
        "Choisir une évaluation";

    emptyOption.disabled = true;
    emptyOption.selected = true;


    selectDate.appendChild(
        emptyOption
    );


    /*
     * Ajouter toutes les évaluations
     * disponibles pour l'utilisateur.
     */
    for (const noteKey in userNotes) {

        const noteDetails =
            userNotes[noteKey];


        const option =
            document.createElement("option");


        option.text =
            `${noteKey} - Échelle ${noteDetails.echelle}`;


        option.value =
            noteKey;


        selectDate.appendChild(
            option
        );
    }


    selectDate.addEventListener(
        "change",
        () => {

            const selectedDate =
                selectDate.value;

            afficherDetailsNote(
                selectedDate,
                userNotes,
                structureID
            );
        }
    );


    noteDateContainer.appendChild(
        selectDate
    );
}


// ==========================================
// AFFICHER LES DÉTAILS D'UNE ÉVALUATION
// ==========================================

function afficherDetailsNote(
    selectedDate,
    userNotes,
    structureID
) {

    const userDataTbody =
        document.getElementById(
            "user-data" + structureID
        );


    if (!userDataTbody) {
        return;
    }


    const noteDetails =
        userNotes[selectedDate];


    if (!noteDetails) {
        return;
    }


    /*
     * Nettoyer le tableau.
     */
    userDataTbody.innerHTML = "";


    const newRow =
        document.createElement("tr");


    // ======================================
    // DATE
    // ======================================

    const dateCell =
        document.createElement("td");

    dateCell.textContent =
        selectedDate;


    // ======================================
    // ÉCHELLE
    // ======================================

    const echelleCell =
        document.createElement("td");

    echelleCell.textContent =
        noteDetails.echelle;


    // ======================================
    // FRÉQUENCE
    // ======================================

    const frequenceCell =
        document.createElement("td");

    frequenceCell.textContent =
        noteDetails.frequence;


    // ======================================
    // RÉSULTATS
    // ======================================

    const resultatsCell =
        document.createElement("td");


    if (
        Array.isArray(
            noteDetails.resultat
        )
    ) {

        resultatsCell.textContent =
            noteDetails.resultat.join(", ");

    } else {

        resultatsCell.textContent =
            noteDetails.resultat || "";
    }


    // ======================================
    // BOUTON RETIRER
    // ======================================

    const removeButtonCell =
        document.createElement("td");


    const removeButton =
        document.createElement("button");


    removeButton.textContent =
        "Retirer";


    removeButton.addEventListener(
        "click",
        () => {

            newRow.remove();

        }
    );


    removeButtonCell.appendChild(
        removeButton
    );


    // ======================================
    // AJOUTER LES CELLULES
    // ======================================

    newRow.appendChild(
        dateCell
    );

    newRow.appendChild(
        echelleCell
    );

    newRow.appendChild(
        frequenceCell
    );

    newRow.appendChild(
        resultatsCell
    );

    newRow.appendChild(
        removeButtonCell
    );


    userDataTbody.appendChild(
        newRow
    );
}


// ==========================================
// CRÉER UNE STRUCTURE
// ==========================================

async function creerStructure() {

    /*
     * Si les données ne sont pas encore chargées,
     * on attend leur chargement.
     */
    if (
        !usersData ||
        Object.keys(usersData).length === 0
    ) {

        await RecupererDonnees();
    }


    /*
     * Vérification après chargement.
     */
    if (
        !usersData ||
        Object.keys(usersData).length === 0
    ) {

        alert(
            "Aucun utilisateur ou aucune évaluation disponible."
        );

        return;
    }


    const structureID =
        repereID;


    // ======================================
    // CONTAINER
    // ======================================

    const structureContainer =
        document.createElement("div");

    structureContainer.classList.add(
        "structure-container"
    );


    // ======================================
    // LABEL
    // ======================================

    const selectLabel =
        document.createElement("label");

    selectLabel.textContent =
        "Choisir un utilisateur:";


    // ======================================
    // SELECT UTILISATEUR
    // ======================================

    const selectUser =
        document.createElement("select");


    selectUser.id =
        "user-select" + structureID;


    selectLabel.setAttribute(
        "for",
        selectUser.id
    );


    const emptyOption =
        document.createElement("option");


    emptyOption.text =
        "Liste des utilisateurs";

    emptyOption.disabled = true;
    emptyOption.selected = true;


    selectUser.appendChild(
        emptyOption
    );


    // ======================================
    // CONTAINER DES DATES
    // ======================================

    const dateContainer =
        document.createElement("div");


    dateContainer.id =
        "note-date-container" +
        structureID;


    // ======================================
    // TABLEAU
    // ======================================

    const table =
        document.createElement("table");


    table.id =
        "data-list" +
        structureID;


    // ======================================
    // EN-TÊTE DU TABLEAU
    // ======================================

    const tableHead =
        document.createElement("thead");


    const tableHeadRow =
        document.createElement("tr");


    const headers = [
        "Date de l'évaluation",
        "Échelle d'évaluation",
        "Fréquence des notifications (en secondes)",
        "Résultats des appuis",
        "Action"
    ];


    headers.forEach(
        headerText => {

            const header =
                document.createElement("th");

            header.textContent =
                headerText;

            tableHeadRow.appendChild(
                header
            );
        }
    );


    tableHead.appendChild(
        tableHeadRow
    );


    table.appendChild(
        tableHead
    );


    // ======================================
    // CORPS DU TABLEAU
    // ======================================

    const tableBody =
        document.createElement("tbody");


    tableBody.id =
        "user-data" +
        structureID;


    table.appendChild(
        tableBody
    );


    // ======================================
    // BOUTON SUPPRIMER
    // ======================================

    const removeButton =
        document.createElement("button");


    removeButton.textContent =
        "Supprimer";


    removeButton.addEventListener(
        "click",
        () => {

            structureContainer.remove();

        }
    );


    // ======================================
    // ASSEMBLAGE
    // ======================================

    structureContainer.appendChild(
        selectLabel
    );

    structureContainer.appendChild(
        selectUser
    );

    structureContainer.appendChild(
        document.createElement("br")
    );

    structureContainer.appendChild(
        dateContainer
    );

    structureContainer.appendChild(
        document.createElement("br")
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


    /*
     * Remplir la liste des utilisateurs.
     */
    remplirSelectAvecNomsComplets(
        structureID
    );


    repereID++;
}


// ==========================================
// BOUTON AJOUTER UN UTILISATEUR
// ==========================================

const newTableButton =
    document.getElementById(
        "new-struc-button"
    );


if (newTableButton) {

    newTableButton.addEventListener(
        "click",
        () => {

            creerStructure();

        }
    );
}


// ==========================================
// CHARGEMENT INITIAL
// ==========================================

RecupererDonnees();


let usersName = [];
let usersData = [];
let myChart = null; // Variable qui contient le graph 
let usersInfo = [];



function RecupererDonnees() {
    // Récupérer les données depuis Firebase via l'URL spécifique
    fetch('https://applicationbdd-default-rtdb.europe-west1.firebasedatabase.app/utilisateurs.json')
        .then(response => response.json())
        .then(data => {
            // Parcourir chaque utilisateur
            for (const userId in data) {
                const user = data[userId];
                // Vérifier si l'utilisateur a des données d'évaluations individuelles
                if (user.nom && user.prenom && user.evaluations && user.evaluations.evaluations_seul && user.evaluations.evaluations_seul.note) {

                    // Créer une clé composée du nom et du prénom
                    const fullName = `${user.prenom} ${user.nom}`;
                    // Stocker les données d'évaluations individuelles sous la clé du nom complet
                    usersName.push(fullName);//stocker les noms
                    usersData[fullName] = user.evaluations.evaluations_seul.note;
                    usersInfo[fullName] = [user.nom , user.prenom ,user.date_naissance,user.sexe,user.metier];
                }
            }

            // Une fois les données récupérées avec succès, remplir le sélecteur avec les noms complets des utilisateurs
            chargeSelcteurName();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données depuis Firebase:', error);
        });
    
    
}


RecupererDonnees();



// Fonction pour afficher le graphique
function afficherGraphique(fullName,ladate) {
    chargenfos(fullName);
    const canvas = document.getElementById('graphique');
    if (!canvas) {
        console.error("Element canvas non trouvé.");
        return null;
    }
    const user=usersData[fullName];
    const lesinter = generateStringValues( user[ladate].frequence , (user[ladate].resultat.length)) ;
    const ctx = canvas.getContext('2d');
    const data = {
        labels:  lesinter,
        datasets: [{
            label: fullName ,
            data: user[ladate].resultat,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    // Options du graphique
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


    // Modifier la taille du canvas du graphique une fois que le bouton "Valider" est pressé
    canvas.style.width = "30%"; 
    canvas.style.height = "15%"; 

    // Si un graphique existe déjà, détruire l'instance existante
    if (myChart !== null) {
        myChart.destroy();
    }

    // Créer le graphique
    myChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });

    
}



function inter(){
    if ( document.getElementById('userDropdown').value != '' &&  document.getElementById('userDropdown').value !='' ){
        afficherGraphique( document.getElementById('userDropdown').value , document.getElementById('datesTest').value);
    
    }
    else{
        alert('selectionner une date et/ou un utilisateur ');
    }
}





// Fonction pour générer les valeurs de la chaîne
function generateStringValues(notificationFrequency,nb) {
    const values = [];
    for (let i = 0; i < nb ; i++) {
        values.push(i * notificationFrequency);
    }
    return values;
}




function chargeSelcteurName(){//ajouter les different nom dans la liste deroulante 
    const baliseSelecteur = document.getElementById('userDropdown');
    usersName.forEach( user =>{
        const option =document.createElement('option');
        option.text = user;
        option.value = user;
        baliseSelecteur.appendChild(option);
    });

    // Peupler également le menu déroulant des dates lorsque le nom d'utilisateur est sélectionné
    chargeSelcteurDate();
}

function chargenfos(fullName) {
    const userInfo = usersInfo[fullName];
    if (userInfo) {
        const pnom = document.querySelector('.p-nom');
        const pprenom = document.querySelector('.p-prenom');
        const page = document.querySelector('.p-age');
        const psexe = document.querySelector('.p-sexe');
        const pmetier = document.querySelector('.p-metier');

        if (pnom) pnom.textContent = "Nom: " + userInfo[0];
        if (pprenom) pprenom.textContent = "Prénom: " + userInfo[1];
        if (page) page.textContent = "Date de Naissance: " + userInfo[2];
        if (psexe) psexe.textContent = "Sexe: " + userInfo[3];
        if (pmetier) pmetier.textContent = "Métier: " + userInfo[4];
    }
}


function chargeSelcteurDate() {
    const nameSelected = document.getElementById('userDropdown').value;
    const baliseSelecteurdate = document.getElementById('datesTest');
    const notes = Object.keys(usersData[nameSelected]); // Obtenir les clés (dates) de l'objet note

    // Effacer les options précédentes
    baliseSelecteurdate.innerHTML = '';

    // Ajouter l'option par défaut "Choisissez une date"
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.text = "Choisissez une date";
    baliseSelecteurdate.appendChild(defaultOption);

    // Ajouter les autres options pour chaque date disponible
    notes.forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.text = note.split('-').slice(0, 3).join('/');
        baliseSelecteurdate.appendChild(option);
    });
}


document.addEventListener('DOMContentLoaded', function() {
    // Écouteur d'événements pour le changement de sélection dans le menu déroulant des noms d'utilisateurs
    document.getElementById('userDropdown').addEventListener('change', function() {
        // Lorsque le nom de l'utilisateur est sélectionné, peuple le menu déroulant des dates correspondantes
        chargeSelcteurDate();
    });
});
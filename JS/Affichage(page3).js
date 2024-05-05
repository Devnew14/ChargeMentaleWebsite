// Récupérer les données depuis Firebase via l'URL spécifique
fetch('https://applicationbdd-default-rtdb.europe-west1.firebasedatabase.app/utilisateurs.json')
    .then(response => response.json())
    .then(data => {
        // Initialiser un compteur pour le numéro d'utilisateur
        let userNumber = 1;
        // Créer un tableau pour stocker les numéros d'utilisateur
        const userNumbers = [];
        // Sélectionner l'élément tbody de la table
        const tbody = document.getElementById('user-data');

        // Parcourir chaque utilisateur
        for (const userId in data) {
            const user = data[userId];

            // Vérifier si les champs "nom" et "prénom" sont définis et non vides
            if (user.nom && user.prenom) {
                // Créer une nouvelle ligne pour chaque utilisateur
                const newRow = document.createElement('tr');
                // Remplir les cellules de la ligne avec les données utilisateur
                newRow.innerHTML = `
                    <td>${userNumber}</td>
                    <td>${user.nom}</td>
                    <td>${user.prenom}</td>
                `;
                // Ajouter la nouvelle ligne au tbody de la table
                tbody.appendChild(newRow);

                // Ajouter le numéro d'utilisateur au tableau
                userNumbers.push(userNumber);
                userNumber++; // Incrémenter le numéro d'utilisateur
            }
        }

        // Stocker les numéros d'utilisateur dans le stockage local du navigateur
        localStorage.setItem('userNumbers', JSON.stringify(userNumbers));
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des données depuis Firebase:', error);
    });

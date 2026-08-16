fetch('https://mini-jul-dad-tomorrow.trycloudflare.com/api/utilisateurs')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        return response.json();
    })
    .then(data => {
        let userNumber = 1;
        const userNumbers = [];
        const tbody = document.getElementById('user-data');

        for (const user of data) {
            if (user.nom && user.prenom) {
                const newRow = document.createElement('tr');

                newRow.innerHTML = `
                    <td>${userNumber}</td>
                    <td>${user.nom}</td>
                    <td>${user.prenom}</td>
                `;

                tbody.appendChild(newRow);

                userNumbers.push(userNumber);
                userNumber++;
            }
        }

        localStorage.setItem(
            'userNumbers',
            JSON.stringify(userNumbers)
        );
    })
    .catch(error => {
        console.error(
            'Erreur lors de la récupération des utilisateurs :',
            error
        );
    });
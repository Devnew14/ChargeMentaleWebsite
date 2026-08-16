const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());


// ==========================================
// RÉCUPÉRER LES UTILISATEURS
// ==========================================

app.get("/api/utilisateurs", async (req, res) => {
    try {

        const [users] = await db.query(
            "SELECT id, nom, prenom FROM users"
        );

        res.json(users);

    } catch (error) {

        console.error("Erreur utilisateurs :", error);

        res.status(500).json({
            error: "Erreur serveur"
        });
    }
});


// ==========================================
// INSCRIPTION
// ==========================================

app.post("/api/auth/register", async (req, res) => {

    try {

        const {
            email,
            password,
            nom,
            prenom,
            date_naissance,
            sexe,
            metier
        } = req.body;


        // Vérification des champs obligatoires
        if (!email || !password || !nom || !prenom) {

            return res.status(400).json({
                error:
                    "Email, mot de passe, nom et prénom sont obligatoires"
            });
        }


        // Vérifier si l'email existe déjà
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                error: "Cet email existe déjà"
            });
        }


        // Hash du mot de passe
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Conversion jj/mm/aaaa -> aaaa-mm-jj
        let dateMysql = null;

        if (date_naissance) {

            const parts =
                date_naissance.split("/");

            if (parts.length === 3) {

                dateMysql =
                    `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }


        // Création de l'utilisateur
        const [result] = await db.query(
            `INSERT INTO users
            (
                email,
                password,
                nom,
                prenom,
                date_naissance,
                sexe,
                metier
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                email,
                hashedPassword,
                nom,
                prenom,
                dateMysql,
                sexe || null,
                metier || null
            ]
        );


        res.status(201).json({

            success: true,

            userId: result.insertId
        });


    } catch (error) {

        console.error(
            "Erreur inscription :",
            error
        );

        res.status(500).json({
            error: "Erreur serveur"
        });
    }
});


// ==========================================
// CONNEXION
// ==========================================

app.post("/api/auth/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                error:
                    "Email et mot de passe obligatoires"
            });
        }


        const [users] = await db.query(

            `SELECT
                id,
                email,
                password,
                nom,
                prenom,
                date_naissance,
                sexe,
                metier
             FROM users
             WHERE email = ?`,

            [email]
        );


        if (users.length === 0) {

            return res.status(401).json({
                error:
                    "Email ou mot de passe incorrect"
            });
        }


        const user = users[0];


        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordCorrect) {

            return res.status(401).json({
                error:
                    "Email ou mot de passe incorrect"
            });
        }


        res.json({

            success: true,

            user: {

                id: user.id,

                email: user.email,

                nom: user.nom,

                prenom: user.prenom,

                date_naissance:
                    user.date_naissance,

                sexe:
                    user.sexe,

                metier:
                    user.metier
            }
        });


    } catch (error) {

        console.error(
            "Erreur connexion :",
            error
        );

        res.status(500).json({
            error: "Erreur serveur"
        });
    }
});


// ==========================================
// AJOUTER UNE ÉVALUATION INDIVIDUELLE
// ==========================================

app.post(
    "/api/evaluations/individuelles",
    async (req, res) => {

        try {

            const {
                user_id,
                echelle,
                frequence,
                resultats
            } = req.body;


            // Vérification
            if (
                !user_id ||
                echelle === undefined ||
                frequence === undefined ||
                !resultats
            ) {

                return res.status(400).json({

                    error:
                        "user_id, echelle, frequence et resultats sont obligatoires"
                });
            }


            // Vérifier que l'utilisateur existe
            const [users] = await db.query(

                "SELECT id FROM users WHERE id = ?",

                [user_id]
            );


            if (users.length === 0) {

                return res.status(404).json({

                    error:
                        "Utilisateur introuvable"
                });
            }


            // Vérifier que resultats est bien un tableau
            if (!Array.isArray(resultats)) {

                return res.status(400).json({

                    error:
                        "resultats doit être un tableau"
                });
            }


            // Date actuelle
            const dateEvaluation =
                new Date();


            // Insérer l'évaluation
            const [result] = await db.query(

                `INSERT INTO individual_evaluations
                (
                    user_id,
                    date_evaluation,
                    echelle,
                    frequence,
                    resultats
                )
                VALUES (?, ?, ?, ?, ?)`,

                [
                    user_id,
                    dateEvaluation,
                    echelle,
                    frequence,
                    JSON.stringify(resultats)
                ]
            );


            res.status(201).json({

                success: true,

                evaluationId:
                    result.insertId,

                message:
                    "Évaluation individuelle enregistrée"
            });


        } catch (error) {

            console.error(
                "Erreur ajout évaluation individuelle :",
                error
            );


            res.status(500).json({

                error:
                    "Erreur serveur"
            });
        }
    }
);


// ==========================================
// RÉCUPÉRER LES ÉVALUATIONS INDIVIDUELLES
// ==========================================

app.get(
    "/api/evaluations/individuelles",
    async (req, res) => {

        try {

            const [users] = await db.query(`
                SELECT 
                    u.id,
                    u.nom,
                    u.prenom,
                    u.date_naissance,
                    u.sexe,
                    u.metier,
                    ie.id AS evaluation_id,
                    ie.date_evaluation,
                    ie.echelle,
                    ie.frequence,
                    ie.resultats
                FROM users u
                LEFT JOIN individual_evaluations ie
                    ON u.id = ie.user_id
                WHERE u.nom IS NOT NULL
                AND u.prenom IS NOT NULL
                ORDER BY u.id, ie.date_evaluation
            `);


            const usersData = {};


            for (const row of users) {

                const fullName =
                    `${row.prenom} ${row.nom}`;


                // Créer l'utilisateur
                if (!usersData[fullName]) {

                    usersData[fullName] = {

                        nom: row.nom,

                        prenom: row.prenom,

                        date_naissance:
                            row.date_naissance,

                        sexe:
                            row.sexe,

                        metier:
                            row.metier,

                        note: {}
                    };
                }


                // Ajouter l'évaluation
                if (
                    row.evaluation_id !== null
                ) {

                    const dateKey =
                        formatDateKey(
                            row.date_evaluation
                        );


                    let resultats =
                        row.resultats;


                    // JSON MySQL -> tableau JS
                    if (
                        typeof resultats === "string"
                    ) {

                        try {

                            resultats =
                                JSON.parse(
                                    resultats
                                );

                        } catch (error) {

                            console.error(
                                "Erreur JSON resultats :",
                                error
                            );

                            resultats = [];
                        }
                    }


                    usersData[fullName].note[
                        dateKey
                    ] = {

                        echelle:
                            row.echelle,

                        frequence:
                            row.frequence,

                        resultat:
                            resultats
                    };
                }
            }


            res.json(usersData);


        } catch (error) {

            console.error(
                "Erreur évaluations individuelles :",
                error
            );

            res.status(500).json({

                error:
                    "Erreur serveur"
            });
        }
    }
);


// ==========================================
// FORMATER UNE DATE
// ==========================================

function formatDateKey(date) {

    const d =
        new Date(date);


    const year =
        d.getFullYear();


    const month =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            d.getDate()
        ).padStart(2, "0");


    const hours =
        String(
            d.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            d.getMinutes()
        ).padStart(2, "0");


    const seconds =
        String(
            d.getSeconds()
        ).padStart(2, "0");


    return (
        `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`
    );
}

// ==========================================
// AJOUTER UNE ÉVALUATION COLLECTIVE
// ==========================================

app.post(
    "/api/evaluations/collectives",
    async (req, res) => {

        try {

            const {
                user_id,
                echelle,
                frequence,
                realise_par,
                resultats
            } = req.body;


            // ==========================================
            // VÉRIFICATION
            // ==========================================

            if (
                !user_id ||
                echelle === undefined ||
                frequence === undefined ||
                realise_par === undefined ||
                !Array.isArray(resultats)
            ) {

                return res.status(400).json({

                    error:
                        "user_id, echelle, frequence, realise_par et resultats sont obligatoires"
                });
            }


            // ==========================================
            // VÉRIFIER L'UTILISATEUR
            // ==========================================

            const [users] =
                await db.query(

                    "SELECT id FROM users WHERE id = ?",

                    [user_id]
                );


            if (users.length === 0) {

                return res.status(404).json({

                    error:
                        "Utilisateur introuvable"
                });
            }


            // ==========================================
            // DATE DE L'ÉVALUATION
            // ==========================================

            const dateEvaluation =
                new Date();


            // ==========================================
            // CRÉER L'ÉVALUATION COLLECTIVE
            // ==========================================

            const [evaluationResult] =
                await db.query(

                    `INSERT INTO collective_evaluations
                    (
                        user_id,
                        date_evaluation,
                        echelle,
                        frequence
                    )
                    VALUES (?, ?, ?, ?)`,


                    [
                        user_id,
                        dateEvaluation,
                        echelle,
                        frequence
                    ]
                );


            const evaluationId =
                evaluationResult.insertId;


            // ==========================================
            // ENREGISTRER LE RÉSULTAT
            // ==========================================

            await db.query(

                `INSERT INTO collective_results
                (
                    evaluation_id,
                    realise_par,
                    resultats
                )
                VALUES (?, ?, ?)`,


                [
                    evaluationId,
                    realise_par,
                    JSON.stringify(resultats)
                ]
            );


            // ==========================================
            // RÉPONSE
            // ==========================================

            res.status(201).json({

                success: true,

                evaluationId:
                    evaluationId,

                message:
                    "Évaluation collective enregistrée"
            });


        } catch (error) {

            console.error(
                "Erreur ajout évaluation collective :",
                error
            );


            res.status(500).json({

                error:
                    "Erreur serveur"
            });
        }
    }
);


// ==========================================
// RÉCUPÉRER LES ÉVALUATIONS COLLECTIVES
// ==========================================

app.get(
    "/api/evaluations/collectives",
    async (req, res) => {

        try {

            const [rows] = await db.query(`

                SELECT

                    u.id AS user_id,

                    u.nom,

                    u.prenom,

                    ce.id AS evaluation_id,

                    ce.date_evaluation,

                    ce.echelle,

                    ce.frequence,

                    cr.id AS result_id,

                    cr.realise_par,

                    cr.resultats

                FROM users u

                LEFT JOIN collective_evaluations ce

                    ON u.id = ce.user_id

                LEFT JOIN collective_results cr

                    ON ce.id = cr.evaluation_id

                ORDER BY
                    u.id,
                    ce.date_evaluation,
                    cr.id

            `);


            const usersData = {};


            for (const row of rows) {

                const fullName =
                    `${row.prenom} ${row.nom}`;


                // Créer l'utilisateur
                if (!usersData[fullName]) {

                    usersData[fullName] = {

                        notes: {}
                    };
                }


                // Pas d'évaluation
                if (
                    row.evaluation_id === null
                ) {

                    continue;
                }


                const dateKey =
                    formatDateKey(
                        row.date_evaluation
                    );


                let resultats =
                    row.resultats;


                if (
                    typeof resultats === "string"
                ) {

                    try {

                        resultats =
                            JSON.parse(
                                resultats
                            );

                    } catch (error) {

                        console.error(
                            "Erreur JSON resultats :",
                            error
                        );

                        resultats = [];
                    }
                }


                // Clé unique
                const noteKey =
                    row.result_id !== null

                        ? `${dateKey}-${row.result_id}`

                        : dateKey;


                usersData[fullName].notes[
                    noteKey
                ] = {

                    echelle:
                        row.echelle,

                    frequence:
                        row.frequence,

                    realisePar:
                        row.realise_par || "",

                    resultats:
                        resultats || []
                };
            }


            res.json(usersData);


        } catch (error) {

            console.error(
                "Erreur évaluations collectives :",
                error
            );


            res.status(500).json({

                error:
                    "Erreur serveur"
            });
        }
    }
);


// ==========================================
// RÉCUPÉRER LES INFORMATIONS UTILISATEURS
// ==========================================

app.get(
    "/api/users",
    async (req, res) => {

        try {

            const [users] =
                await db.query(`

                    SELECT
                        id,
                        nom,
                        prenom,
                        date_naissance,
                        sexe,
                        metier

                    FROM users

                `);


            res.json(users);


        } catch (error) {

            console.error(
                "Erreur récupération utilisateurs :",
                error
            );


            res.status(500).json({

                error:
                    "Erreur serveur"
            });
        }
    }
);


// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Serveur démarré sur http://localhost:${PORT}`
    );
});
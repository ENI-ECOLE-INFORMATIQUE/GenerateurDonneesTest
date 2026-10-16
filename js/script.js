/* ============================================================
   1. DONNÉES DE BASE — des "arrays" de "strings"
   ============================================================ */
var PRENOMS = ["Marie", "Jean", "Sophie", "Luc", "Emma", "Hugo", "Léa", "Nina", "Karim", "Yanis"];
var NOMS = ["Dupont", "Martin", "Bernard", "Durand", "Moreau", "Lefebvre", "Garcia", "Petit", "Sanchez", "Roux"];
var VILLES = ["Paris", "Lyon", "Marseille", "Toulouse", "Lille", "Bordeaux"];

/* ============================================================
   2. FONCTIONS UTILITAIRES
   ============================================================ */
// Renvoie un entier aléatoire entre 0 et max-1
function aleatoire(max) {
  return Math.floor(Math.random() * max);
}

// Renvoie un élément au hasard d'un tableau
function piocher(tableau) {
  return tableau[aleatoire(tableau.length)];
}

// Génère un email à partir d'un prénom et d'un nom
function genererEmail(prenom, nom, domaine) {
  // toLowerCase() convertit en minuscules ; les backticks insèrent les variables dans la chaîne
  return `${prenom.toLowerCase()}.${nom.toLowerCase()}@${domaine}`;
}

// Génère une personne valide (un objet)
function genererPersonne(domaine) {
  var prenom = piocher(PRENOMS);
  var nom = piocher(NOMS);
  return {
    prenom: prenom,
    nom: nom,
    email: genererEmail(prenom, nom, domaine),
    age: 18 + aleatoire(60), // âge entre 18 et 77
    ville: piocher(VILLES),
  };
}

/* ============================================================
   3. CAS LIMITES — le cœur du métier de testeur !
   Un bug naît souvent aux frontières des règles de gestion.
   ============================================================ */
var CAS_LIMITES = [
  { cas: "Prénom vide", donnees: 'prenom: "" | email: "martin@mail.fr" | age: 30' },
  { cas: "Prénom = espaces seulement", donnees: 'prenom: "   " | email: "durand@mail.fr" | age: 45' },
  { cas: "Caractères spéciaux (tiret, apostrophe, sous-domaine)", donnees: "prenom: \"Jean-Pierre\" | nom: \"O'Neil\" | email: \"jean@sub.mail.fr\"" },
  { cas: "Accents et caractères internationaux", donnees: 'prenom: "Màry" | nom: "Müller" | age: 33' },
  { cas: "Email tout en majuscules", donnees: 'email: "MARIE.DUPONT@MAIL.FR" | age: 28' },
  { cas: "Âge = 0 (limite minimale)", donnees: "prenom: \"Al\" | nom: \"Li\" | age: 0" },
  { cas: "Âge = 17 (juste sous la limite de 18)", donnees: 'prenom: "Anna" | email: "anna@mail.fr" | age: 17' },
  { cas: "Âge = 18 (exactement la limite)", donnees: 'prenom: "Paul" | email: "paul@mail.fr" | age: 18' },
  { cas: "Âge = 99 (très âgé)", donnees: 'prenom: "Rose" | email: "rose@mail.fr" | age: 99' },
  { cas: "Email malformé (espace dans l'adresse)", donnees: 'email: "lea@ mail.fr" | age: 22' },
  { cas: "Double @", donnees: 'email: "max@@mail.fr" | age: 40' },
  { cas: "Email sans domaine (juste \"lea@mail\")", donnees: 'email: "lea@mail" | age: 22' }
];

/* ============================================================
   4. ÉTAT DE L'APPLICATION
   ============================================================ */
var donnees = []; // le tableau de personnes actuellement affiché

// Raccourci : retrouver un élément HTML par son id
function $(id) {
  return document.getElementById(id);
}

// Affiche un message temporaire sous les boutons
function afficherMessage(texte) {
  var msg = $("message");
  msg.textContent = texte;
  msg.style.display = "block";
}

/* ============================================================
   5. ACTIONS DES BOUTONS
   ============================================================ */

// Générer : on crée un tableau de N personnes
function generer() {
  var nombre = parseInt($("nb").value) || 1; // parseInt convertit le texte saisi en nombre
  var domaine = $("domaine").value || "test.fr";
  donnees = [];
  for (var i = 0; i < nombre; i++) {
    donnees.push(genererPersonne(domaine));
  }
  afficherTableau();
  activerBoutons(true);
  $("message").style.display = "none";
}

// Afficher le tableau : map() transforme chaque personne en ligne HTML,
// join("") colle toutes les lignes en une seule chaîne
function afficherTableau() {
  var lignes = donnees.map(function (p) {
    return `<tr>
      <td>${p.prenom}</td>
      <td>${p.nom}</td>
      <td class="email">${p.email}</td>
      <td>${p.age}</td>
      <td>${p.ville}</td>
    </tr>`;
  }).join("");

  $("corps-tableau").innerHTML = lignes;
  $("titre-tableau").textContent = `📊 Données générées (${donnees.length} personnes)`;
  $("zone-tableau").style.display = "block";
}

// Trier par ville : localeCompare compare deux chaînes selon la langue
function trierParVille() {
  // [...donnees] crée une copie, pour ne pas modifier l'original par accident
  donnees = [...donnees].sort(function (a, b) {
    return a.ville.localeCompare(b.ville);
  });
  afficherTableau();
}

// Copier en JSON
function copierJSON() {
  var texte = JSON.stringify(donnees, null, 2);
  navigator.clipboard.writeText(texte).then(function () {
    afficherMessage("✅ Données copiées ! Collez-les dans un fichier .json ou votre outil de test.");
  });
}

// Exporter en CSV : on construit une chaîne ligne par ligne,
// avec des points-virgules (standard français, car la virgule sert aux décimaux)
function exporterCSV() {
  var entetes = "prenom;nom;email;age;ville";
  var lignes = donnees.map(function (p) {
    return `${p.prenom};${p.nom};${p.email};${p.age};${p.ville}`;
  });
  var csv = [entetes].concat(lignes).join("\n");

  // \uFEFF est le BOM UTF-8 : il garantit qu'Excel affiche correctement les accents
  var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var lien = document.createElement("a"); // on crée un lien invisible en mémoire…
  lien.href = url;
  lien.download = "donnees-test.csv"; // …qui porte le nom du fichier…
  document.body.appendChild(lien);
  lien.click(); // …et on le "clique" : le téléchargement démarre
  document.body.removeChild(lien);
  URL.revokeObjectURL(url); // on libère la mémoire du fichier temporaire
  afficherMessage("✅ Fichier CSV téléchargé ! Ouvrez-le dans Excel ou LibreOffice.");
}

// Activer/désactiver les boutons quand il y a des données
function activerBoutons(actif) {
  ["btn-trier", "btn-json", "btn-csv"].forEach(function (id) {
    $(id).disabled = !actif;
  });
}

/* ============================================================
   6. AFFICHAGE DES CAS LIMITES
   ============================================================ */
function afficherLimites() {
  var bloc = $("limites");
  if (bloc.style.display === "none") {
    bloc.innerHTML = CAS_LIMITES.map(function (cas, i) {
      return `<div class="limite">
        <p class="titre">#${i + 1} — ${cas.cas}</p>
        <p class="donnees">${cas.donnees}</p>
        <p class="question">Question testeur : votre application accepte-t-elle cette entrée ?</p>
      </div>`;
    }).join("");
    bloc.style.display = "grid";
    $("btn-limites").textContent = "Masquer les cas limites";
  } else {
    bloc.style.display = "none";
    $("btn-limites").textContent = "Afficher les cas limites";
  }
}

/* ============================================================
   7. BRANCHEMENT DES ÉVÉNEMENTS
   addEventListener : "quand on clique, exécute cette fonction"
   ============================================================ */
$("btn-generer").addEventListener("click", generer);
$("btn-trier").addEventListener("click", trierParVille);
$("btn-json").addEventListener("click", copierJSON);
$("btn-csv").addEventListener("click", exporterCSV);
$("btn-limites").addEventListener("click", afficherLimites);

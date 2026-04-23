// 1. Fonction pour AJOUTER
function ajouterAuPanier(nomProduit, prixProduit) {
    let panier = JSON.parse(localStorage.getItem('monPanierTao')) || [];
    panier.push({ nom: nomProduit, prix: prixProduit });
    localStorage.setItem('monPanierTao', JSON.stringify(panier));
    alert(nomProduit + " ajouté au panier !");}

function afficherPanier() {
    let conteneur = document.getElementById('selected_products');
    if (!conteneur) return; 

    let panier = JSON.parse(localStorage.getItem('monPanierTao')) || [];
    conteneur.innerHTML = ''; 

    if (panier.length === 0) {
        conteneur.innerHTML = `
            <h2>Votre Panier</h2>
            <div class="panier-vide-container">
                <div class="panier-vide-texte">
                    <h3>On dirait que c'est vide !</h3>
                    <p>Ajoutons quelque-chose ?</p>
                </div>
                <div class="panier-vide-icone">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </div>
            </div>
        `;
        return;}

    let html = `<h2>Votre Panier (${panier.length} objet${panier.length > 1 ? 's' : ''})</h2>`;
    let totalPrix = 0;

    panier.forEach(function(article, index) {
        html += `
            <div class="article-panier">
                <div class="nom-article">${article.nom}</div>
                <div class="prix-article">${article.prix.toFixed(2)} $</div>
                <button class="btn-retirer" onclick="supprimerUnArticle(${index})">Retirer</button>
            </div>
        `;
        totalPrix += article.prix;});
    html += `
    <div class="resume-panier">
        <h3>Total Estimé: ${totalPrix.toFixed(2)} $</h3>
        <button class="btn-vider" onclick="viderPanier()">Vider tout le panier</button><br>
        <button class="btn-payer" onclick="ouvrirPaiement()">Payer</button>
    </div>
`;
    conteneur.innerHTML = html;}

function supprimerUnArticle(index) {
    let panier = JSON.parse(localStorage.getItem('monPanierTao')) || [];
    panier.splice(index, 1); 
    localStorage.setItem('monPanierTao', JSON.stringify(panier));
    afficherPanier(); }

function viderPanier() {
    if(confirm("Êtes-vous sûr de vouloir vider le panier?")) {
        localStorage.removeItem('monPanierTao');
        afficherPanier();}}

function ouvrirPaiement() {
    const popup = document.createElement("div");

    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.background = "rgba(0,0,0,0.5)";
    popup.style.display = "flex";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.zIndex = "1000";

    popup.innerHTML = `
        <div style="background:white; padding:20px; border-radius:10px; text-align:center;">
            <h2>Choisissez votre méthode de paiement</h2>
            <button class="btn-payer" onclick="choisirPaiement('Carte')">Credit / Débit</button><br><br>
            <button class="btn-payer" onclick="choisirPaiement('PayPal')">PayPal</button><br><br>
            <button class="btn-payer" onclick="fermerPopup()">Annuler</button>
        </div>
    `;

    popup.id = "popup-paiement";
    document.body.appendChild(popup);
}

function fermerPopup() {
    const popup = document.getElementById("popup-paiement");
    if (popup) 
	{popup.remove();
	 localStorage.removeItem('monPanierTao');
     afficherPanier();} }

function choisirPaiement(methode) {
    alert("Vous avez choisi: " + methode);
    fermerPopup();
}


function choisirMode(mode) {
    const conteneur = document.getElementById('details-mode-livraison');
	localStorage.setItem('modeLivraison', mode);
    document.getElementById('delivery').classList.add('mode-actif');
    document.getElementById('pickup').classList.remove('mode-actif');
    if (mode === 'cueillette') {
        document.getElementById('delivery').classList.remove('mode-actif');
        document.getElementById('pickup').classList.add('mode-actif');
    }

    if (mode === 'livraison') {
        conteneur.innerHTML = `
            <div class="choix-detail">
                <h3 style="color:aqua; margin-top:0;">Zone de Livraison</h3>
                <p style="font-size:0.9em; color:#bbb;">Cliquez sur la carte pour définir votre adresse :</p>
                <div id="map" style="height: 300px; width: 100%; border: 1px solid aqua; border-radius: 8px;"></div>
                <input type="text" id="adresse-input" placeholder="L'adresse s'affichera ici..." readonly>
            </div>
        `;

        setTimeout(() => {
            var map = L.map('map').setView([45.5017, -73.5673], 12);
			L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 20
			}).addTo(map);

            var marker;

            map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;

                if (marker) {
                    marker.setLatLng(e.latlng);
                } else {
                    marker = L.marker(e.latlng).addTo(map);
                }

                fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                    .then(response => response.json())
                    .then(data => {
                        const adresseComplete = data.display_name;
                        document.getElementById('adresse-input').value = adresseComplete;
                    })
                    .catch(err => {
                        document.getElementById('adresse-input').value = lat.toFixed(5) + ", " + lng.toFixed(5);
                    });
            });
        }, 100);

    } else {
        conteneur.innerHTML = `
            <div class="choix-detail">
                <h3 style="color:aqua; margin-top:0;">Succursales TheOnlyTao</h3>
                <select id="select-succursale" style="width:100%; padding:10px; background:#0f0f0f; color:white; border:1px solid #333;">
                    <option value="mtl-nord">TheOnlyTao - Montréal Nord</option>
                    <option value="mtl-centre">TheOnlyTao - Centre-Ville</option>
                    <option value="longueuil">TheOnlyTao - Longueuil</option>
                </select>
                <p style="color:gray; font-size:0.8em; margin-top:10px;">Votre commande sera prête en 20 minutes.</p>
            </div>
        `;
    }
}

window.onload = function() {
    afficherPanier();
    
    let modeSauvegarde = localStorage.getItem('modeLivraison');
    if (modeSauvegarde) {
        choisirMode(modeSauvegarde);
    }
};
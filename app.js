// --- NAVIGATION ET MENU ---
function toggleMenu() {
    document.getElementById('side-menu').classList.toggle('open');
}

function switchTab(tab, btnElement) {
    document.querySelectorAll('.document-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('module-' + tab).classList.add('active');
    if(btnElement) btnElement.classList.add('active');
    
    toggleMenu(); // Ferme le menu après sélection
    // Réinitialise la taille des canvas quand le module devient visible
    setTimeout(() => resizeCanvas('canvas-' + tab), 50); 
}

// --- PERSONNALISATION ENTETE ---
function updateHeaderStyle() {
    const font = document.getElementById('header-font').value;
    const size = document.getElementById('header-size').value + 'px';
    const color = document.getElementById('header-color').value;
    const isWordArt = document.getElementById('header-wordart').checked;

    document.querySelectorAll('.main-title').forEach(el => {
        el.style.fontFamily = font;
        el.style.fontSize = size;
        el.style.color = isWordArt ? '' : color; // Le WordArt utilise un dégradé
        if(isWordArt) {
            el.classList.add('wordart-effect');
        } else {
            el.classList.remove('wordart-effect');
        }
    });
}

// --- IMPORTATION D'IMAGES ---
function previewImage(input, imgId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            const img = document.getElementById(imgId);
            img.src = e.target.result;
            if(imgId === 'img-sceau') img.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// --- GESTION DES DONNEES ---
let devisData = [
    { qte: 2, lib: "Boites email Gris", pu: 30 },
    { qte: 3, lib: "Boites email blanc", pu: 30 },
    { qte: 3, lib: "Sceaux latex PDF", pu: 55 },
    { qte: 5, lib: "Boites email PDF", pu: 30 },
    { qte: 8, lib: "Litres pétrole", pu: 3 },
    { qte: 5, lib: "Rouleaux", pu: 3 },
    { qte: 5, lib: "Roulettes", pu: 2 },
    { qte: 2, lib: "Sceaux latex blanc", pu: 55 },
    { qte: 2, lib: "Boites email noir", pu: 30 },
    { qte: 3, lib: "Boites vernis", pu: 30 },
    { qte: 5, lib: "Pièces colorants", pu: 3 },
    { qte: 6, lib: "Brosses", pu: 2 },
    { qte: 2, lib: "Sceaux vides", pu: 3 }
];

let factureData = [
    { lib: "Boîte Email blanc pour plinthes", unite: "Pce", qte: 27, pu: 2 },
    { lib: "Tonnelet latex blanc pour murs", unite: "Pce", qte: 5, pu: 10 }
];

function renderTable(type) {
    const tbody = document.getElementById(`tbody-${type}`);
    tbody.innerHTML = '';
    const data = type === 'devis' ? devisData : factureData;

    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        if(type === 'devis') {
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="number" value="${item.qte}" onchange="updateLine('${type}', ${index}, 'qte', this.value)" style="width:50px; text-align:center;"></td>
                <td><input type="text" value="${item.lib}" onchange="updateLine('${type}', ${index}, 'lib', this.value)" style="width:100%; border:none; background:transparent;"></td>
                <td><input type="number" value="${item.pu}" onchange="updateLine('${type}', ${index}, 'pu', this.value)" style="width:60px; text-align:center;"></td>
                <td class="pt-cell">${(item.qte * item.pu).toFixed(2)}</td>
                <td class="no-print"><button class="btn-del" onclick="deleteLine('${type}', ${index})">X</button></td>
            `;
        } else {
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" value="${item.lib}" onchange="updateLine('${type}', ${index}, 'lib', this.value)" style="width:100%; border:none; background:transparent;"></td>
                <td><input type="text" value="${item.unite}" onchange="updateLine('${type}', ${index}, 'unite', this.value)" style="width:40px; border:none; text-align:center; background:transparent;"></td>
                <td><input type="number" value="${item.qte}" onchange="updateLine('${type}', ${index}, 'qte', this.value)" style="width:50px; text-align:center;"></td>
                <td><input type="number" value="${item.pu}" onchange="updateLine('${type}', ${index}, 'pu', this.value)" style="width:60px; text-align:center;"></td>
                <td class="pt-cell">${(item.qte * item.pu).toFixed(2)}</td>
                <td class="no-print"><button class="btn-del" onclick="deleteLine('${type}', ${index})">X</button></td>
            `;
        }
        tbody.appendChild(tr);
    });
    calculerTotaux(type);
}

function updateLine(type, index, field, value) {
    const data = type === 'devis' ? devisData : factureData;
    data[index][field] = (field === 'qte' || field === 'pu') ? parseFloat(value) || 0 : value;
    renderTable(type);
}

function ajouterLigne(type) {
    const data = type === 'devis' ? devisData : factureData;
    if(type === 'devis') data.push({ qte: 1, lib: "Nouvel article", pu: 0 });
    else data.push({ lib: "Nouvel article", unite: "Pce", qte: 1, pu: 0 });
    renderTable(type);
}

function deleteLine(type, index) {
    if(confirm("Voulez-vous vraiment supprimer cette ligne ?")) {
        const data = type === 'devis' ? devisData : factureData;
        data.splice(index, 1);
        renderTable(type);
    }
}

// --- CALCULS ET CONVERSION LETTRES ---
function calculerTotaux(type) {
    const data = type === 'devis' ? devisData : factureData;
    let sousTotal = 0;
    
    data.forEach(item => { sousTotal += (item.qte * item.pu); });
    
    const mainOeuvre = parseFloat(document.getElementById(`${type === 'devis' ? 'dev' : 'fact'}-main-oeuvre`).value) || 0;
    const totalGlobal = sousTotal + mainOeuvre;

    if(type === 'devis') {
        document.getElementById('dev-total').innerText = sousTotal.toFixed(2);
        document.getElementById('dev-totaux').innerText = totalGlobal.toFixed(2);
        document.getElementById('dev-global').innerText = totalGlobal.toFixed(2);
    } else {
        document.getElementById('fact-sous-total').innerText = sousTotal.toFixed(2);
        document.getElementById('fact-global').innerText = totalGlobal.toFixed(2);
    }
    genererLettres(totalGlobal, type);
}

function changeDevise(type) {
    const devise = document.getElementById(`devise-${type}`).value;
    document.querySelectorAll(`#module-${type} .symbole-devise`).forEach(el => el.innerText = devise);
    calculerTotaux(type);
}

function genererLettres(nombre, type) {
    const deviseSelect = document.getElementById(`devise-${type}`).value;
    const nomDevise = deviseSelect === '$' ? "Dollars américains" : "Francs congolais";
    
    let entier = Math.floor(nombre);
    let decimal = Math.round((nombre - entier) * 100);
    
    // Si le décimal est un multiple de 10 (ex: 0.4 devient 40), on le lit comme un entier basique
    let texteDecimal = "";
    if (decimal > 0) {
        texteDecimal = decimal < 10 ? `, zéro ${convertirEntier(decimal)}` : `, ${convertirEntier(decimal)}`;
    }
    
    let texte = `${nomDevise} ${convertirEntier(entier)}${texteDecimal}`;
    
    // Formatage propre
    texte = texte.charAt(0).toUpperCase() + texte.slice(1).toLowerCase();
    
    document.getElementById(`${type === 'devis' ? 'dev' : 'fact'}-lettres`).innerText = texte;
}

function convertirEntier(n) {
    if (n === 0) return "zéro";
    const unites = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const dizaines = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
    
    if (n < 20) return unites[n];
    if (n < 100) {
        let d = Math.floor(n / 10);
        let u = n % 10;
        if (d === 7 || d === 9) return dizaines[d - 1] + "-" + unites[10 + u];
        return dizaines[d] + (u === 1 && d !== 8 ? "-et-un" : (u > 0 ? "-" + unites[u] : ""));
    }
    if (n < 1000) {
        let c = Math.floor(n / 100);
        let r = n % 100;
        let cent = c === 1 ? "cent" : unites[c] + " cent";
        return cent + (r > 0 ? " " + convertirEntier(r) : "");
    }
    if (n < 1000000) {
        let m = Math.floor(n / 1000);
        let r = n % 1000;
        let mille = m === 1 ? "mille" : convertirEntier(m) + " mille";
        return mille + (r > 0 ? " " + convertirEntier(r) : "");
    }
    return n.toString();
}

// --- SIGNATURE TACTILE CORRIGÉE ---
const canvasStates = {};

function resizeCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return;
    // On force une taille fixe pour éviter que le dessin soit décalé
    if(canvas.width !== 250 || canvas.height !== 100) {
        canvas.width = 250;
        canvas.height = 100;
        initSignatureDrawing(canvasId);
    }
}

function initSignatureDrawing(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Configuration du style du trait
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    let drawing = false;

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        // Calcul précis prenant en compte le redimensionnement CSS
        return { 
            x: (clientX - rect.left) * (canvas.width / rect.width), 
            y: (clientY - rect.top) * (canvas.height / rect.height) 
        };
    };

    const start = (e) => { e.preventDefault(); drawing = true; const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); };
    const move = (e) => { e.preventDefault(); if (!drawing) return; const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); };
    const end = (e) => { e.preventDefault(); drawing = false; };

    // Nettoyer les anciens écouteurs (si réinitialisation)
    canvas.replaceWith(canvas.cloneNode(true)); 
    const newCanvas = document.getElementById(canvasId);
    const newCtx = newCanvas.getContext('2d');
    newCtx.lineWidth = 2; newCtx.lineCap = 'round'; newCtx.strokeStyle = '#000000';

    newCanvas.addEventListener('mousedown', start);
    newCanvas.addEventListener('mousemove', move);
    newCanvas.addEventListener('mouseup', end);
    newCanvas.addEventListener('mouseout', end);
    newCanvas.addEventListener('touchstart', start, { passive: false });
    newCanvas.addEventListener('touchmove', move, { passive: false });
    newCanvas.addEventListener('touchend', end);
}

function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderTable('devis');
    renderTable('facture');
    
    // Initialiser les canvas avec un léger délai
    setTimeout(() => {
        resizeCanvas('canvas-devis');
        resizeCanvas('canvas-facture');
    }, 100);

    if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Chemin absolu avec le nom exact de votre dépôt
        navigator.serviceWorker.register('/DEVIS-FACTURE/sw.js') 
            .then(reg => console.log('Service Worker enregistré avec succès'))
            .catch(err => console.error('Erreur SW:', err));
    });
    }
});

// --- 0. SUPABASE CONFIG ---
const _supabaseUrl = 'https://rlhkxfyozmnwbxdchzkj.supabase.co';
const _supabaseKey = 'sb_publishable_VSiPF1yBYp3YATETjHyapw_kO3KAIOL'; 

// Use window.supabase to be 100% sure we are grabbing the library
const _supabase = window.supabase.createClient(_supabaseUrl, _supabaseKey);

// --- 1. SETUP & STATE ---
const paperWorkspace = document.getElementById('paper');
const textarea = document.querySelector('textarea');
const writersKit = document.getElementById('writers-kit');
const postOffice = document.getElementById('post-office');
const envelope = document.getElementById('envelope');
const sLayer = document.getElementById('stickerlayer');
const deleteZone = document.getElementById('delete-zone');

let draggedSticker = null;

let currentLetter = {
    content: "",
    font: "'Delius', cursive",
    color: "#2c3e50",
    paperImg: "assets/papers/paper_1.webp",
    envelopeImg: "assets/envelopes/e_1.webp", // New: Envelope State
    stickers: []
};

// --- 2. GENERATE 22 PAPERS ---
const paperList = document.getElementById('paper-list');
if (paperList) {
    for (let i = 1; i <= 22; i++) {
        const thumb = document.createElement('div');
        thumb.classList.add('paper-opt');
        const imgPath = `assets/papers/paper_${i}.webp`;
        thumb.style.backgroundImage = `url('${imgPath}')`;
        
        if (i === 1) thumb.classList.add('active');

        thumb.addEventListener('click', () => {
            document.querySelectorAll('.paper-opt').forEach(p => p.classList.remove('active'));
            thumb.classList.add('active');
            paperWorkspace.style.backgroundImage = `url('${imgPath}')`;
            currentLetter.paperImg = imgPath;
            saveProgress();
        });
        paperList.appendChild(thumb);
    }
}

// --- 3. GENERATE 58 ENVELOPES ---
const envelopeList = document.getElementById('envelope-list');
if (envelopeList) {
    for (let i = 1; i <= 58; i++) {
        const thumb = document.createElement('div');
        thumb.classList.add('env-opt');
        const imgPath = `assets/envelopes/e_${i}.webp`;
        thumb.style.backgroundImage = `url('${imgPath}')`;
        
        if (i === 1) thumb.classList.add('active');

        thumb.addEventListener('click', () => {
            document.querySelectorAll('.env-opt').forEach(env => env.classList.remove('active'));
            thumb.classList.add('active');
            
            // Set the workspace envelope background
            envelope.style.backgroundImage = `url('${imgPath}')`;
            currentLetter.envelopeImg = imgPath;
            saveProgress();
        });
        envelopeList.appendChild(thumb);
    }
}

// --- 4. ACCORDION LOGIC ---
document.querySelectorAll('.cat-header').forEach(header => {
    header.addEventListener('click', () => {
        const parent = header.parentElement;
        const isActive = parent.classList.contains('active');
        document.querySelectorAll('.category').forEach(cat => cat.classList.remove('active'));
        if (!isActive) parent.classList.add('active');
    });
});

// --- 5. STYLE LOGIC (Fonts & Color) ---
document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const f = btn.getAttribute('data-font');
        const fontName = f.toLowerCase();
        
        textarea.style.fontFamily = f;

        // --- THE FONT STYLE MAPPER (Creator Side) ---
        if (fontName.includes('aurore')) {
            textarea.style.fontSize = "1.0rem";
            textarea.style.lineHeight = "1.2"; // Less space for Aurora
        } 
        else if (fontName.includes('marck')) {
            textarea.style.fontSize = "1.2rem"; // Smaller for Marck
            textarea.style.lineHeight = "1.4";
        } 
        else if (fontName.includes('cedarville')) {
            textarea.style.fontSize = "1.1rem"; // Reduced size
            textarea.style.lineHeight = "1.1";  // Reduced height
        } 
        else if (fontName.includes('apple')) {
            textarea.style.fontSize = "0.8rem"; // Smaller for Apple
            textarea.style.lineHeight = "1.9";
        } 
        else if (fontName.includes('haviland') || fontName.includes('delafield') || fontName.includes('waterfall')) {
            textarea.style.fontSize = "1.7rem";
            textarea.style.lineHeight = "1.2";
        } 
        else if (fontName.includes('handlee')) {
            textarea.style.fontSize = "1.0rem";
            textarea.style.lineHeight = "1.4";
        } 
        else if (fontName.includes('fasthand')) {
            textarea.style.fontSize = "1.0rem";
            textarea.style.lineHeight = "1.4";
        }
        else if (fontName.includes('reenie')) {
            textarea.style.fontSize = "1.2rem";
            textarea.style.lineHeight = "1.4";
        } 
        else if (fontName.includes('indie flower')) {
            textarea.style.fontSize = "1.0rem";
            textarea.style.lineHeight = "1.2";
        } 
        else if (fontName.includes('babylonica')) {
            textarea.style.fontSize = "1.6rem";
            textarea.style.fontWeight = "550";
            textarea.style.lineHeight = "1.4";
        } 
        else {
            textarea.style.fontSize = "1.4rem"; // Default
            textarea.style.lineHeight = "1.4";
        }

        currentLetter.font = f;
        applyInkEffect(currentLetter.color);
        saveProgress();
    });
});

document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => {
        document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const c = dot.getAttribute('data-color');
        textarea.style.color = c;
        currentLetter.color = c;
        applyInkEffect(c);
        saveProgress();
    });
});

// --- 6. FOLDING & POSTING ---
const foldBtn = document.getElementById('foldbtn');
const unfoldBtn = document.getElementById('unfoldbtn');

foldBtn.addEventListener('click', () => {
    saveProgress();
    // Set the envelope image choice before showing animation
    envelope.style.backgroundImage = `url('${currentLetter.envelopeImg}')`;
    
    paperWorkspace.classList.add('folding');
    writersKit.classList.add('disabled');
    postOffice.classList.remove('disabled');

    setTimeout(() => {
        envelope.classList.remove('hidden');
        setTimeout(() => envelope.classList.add('show'), 50);
        unfoldBtn.classList.remove('hidden'); 
    }, 400);
});

unfoldBtn.addEventListener('click', () => {
    envelope.classList.remove('show');
    writersKit.classList.remove('disabled');
    postOffice.classList.add('disabled');

    setTimeout(() => {
        envelope.classList.add('hidden');
        paperWorkspace.classList.remove('folding');
        unfoldBtn.classList.add('hidden');
    }, 400);
});

// --- 7. STICKERS (Canva-style Drop) ---
const stickerList = document.getElementById('stickersource');
if(stickerList) {
    stickerList.innerHTML = ''; 
    stickerList.className = 'sticker-grid'; 
    for (let i = 1; i <= 93; i++) {
        const sticker = document.createElement('img');
        sticker.src = `assets/stickers/${i}.png`; 
        sticker.classList.add('sticker-item');
        sticker.draggable = true;
        sticker.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', sticker.src);
        });
        stickerList.appendChild(sticker);
    }
}

const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; };

[paperWorkspace, textarea].forEach(element => {
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragenter', handleDragOver);
});

textarea.addEventListener('drop', (e) => {
    e.preventDefault();
    const stickerSrc = e.dataTransfer.getData('text/plain');
    if (!stickerSrc) return;
    const rect = sLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createSticker(stickerSrc, x, y);
});

function createSticker(src, x, y) {
    const rect = sLayer.getBoundingClientRect();
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    renderSavedSticker(src, xPercent, yPercent);
    currentLetter.stickers.push({ path: src, x: xPercent, y: yPercent });
    saveProgress();
}

function renderSavedSticker(src, xPercent, yPercent) {
    const placed = document.createElement('img');
    placed.src = src;
    placed.className = 'placed-sticker';
    placed.draggable = true;
    placed.style.left = `${xPercent * 100}%`;
    placed.style.top = `${yPercent * 100}%`;
    
    placed.addEventListener('dragstart', (e) => {
        draggedSticker = placed;
        e.dataTransfer.setData('text/plain', src); 
        setTimeout(() => {
            deleteZone.classList.add('visible');
            placed.style.opacity = "0.5";
        }, 0);
    });

    placed.addEventListener('dragend', () => {
        deleteZone.classList.remove('visible', 'hovered');
        placed.style.opacity = "1";
    });
    sLayer.appendChild(placed);
}

// --- 8. DELETE ZONE ---
deleteZone.addEventListener('dragover', (e) => { e.preventDefault(); deleteZone.classList.add('hovered'); });
deleteZone.addEventListener('dragleave', () => deleteZone.classList.remove('hovered'));
deleteZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedSticker) {
        const rect = sLayer.getBoundingClientRect();
        const xPercent = parseFloat(draggedSticker.style.left) / 100;
        currentLetter.stickers = currentLetter.stickers.filter(s => 
            !(s.path === draggedSticker.src && Math.abs(s.x - xPercent) < 0.01)
        );
        draggedSticker.remove();
        draggedSticker = null;
        saveProgress();
    }
    deleteZone.classList.remove('visible', 'hovered');
});

// --- 9. THEME MODAL ---
const settingsBtn = document.getElementById('open-settings');
const themeModal = document.getElementById('theme-modal');
const closeSettings = document.getElementById('close-settings');
const themeOpts = document.querySelectorAll('.theme-opt');

if(settingsBtn) settingsBtn.onclick = () => themeModal.classList.remove('hidden');
if(closeSettings) closeSettings.onclick = () => themeModal.classList.add('hidden');

themeOpts.forEach(opt => {
    opt.onclick = () => {
        const theme = opt.getAttribute('data-theme');
        document.documentElement.setAttribute('data-vibe', theme);
        document.body.style.backgroundImage = (theme === "dark") ? "url('assets/bg-dark-wood.jpg')" : "url('assets/bg-l.jpg')";
        themeOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    };
});

// --- 10. SAVE & LOAD ---
function saveProgress() {
    currentLetter.content = textarea.value;
    localStorage.setItem('cozy_letter_draft', JSON.stringify(currentLetter));
}

function loadProgress() {
    const saved = localStorage.getItem('cozy_letter_draft');
    if (saved) {
        Object.assign(currentLetter, JSON.parse(saved));
        textarea.value = currentLetter.content;
        textarea.style.fontFamily = currentLetter.font;
        textarea.style.color = currentLetter.color;
        paperWorkspace.style.backgroundImage = `url('${currentLetter.paperImg}')`;
        envelope.style.backgroundImage = `url('${currentLetter.envelopeImg}')`;
        applyInkEffect(currentLetter.color);
        
        // Re-render stickers
        sLayer.innerHTML = ''; 
        currentLetter.stickers.forEach(s => renderSavedSticker(s.path, s.x, s.y));

        // Sync Sidebar UI for Envelopes
        document.querySelectorAll('.env-opt').forEach(opt => {
            const bg = opt.style.backgroundImage.replace(/url\(["']?|["']?\)/g, "");
            if (bg.includes(currentLetter.envelopeImg)) opt.classList.add('active');
            else opt.classList.remove('active');
        });
    }
}

textarea.addEventListener('input', saveProgress);
window.addEventListener('load', loadProgress);

// --- 11. POST TO DATABASE ---
const postBtn = document.getElementById('postbtn');
const shareModal = document.getElementById('share-modal');
const shareLinkBox = document.getElementById('share-link');

postBtn.addEventListener('click', async () => {
    postBtn.innerText = "sending...";
    postBtn.disabled = true;

    // 1. Prepare data (matching your table columns)
    const letterData = {
        content: currentLetter.content,
        font: currentLetter.font,
        color: currentLetter.color,
        paper_img: currentLetter.paperImg,
        envelope_img: currentLetter.envelopeImg,
        stickers: currentLetter.stickers
    };

    // 2. Insert into Supabase
    const { data, error } = await _supabase
        .from('letters')
        .insert([letterData])
        .select();

    if (error) {
        console.error("Error sending letter:", error);
        alert("Oops! The post office is closed. Try again.");
        postBtn.innerText = "post it";
        postBtn.disabled = false;
    } else {
        // 3. Generate Link dynamically
        // Chops off 'index.html' and adds 'view.html' so it works on Localhost & GitHub!
        const baseUrl = window.location.href.split('index.html')[0];
        const secretLink = `${baseUrl}view.html?id=${letterId}`;
        
        // 4. Show Modal
        shareLinkBox.innerText = secretLink;
        shareModal.classList.remove('hidden');
        postBtn.innerText = "posted! 💌";
    }
});

// Helper functions for the Modal
window.closeModal = () => shareModal.classList.add('hidden');
window.copyLink = () => {
    navigator.clipboard.writeText(shareLinkBox.innerText);
    alert("Link copied! Go send it to them! 🦢");
};
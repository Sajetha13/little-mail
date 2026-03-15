// --- 0. SUPABASE CONFIG (Must match your creator script) ---
const _supabaseUrl = 'https://rlhkxfyozmnwbxdchzkj.supabase.co';
const _supabaseKey = 'sb_publishable_VSiPF1yBYp3YATETjHyapw_kO3KAIOL'; 
const _supabase = window.supabase.createClient(_supabaseUrl, _supabaseKey);

// --- 1. ELEMENTS ---
const mailbox = document.getElementById('mailbox');
const cottage = document.querySelector('.cottage-container');
const introText = document.querySelector('.intro-text');
const envelopeOverlay = document.getElementById('envelope-overlay');
const envelopeWrapper = document.getElementById('envelope-wrapper'); // Grab the wrapper for clicking
const envelopeImg = document.getElementById('envelope-img'); // Grab the img to swap it
const letterOverlay = document.getElementById('letter-overlay');
const contentDiv = document.getElementById('letter-content');
const paperBg = document.getElementById('paper-bg');
const stickerLayer = document.getElementById('sticker-layer');

// --- 2. GET ID FROM URL ---
const urlParams = new URLSearchParams(window.location.search);
const letterId = urlParams.get('id');

// --- 3. FETCH & RENDER LOGIC ---
async function fetchLetter() {
    if (!letterId) {
        introText.innerText = "the mailbox is empty...";
        return;
    }

    // Pull the specific letter from Supabase
    const { data, error } = await _supabase
        .from('letters')
        .select('*')
        .eq('id', letterId)
        .single();

    if (error || !data) {
        console.error("Fetch error:", error);
        introText.innerText = "oops! this letter was lost in the wind.";
        return;
    }

    // Now that we have the data, fill the letter elements
    renderLetterData(data);
}

function renderLetterData(data) {
    // 1. Text & Styles
    contentDiv.innerText = data.content;
    contentDiv.style.fontFamily = data.font;
    contentDiv.style.color = data.color;

    // 2. Paper & Envelope Visuals
    paperBg.style.backgroundImage = `url('${data.paper_img}')`;
    envelopeImg.src = data.envelope_img; // Set the envelope the creator picked

    // 3. Render Stickers
    stickerLayer.innerHTML = ''; // Clear placeholder
    data.stickers.forEach(s => {
        const img = document.createElement('img');
        img.src = s.path; // Use the path stored in DB
        img.classList.add('placed-sticker');
        img.style.left = `${s.x * 100}%`;
        img.style.top = `${s.y * 100}%`;
        img.style.width = "80px"; // Size from creator
        stickerLayer.appendChild(img);
    });
}

// --- 4. INTERACTION SEQUENCE ---

// Step 1: Click Mailbox
mailbox.addEventListener('click', () => {
    envelopeOverlay.classList.remove('hidden');
    cottage.classList.add('is-blurred');
    introText.classList.add('fade-out');
});

// Step 2: Click Envelope (using the wrapper we fixed)
envelopeWrapper.addEventListener('click', () => {
    envelopeOverlay.classList.add('hidden');
    letterOverlay.classList.remove('hidden');
});

// Run!
fetchLetter();

// download leter
async function downloadEnvelope() {
    const letterOverlay = document.getElementById('letter-overlay');
    const envelopeOverlay = document.getElementById('envelope-overlay');
    const envelopeWrapper = document.getElementById('envelope-wrapper'); // We need this specific div
    const actions = document.querySelector('.actions');
    const canvasArea = document.getElementById('main-canvas');
    const cottage = document.querySelector('.cottage-container');

    // 1. SNAPSHOT PREP
    letterOverlay.classList.add('hidden'); 
    actions.style.display = 'none'; 
    
    // Show the overlay
    envelopeOverlay.classList.remove('hidden');
    envelopeOverlay.style.display = 'flex';
    cottage.classList.add('is-blurred');

    // --- THE MAGIC FIX ---
    // Manually kill the animation and force the envelope to be full size/centered
    envelopeOverlay.style.transition = 'none';
    envelopeWrapper.style.animation = 'none'; 
    envelopeWrapper.style.transform = 'scale(1) rotate(0deg)'; 
    envelopeWrapper.style.opacity = '1';

    // Give the browser just a tiny moment to recognize the "no-animation" state
    await new Promise(resolve => setTimeout(resolve, 100));

    // 2. CAPTURE
    try {
        const canvas = await html2canvas(canvasArea, {
            scale: 2, 
            useCORS: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement('a');
        link.download = 'my_little_postcard.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Capture failed:", err);
    }

    // 3. REVERT (Put the animations back so the UI still feels nice)
    envelopeOverlay.classList.add('hidden');
    letterOverlay.classList.remove('hidden');
    actions.style.display = 'flex';
    
    // Clear the manual styles so it can animate naturally next time
    envelopeOverlay.style.transition = '';
    envelopeWrapper.style.animation = '';
    envelopeWrapper.style.transform = '';
}

// --- DOWNLOAD LETTER (Placeholder for now) ---
function downloadLetter() {
    alert("oops sorry can't download now :( In the meantime, you can screenshot your letter to save it!");
}
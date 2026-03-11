document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const qrInput = document.getElementById('qr-input');
    const generateBtn = document.getElementById('generate-btn');
    const resultSection = document.getElementById('result-section');
    const qrCanvas = document.getElementById('qr-canvas');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Toast setup
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i class="ph-fill ph-check-circle"></i> <span>Action successful</span>';
    document.body.appendChild(toast);

    function showToast(message) {
        toast.querySelector('span').textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Generator parameters
    const qrOptions = {
        width: 240,
        height: 240,
        margin: 1, // small margin to look neat in the white container
        color: {
            dark: "#000000",
            light: "#ffffff"
        }
    };

    // Generate Event
    function generateQR() {
        const textToEncoded = qrInput.value.trim();
        
        if (!textToEncoded) {
            qrInput.classList.add('error');
            qrInput.focus();
            
            // Add a little shake animation
            qrInput.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
            setTimeout(() => {
                qrInput.style.animation = '';
            }, 500);
            return;
        }

        // Disable button while generating
        const originalBtnText = generateBtn.innerHTML;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="ph-bold ph-spinner" style="animation: spin 1s linear infinite;"></i> <span>Generating...</span>';

        // Clear previous canvas
        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

        // Generate the QR code onto the canvas element
        try {
            QRCode.toCanvas(qrCanvas, textToEncoded, qrOptions, function (error) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = originalBtnText;

                if (error) {
                    console.error(error);
                    showToast("Failed to generate QR Code");
                    return;
                }
                
                // Show the result section with animation
                resultSection.classList.remove('hidden');
                
                // re-trigger animation hack
                const wrapper = document.getElementById('qr-wrapper');
                wrapper.style.animation = 'none';
                wrapper.offsetHeight; /* trigger reflow */
                wrapper.style.animation = null; 
                
                // Scroll to it smoothly if on smaller screens
                setTimeout(() => {
                    if(window.innerHeight < 700) {
                         resultSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }
                }, 100);
            });
        } catch (err) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalBtnText;
            console.error(err);
            alert("Error generating QR code: " + err.message + "\nQRCode present: " + (typeof QRCode !== 'undefined'));
            showToast("Error: " + err.message);
        }
    }

    // Add CSS for shake and spin animations dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .error { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3) !important; }
    `;
    document.head.appendChild(style);

    // Event Listeners
    generateBtn.addEventListener('click', generateQR);

    qrInput.addEventListener('keypress', (e) => {
        // Remove error class on typing
        qrInput.classList.remove('error');
        if (e.key === 'Enter') {
            generateQR();
        }
    });

    qrInput.addEventListener('input', () => {
         qrInput.classList.remove('error');
    });

    // Reset button functionality
    resetBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        qrInput.value = '';
        qrInput.focus();
    });

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        try {
            const dataUrl = qrCanvas.toDataURL('image/png');
            
            // Set suggested file name from the URL or text
            let filename = "qrcode.png";
            let val = qrInput.value.trim();
            if(val) {
                // remove protocol and sanitize
                val = val.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
                if(val) filename = `qrcode-${val}.png`;
            }

            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            showToast("QR Code downloaded!");
        } catch (err) {
            console.error(err);
            showToast("Failed to download");
        }
    });

    // Focus input on load
    qrInput.focus();
});

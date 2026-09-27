
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const logOutput = document.getElementById('log-output');
    const packet = document.getElementById('data-packet');
    const packetText = document.getElementById('packet-text');
    const packetIcon = document.getElementById('packet-icon');
    const topologyContainer = document.getElementById('topology-container');
    const alertBox = document.getElementById('alert-box');
    
    // Input Elements
    const inputMessage = document.getElementById('input-message');
    const inputKey = document.getElementById('input-key');

    // Label Elements
    const labelNode1 = document.getElementById('label-node-1');
    const labelNode2 = document.getElementById('label-node-2');
    const labelNode6 = document.getElementById('label-node-6');
    const labelNode7 = document.getElementById('label-node-7');
    
    let isAnimating = false;

    // --- Fungsi Utilitas Keamanan Jaringan ---

    // 1. Konversi Teks ke Biner
    const textToBinary = (text) => {
        return text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join('');
    };

    // 2. Operasi XOR (Enkripsi / Dekripsi)
    const processXOR = (binaryData, binaryKey) => {
        let result = '';
        // Ulangi key jika lebih pendek dari data
        for(let i = 0; i < binaryData.length; i++) {
            const dataBit = binaryData[i];
            const keyBit = binaryKey[i % binaryKey.length];
            // XOR: sama = 0, beda = 1
            result += (dataBit === keyBit) ? '0' : '1';
        }
        return result;
    };

    // Helper format biner agar mudah dibaca di log
    const formatBinary = (bin) => {
        return bin.length > 24 ? bin.substring(0, 24) + '...' : bin;
    };

    // --- Logika Animasi ---

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const addLog = (htmlMessage) => {
        const entry = document.createElement('div');
        entry.innerHTML = `> ${htmlMessage}`;
        entry.className = "text-slate-300 opacity-0 animate-[fadeIn_0.5s_forwards]";
        logOutput.appendChild(entry);
        logOutput.scrollTop = logOutput.scrollHeight;
    };

    const getCenterOffset = (elementId) => {
        const node = document.getElementById(elementId);
        const containerRect = topologyContainer.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        return (nodeRect.left - containerRect.left) + (nodeRect.width / 2);
    };

    const runSimulation = async () => {
        if (isAnimating) return;

        // Ambil nilai input
        const messageText = inputMessage.value.trim();
        const keyText = inputKey.value.trim();

        if (!messageText || !keyText) {
            alertBox.classList.remove('hidden');
            return;
        }
        alertBox.classList.add('hidden');
        isAnimating = true;

        // Update Labels
        labelNode1.textContent = `Data: ${messageText}`;
        labelNode2.textContent = `Key: ${keyText}`;
        labelNode6.textContent = `Key: ${keyText}`;
        labelNode7.textContent = `Terima: -`;

        // --- PROSES PERHITUNGAN DATA ---
        
        // 1. Convert to Binary
        const binMessage = textToBinary(messageText);
        const binKey = textToBinary(keyText);
        
        // 2. Enkripsi (XOR)
        const ciphertext = processXOR(binMessage, binKey);

        // UI Reset & Setup Animasi
        startBtn.disabled = true;
        startBtn.classList.add('opacity-50', 'cursor-not-allowed');
        logOutput.innerHTML = '';
        packet.style.opacity = '1';
        
        // Definisi langkah dinamis berdasarkan input user
        const simulationSteps = [
            {
                node: 'node-1',
                processTime: 1200,
                outData: `"${messageText}"`,
                outIcon: '📄',
                outColor: 'bg-blue-500',
                log: `<b>[PC PENGIRIM]</b> Pesan asli <span class="text-blue-400">"${messageText}"</span> diubah ke biner: <span class="text-blue-200">${formatBinary(binMessage)}</span>`
            },
            {
                node: 'node-2',
                processTime: 1500,
                outData: formatBinary(ciphertext),
                outIcon: '🔒',
                outColor: 'bg-red-500',
                log: `<b>[ENKRIPSI XOR]</b> Data diacak dengan kunci <span class="text-red-300">"${keyText}"</span> (${formatBinary(binKey)}).<br>&nbsp;&nbsp;Hasil Ciphertext: <span class="text-red-400">${formatBinary(ciphertext)}</span>`
            },
            {
                node: 'node-3',
                processTime: 1500,
                outData: 'Sinyal...',
                outIcon: '〰️',
                outColor: 'bg-purple-600',
                log: `<b>[ENCODER]</b> Mengubah ciphertext menjadi sinyal listrik <b>Differential Manchester</b>. (H➔L, L➔H, dst)`
            },
            {
                node: 'node-4',
                processTime: 1500,
                outData: '⚡ Sinyal Fisik ⚡',
                outIcon: '',
                outColor: 'bg-slate-600',
                log: `<b>[KABEL]</b> Sinyal merambat di kabel. Jika disadap (Man-in-the-Middle), penyadap tidak paham isi pesannya karena sudah terenkripsi.`
            },
            {
                node: 'node-5',
                processTime: 1500,
                outData: formatBinary(ciphertext),
                outIcon: '🔒',
                outColor: 'bg-purple-600',
                log: `<b>[DECODER]</b> Receiver mendeteksi transisi voltase dan merekonstruksi ulang bit: <span class="text-red-400">${formatBinary(ciphertext)}</span>`
            },
            {
                node: 'node-6',
                processTime: 1500,
                outData: formatBinary(binMessage),
                outIcon: '🔓',
                outColor: 'bg-green-500',
                log: `<b>[DEKRIPSI XOR]</b> Dekripsi menggunakan kunci yang sama <span class="text-green-300">"${keyText}"</span>.<br>&nbsp;&nbsp;Hasil Biner: <span class="text-green-400">${formatBinary(binMessage)}</span>`
            },
            {
                node: 'node-7',
                processTime: 1000,
                outData: `"${messageText}"`,
                outIcon: '✅',
                outColor: 'bg-blue-500',
                log: `<b>[PC PENERIMA]</b> Biner diterjemahkan kembali menjadi teks: <span class="text-blue-400 font-bold">"${messageText}"</span>. Pengiriman Aman dan Berhasil!`
            }
        ];

        // --- MENJALANKAN ANIMASI ---
        for (let i = 0; i < simulationSteps.length; i++) {
            const step = simulationSteps[i];
            const targetNode = document.getElementById(step.node);
            
            targetNode.classList.add('active');

            // Gerakkan paket data
            const targetX = getCenterOffset(step.node);
            packet.style.left = `${targetX}px`;

            await delay(600); // Waktu perjalanan antar node

            // Update wujud paket data
            packet.className = `absolute z-20 top-1/2 -translate-y-1/2 -translate-x-1/2 py-1 px-3 md:py-2 md:px-4 rounded-full font-bold text-xs md:text-sm shadow transition-all duration-500 text-white flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis ${step.outColor}`;
            packetText.textContent = step.outData;
            packetIcon.textContent = step.outIcon;

            if(step.node === 'node-3' || step.node === 'node-4') {
                packet.classList.add('animate-signal');
            } else {
                packet.classList.remove('animate-signal');
            }

            addLog(step.log);

            if(step.node === 'node-7'){
                labelNode7.textContent = `Terima: ${messageText}`;
            }

            await delay(step.processTime);
            targetNode.classList.remove('active');
        }

        // Selesai
        isAnimating = false;
        startBtn.disabled = false;
        startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        packet.style.opacity = '0'; // Sembunyikan setelah sampai
        
        // Kembalikan ke posisi awal secara instan (tanpa transisi lambat)
        setTimeout(() => {
            packet.style.transition = 'none';
            packet.style.left = `${getCenterOffset('node-1')}px`;
            setTimeout(() => { packet.style.transition = 'left 1s ease-in-out, background-color 0.5s ease, opacity 0.3s'; }, 50);
        }, 500);
    };

    // Event Listeners
    startBtn.addEventListener('click', runSimulation);

    // Set posisi awal paket tersembunyi
    setTimeout(() => {
        packet.style.transition = 'none';
        packet.style.left = `${getCenterOffset('node-1')}px`;
        setTimeout(() => { packet.style.transition = 'left 1s ease-in-out, background-color 0.5s ease, opacity 0.3s'; }, 100);
    }, 100);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if(!isAnimating && packet.style.opacity === '1') {
            packet.style.opacity = '0'; 
        }
    });
});
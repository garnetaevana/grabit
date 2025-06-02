const jointCount = 6;
const jointControls = document.getElementById("joint-controls");
const statusText = document.getElementById("status-text");
const logArea = document.getElementById("log-area");

for (let i = 1; i <= jointCount; i++) {
  const container = document.createElement("div");
  container.innerHTML = `
    <label class="block text-sm font-medium mb-1">Sendi ${i}</label>
    <input type="range" min="0" max="180" value="90" id="joint${i}" class="w-full accent-blue-500" />
    <p class="text-xs text-gray-400 mt-1">Sudut: <span id="angle${i}">90</span>°</p>
  `;
  jointControls.appendChild(container);

  const slider = container.querySelector(`#joint${i}`);
  const angleDisplay = container.querySelector(`#angle${i}`);

  slider.oninput = () => {
    angleDisplay.textContent = slider.value;
    sendCommand(i, slider.value);
  };
}

function sendCommand(joint, value) {
  // Simulasi pengiriman, bisa diganti fetch('/control') jika backend tersedia
  console.log(`Kirim: Sendi ${joint} ke ${value}°`);
  statusText.textContent = `Mengatur Sendi ${joint}...`;
  logArea.textContent = `Sendi ${joint} → ${value}°`;
}

function runPreset(presetName) {
  const presetValues = {
    siap: [90, 90, 90, 90, 90, 90],
    istirahat: [0, 45, 135, 90, 90, 0],
    ambil: [45, 120, 60, 90, 60, 20],
  };

  if (!presetValues[presetName]) return;
  const values = presetValues[presetName];

  values.forEach((val, idx) => {
    const slider = document.getElementById(`joint${idx + 1}`);
    const angleDisplay = document.getElementById(`angle${idx + 1}`);
    slider.value = val;
    angleDisplay.textContent = val;
    sendCommand(idx + 1, val);
  });

  statusText.textContent = `Menjalankan preset: ${presetName}`;
  logArea.textContent = `Preset ${presetName} dijalankan`;
}

function resetArm() {
  for (let i = 1; i <= jointCount; i++) {
    const slider = document.getElementById(`joint${i}`);
    const angleDisplay = document.getElementById(`angle${i}`);
    slider.value = 90;
    angleDisplay.textContent = 90;
    sendCommand(i, 90);
  }
  statusText.textContent = "Posisi di-reset ke default.";
  logArea.textContent = "Reset semua sendi.";
}

const axios = require('axios');

// URL server-mu
const serverURL = 'http://10.33.102.143:3000/api/robot/sensor-data';

function randomSensorData() {
  const distance = Math.floor(Math.random() * 100); // acak jarak 0-100 cm

  // logika sederhana nyalakan LED berdasarkan jarak
  let ledRed = false, ledYellow = false, ledGreen = false;

  if (distance <= 20) ledRed = true;
  else if (distance <= 50) ledYellow = true;
  else ledGreen = true;

  return {
    sensor: "ultrasonic",
    value: {
      distance: distance,
      ledRed: ledRed,
      ledYellow: ledYellow,
      ledGreen: ledGreen
    }
  };
}

// Kirim data tiap 3 detik
setInterval(() => {
  const data = randomSensorData();

  axios.post(serverURL, data)
    .then(res => {
      console.log('✅ Sensor data sent:', data);
    })
    .catch(err => {
      console.error('❌ Error sending data:', err.message);
    });
}, 3000);

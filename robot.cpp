#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Servo.h>
#include <ArduinoJson.h>

#define ServoPort1 D1
#define ServoPort2 D2
#define ServoPort3 D3
#define ServoPort4 D4

const char* ssid = "Wijayanti";
const char* password = "ibupertiwi01";

Servo myservo1, myservo2, myservo3, myservo4;

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

int pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>ESP8266 Robot Arm</title>
  <script>
    var socket = new WebSocket('ws://' + location.hostname + '/ws');

    socket.onmessage = function(event) {
      var data = JSON.parse(event.data);
      document.getElementById('posX').innerText = data.pos1;
      document.getElementById('posY').innerText = data.pos2;
      document.getElementById('posZ').innerText = data.pos3;
      document.getElementById('grip').innerText = data.pos4;
    };

    function sendData(p1, p2, p3, p4) {
      fetch(/setPOS?servoPOS1=${p1}&servoPOS2=${p2}&servoPOS3=${p3}&servoPOS4=${p4});
    }

    function setupSliders() {
      const sliders = ['s1', 's2', 's3', 's4'];
      sliders.forEach((id, i) => {
        const slider = document.getElementById(id);
        slider.oninput = () => {
          const values = sliders.map(s => document.getElementById(s).value);
          sendData(...values);
        };
      });
    }

    window.onload = setupSliders;
  </script>
</head>
<body>
  <h1>ESP8266 Robot Arm Control</h1>
  <label>Rotation: <input type="range" min="0" max="180" id="s1"></label>
  <label>Gripper: <input type="range" min="0" max="35" id="s2"></label>
  <label>Up/Down: <input type="range" min="50" max="150" id="s3"></label>
  <label>Forward/Back: <input type="range" min="40" max="120" id="s4"></label>

  <h3>Status:</h3>
  <p>X: <span id="posX">0</span></p>
  <p>Y: <span id="posY">0</span></p>
  <p>Z: <span id="posZ">0</span></p>
  <p>Grip: <span id="grip">0</span></p>
</body>
</html>
)rawliteral";

void notifyClients() {
  StaticJsonDocument<128> doc;
  doc["pos1"] = pos1;
  doc["pos2"] = pos2;
  doc["pos3"] = pos3;
  doc["pos4"] = pos4;

  String json;
  serializeJson(doc, json);
  ws.textAll(json);
}

void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
               AwsEventType type, void *arg, uint8_t *data, size_t len) {
  // Tidak perlu proses pesan masuk untuk saat ini
}

void setup() {
  Serial.begin(115200);

  myservo1.attach(ServoPort1);
  myservo2.attach(ServoPort2);
  myservo3.attach(ServoPort3);
  myservo4.attach(ServoPort4);

  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nTerhubung ke WiFi");
  Serial.println(WiFi.localIP());

  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });

  server.on("/setPOS", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("servoPOS1")) pos1 = request->getParam("servoPOS1")->value().toInt();
    if (request->hasParam("servoPOS2")) pos2 = request->getParam("servoPOS2")->value().toInt();
    if (request->hasParam("servoPOS3")) pos3 = request->getParam("servoPOS3")->value().toInt();
    if (request->hasParam("servoPOS4")) pos4 = request->getParam("servoPOS4")->value().toInt();

    myservo1.write(pos1);
    myservo2.write(pos2);
    myservo3.write(pos3);
    myservo4.write(pos4);

    notifyClients(); // kirim data ke dashboard
    request->send(200, "text/plain", "OK");
  });

  server.begin();
}

void loop() {
  // tidak perlu loop tambahan, event-driven
}
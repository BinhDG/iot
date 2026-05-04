#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

// ===== WiFi & MQTT Config =====
const char* ssid = "DGB";
const char* password = "06102004";
const char* mqtt_server = "172.20.10.2"; // Hãy đảm bảo IP này khớp với IP máy tính của bạn
const int mqtt_port = 1884; 
const char* mqtt_user = "tripled";     
const char* mqtt_pass = "842004";

// ===== Hardware Pins =====
#define DHTPIN 4
#define DHTTYPE DHT22
#define LED1 25           
#define LED2 26          
#define LED3 27            
#define AO 34  // Chân Analog của cảm biến ánh sáng LDR

DHT dht(DHTPIN, DHTTYPE);

WiFiClient espClient;
PubSubClient mqttClient(espClient);

unsigned long previousMillis = 0;
const long interval = 2000;  
int ledState1 = LOW;
int ledState2 = LOW;
int ledState3 = LOW;

// Ngưỡng ánh sáng để bật/tắt đèn (Bạn có thể điều chỉnh con số này)
const float LUX_THRESHOLD = 5.0; 

void setup_wifi() {
  Serial.begin(115200);
  delay(10);
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP-Client-";
    clientId += String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_pass, "home/status", 0, true, "offline")) {
      Serial.println("connected");
      mqttClient.subscribe("home/led1");
      mqttClient.subscribe("home/led2");
      mqttClient.subscribe("home/led3");
      mqttClient.publish("home/status", "online", true);
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("Nhận lệnh từ [" + String(topic) + "]: " + message);

  if (String(topic) == "home/led1") {
    if (message == "ON") { digitalWrite(LED1, HIGH); ledState1 = HIGH; }
    else if (message == "OFF") { digitalWrite(LED1, LOW); ledState1 = LOW; }
    
    char statusPayload[100];
    snprintf(statusPayload, sizeof(statusPayload), "{\"led1\": %d}", ledState1);
    mqttClient.publish("home/ledStatus", statusPayload);
  } 
  else if (String(topic) == "home/led2") {
    if (message == "ON") { digitalWrite(LED2, HIGH); ledState2 = HIGH; }
    else if (message == "OFF") { digitalWrite(LED2, LOW); ledState2 = LOW; }
    
    char statusPayload[100];
    snprintf(statusPayload, sizeof(statusPayload), "{\"led2\": %d}", ledState2);
    mqttClient.publish("home/ledStatus", statusPayload);
  } 
  else if (String(topic) == "home/led3") {
    if (message == "ON") { digitalWrite(LED3, HIGH); ledState3 = HIGH; }
    else if (message == "OFF") { digitalWrite(LED3, LOW); ledState3 = LOW; }
    
    char statusPayload[100];
    snprintf(statusPayload, sizeof(statusPayload), "{\"led3\": %d}", ledState3);
    mqttClient.publish("home/ledStatus", statusPayload);
  } 
}

float readLux(int analogValue) {
  const float Vmax = 5.0;
  const int ADC_MAX = 4095;
  const float R = 10000.0;
  const float A = 500000.0;
  const float B = 1.4;

  float V0 = ((float) analogValue / ADC_MAX) * Vmax;
  if (V0 <= 0.0) return 0.0;
  float Rldr = R * (((float) Vmax/V0 ) - 1.0);
  return pow((A / Rldr), (1.0 / B));
}

void setup() {
  setup_wifi();
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callback);
  dht.begin();

  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(AO, INPUT);
  
  digitalWrite(LED1, LOW);
  digitalWrite(LED2, LOW);
  digitalWrite(LED3, LOW);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) setup_wifi();
  if (!mqttClient.connected()) reconnect();
  mqttClient.loop();

  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    // Đọc giá trị cường độ ánh sáng
    int analogRaw = analogRead(AO);
    float luxValue = readLux(4095 - analogRaw); 

    // --- LOGIC TỰ ĐỘNG BẬT/TẮT ĐÈN 1 ---
    if (luxValue < LUX_THRESHOLD) {
      if (ledState1 == LOW) { // Chỉ thực hiện nếu đèn đang tắt
        digitalWrite(LED1, HIGH);
        ledState1 = HIGH;
        mqttClient.publish("home/ledStatus", "{\"led1\": 1}");
        Serial.println("Trời tối -> Tự động bật LED1");
      }
    } else {
      if (ledState1 == HIGH && luxValue > 25.0 )  { // Chỉ thực hiện nếu đèn đang bật
        digitalWrite(LED1, LOW);
        ledState1 = LOW;
        mqttClient.publish("home/ledStatus", "{\"led1\": 0}");
        Serial.println("Trời sáng -> Tự động tắt LED1");
      }
    }
    // ------------------------------------

    if (isnan(temperature)) temperature = 0;
    if (isnan(humidity)) humidity = 0;

    char payload[150];
    snprintf(payload, sizeof(payload), "{\"temperature\": %.2f, \"humidity\": %.2f, \"light\": %d}", temperature, humidity, (int)luxValue);
    
    mqttClient.publish("home/sensor", (uint8_t*)payload, strlen(payload), true); 
    Serial.println("Dữ liệu gửi đi: " + String(payload));
  }
}
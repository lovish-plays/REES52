import type { LmsCourse, LmsEbook, LmsProject, LmsQuiz } from "@/lib/lms/types";

const storeSearch = "https://rees52.com/search?q=";

const ARDUINO_PDF = "/downloads/arduino-foundations-workbook.pdf";
const ESP32_PDF = "/downloads/esp32-iot-lab-workbook.pdf";
const ROBOTICS_PDF = "/downloads/mobile-robotics-build-guide.pdf";

const ARDUINO_DIAGRAM = "/diagrams/arduino-led-wiring.png";
const ESP32_DIAGRAM = "/diagrams/esp32-dht11-wiring.png";
const ROBOTICS_DIAGRAM = "/diagrams/line-follower-wiring.png";

const ARDUINO_LED_VIDEO =
  "https://www.youtube.com/embed/r9IVAW675gs?list=PLeZjSVeikamN774h-nhD4Kn9tgwZwBs6O";
const ARDUINO_SERVO_VIDEO =
  "https://www.youtube.com/embed/CLZ__J_IrpM?list=PLeZjSVeikamN774h-nhD4Kn9tgwZwBs6O";
const ESP32_SETUP_VIDEO =
  "https://www.youtube.com/embed/wJj46imDIgA?list=PLeZjSVeikamNqCwxB8vJdDvPvpQwkZ48c";
const ESP32_SERVER_VIDEO =
  "https://www.youtube.com/embed/7whA0Rl0JmM?list=PLeZjSVeikamNXRnSKIzeYolt8dw_s0mWH";
const LINE_FOLLOWER_VIDEO =
  "https://www.youtube.com/embed/77_Ua1A88Eo?list=PLeZjSVeikamN6N1JhXIal68brRDYm22ol";

const arduinoBlinkCode = `const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
}`;

const arduinoServoCode = `#include <Servo.h>

Servo arm;

void setup() {
  arm.attach(6);
}

void loop() {
  arm.write(20);
  delay(800);
  arm.write(100);
  delay(800);
}`;

const esp32SensorCode = `#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  Serial.printf("T: %.1f C  H: %.1f %%\\n", temperature, humidity);
  delay(2000);
}`;

const esp32ServerCode = `#include <WiFi.h>

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  WiFi.begin("YOUR_WIFI", "YOUR_PASSWORD");
  while (WiFi.status() != WL_CONNECTED) delay(500);
  server.begin();
  Serial.println(WiFi.localIP());
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;
  client.println("HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\n");
  client.println("REES52 ESP32 lab is online");
  client.stop();
}`;

const sensorCalibrationCode = `const int leftSensor = 2;
const int rightSensor = 3;

void setup() {
  pinMode(leftSensor, INPUT);
  pinMode(rightSensor, INPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.print(digitalRead(leftSensor));
  Serial.print(",");
  Serial.println(digitalRead(rightSensor));
  delay(100);
}`;

const lineFollowerCode = `void drive(int left, int right) {
  analogWrite(5, constrain(left, 0, 255));
  analogWrite(9, constrain(right, 0, 255));
}

void loop() {
  int left = digitalRead(2);
  int right = digitalRead(3);
  if (!left && !right) drive(150, 150);
  else if (left && !right) drive(70, 165);
  else if (!left && right) drive(165, 70);
  else drive(0, 0);
}`;

export const lmsCourses: LmsCourse[] = [
  {
    title: "Arduino Foundations: LED and Servo",
    slug: "arduino-beginner-course",
    shortDescription:
      "Complete two Arduino labs with official REES52 videos, checked wiring, working code, a workbook and a scored quiz.",
    description:
      "A complete beginner path from the Arduino development workflow to two working output devices. Learners wire an LED safely, change timing in code, control a servo and document build evidence in the downloadable workbook.",
    category: "Arduino",
    classLevel: "Class 6",
    level: "Beginner",
    duration: "2.5 hours",
    lessonsCount: 5,
    language: "English",
    pricing: "Free",
    thumbnailUrl: "https://img.youtube.com/vi/r9IVAW675gs/hqdefault.jpg",
    whatYouWillLearn: [
      "Identify Arduino power, ground and digital output connections",
      "Protect an LED with a current-limiting resistor",
      "Modify timing values and explain the result",
      "Control two servo positions with the Servo library",
    ],
    modules: [
      {
        title: "Module 1: Digital Output",
        description: "Prepare the board, build the LED circuit and change a working sketch.",
        lessons: [
          {
            title: "Arduino LED Lab: Watch and Prepare",
            slug: "arduino-led-lab",
            type: "video",
            duration: "18 min",
            videoUrl: ARDUINO_LED_VIDEO,
            content:
              "Watch the official REES52 LED tutorial, then identify D9, 5V and GND on your board. Disconnect USB power before moving any wire.",
            circuitDiagramUrl: ARDUINO_DIAGRAM,
            code: arduinoBlinkCode,
            pdfUrl: ARDUINO_PDF,
            isPreview: true,
          },
          {
            title: "Build, Upload and Change the Blink",
            slug: "build-and-change-the-blink",
            type: "project",
            duration: "35 min",
            videoUrl: ARDUINO_LED_VIDEO,
            content:
              "Wire the LED through a 220 ohm resistor, upload the sketch and record three complete cycles. Change both delay values, upload again and explain why the visible pattern changes.",
            circuitDiagramUrl: ARDUINO_DIAGRAM,
            code: arduinoBlinkCode,
            pdfUrl: ARDUINO_PDF,
          },
        ],
      },
      {
        title: "Module 2: Motion Output and Evidence",
        description: "Control a servo, use a repeatable debugging check and pass the course quiz.",
        lessons: [
          {
            title: "Servo Position Control",
            slug: "servo-position-control",
            type: "video",
            duration: "24 min",
            videoUrl: ARDUINO_SERVO_VIDEO,
            content:
              "Connect the servo signal to D6, keep the horn clear and test two safe target angles. Reduce travel if the servo chatters or reaches a mechanical stop.",
            circuitDiagramUrl: ARDUINO_DIAGRAM,
            code: arduinoServoCode,
            pdfUrl: ARDUINO_PDF,
          },
          {
            title: "Debugging and Build Evidence",
            slug: "arduino-debugging-evidence",
            type: "text",
            duration: "20 min",
            content:
              "Use the workbook to record a wiring photo, the code version that compiled, one observed result and one change you made. If upload fails, check the USB cable, board, port and Serial Monitor before changing the circuit.",
            circuitDiagramUrl: ARDUINO_DIAGRAM,
            code: arduinoServoCode,
            pdfUrl: ARDUINO_PDF,
          },
          {
            title: "Arduino Foundations Quiz",
            slug: "arduino-foundations-quiz",
            type: "quiz",
            duration: "12 min",
            content:
              "Answer five questions about LED protection, pin setup, timing, servo control and safe rewiring.",
            pdfUrl: ARDUINO_PDF,
          },
        ],
      },
    ],
    requiredComponents: [
      { name: "Arduino Uno compatible board", quantity: 1, productUrl: `${storeSearch}Arduino+Uno` },
      { name: "LED and 220 ohm resistor", quantity: 1, productUrl: `${storeSearch}LED+resistor` },
      { name: "SG90 servo motor", quantity: 1, productUrl: `${storeSearch}SG90+servo` },
      { name: "Breadboard and jumper wires", quantity: 1, productUrl: `${storeSearch}breadboard+jumper+wires` },
    ],
    projects: ["Timed LED signal", "Two-position servo arm"],
    downloadablePdfs: [
      { title: "Arduino Foundations Workbook", url: ARDUINO_PDF },
    ],
    relatedProducts: [
      { name: "Arduino learning kits", quantity: 1, productUrl: `${storeSearch}Arduino+starter+kit` },
    ],
    faqs: [
      {
        question: "Do I need previous coding experience?",
        answer: "No. The first lesson explains the wiring and the code changes one line at a time.",
      },
      {
        question: "How is completion measured?",
        answer: "Complete all five lessons, save build evidence and pass the five-question quiz.",
      },
    ],
  },
  {
    title: "ESP32 IoT: Sensor to Local Web",
    slug: "esp32-iot-course",
    shortDescription:
      "Set up an ESP32, read a DHT11 and serve a local web response with official REES52 videos, code, wiring and a workbook.",
    description:
      "A complete intermediate lab that connects sensing and networking. Learners configure the ESP32 toolchain, read temperature and humidity, connect to a trusted Wi-Fi network and return a simple browser response without publishing credentials.",
    category: "IoT",
    classLevel: "Class 8",
    level: "Intermediate",
    duration: "3 hours",
    lessonsCount: 5,
    language: "English",
    pricing: "Free",
    thumbnailUrl: "https://img.youtube.com/vi/wJj46imDIgA/hqdefault.jpg",
    whatYouWillLearn: [
      "Configure an ESP32 board in the Arduino IDE",
      "Wire a DHT11 using 3.3 V logic and a common ground",
      "Read and validate temperature and humidity values",
      "Start a small local web server without exposing credentials",
    ],
    modules: [
      {
        title: "Module 1: Board and Sensor",
        description: "Prepare the toolchain and collect reliable DHT11 readings.",
        lessons: [
          {
            title: "Install ESP32 Board Support",
            slug: "install-esp32-board-support",
            type: "video",
            duration: "22 min",
            videoUrl: ESP32_SETUP_VIDEO,
            content:
              "Follow the official REES52 setup tutorial, select the matching ESP32 board and confirm the serial port with a minimal upload.",
            circuitDiagramUrl: ESP32_DIAGRAM,
            code: esp32SensorCode,
            pdfUrl: ESP32_PDF,
            isPreview: true,
          },
          {
            title: "Read the DHT11 Sensor",
            slug: "read-dht11-sensor",
            type: "project",
            duration: "40 min",
            videoUrl: ESP32_SETUP_VIDEO,
            content:
              "Connect VCC to 3V3, DATA to GPIO 4 and GND to GND. Record three readings at least two seconds apart and identify any invalid values before continuing.",
            circuitDiagramUrl: ESP32_DIAGRAM,
            code: esp32SensorCode,
            pdfUrl: ESP32_PDF,
          },
        ],
      },
      {
        title: "Module 2: Local Network Output",
        description: "Connect safely, serve a response and document the result.",
        lessons: [
          {
            title: "Create a Local Web Server",
            slug: "create-local-web-server",
            type: "video",
            duration: "28 min",
            videoUrl: ESP32_SERVER_VIDEO,
            content:
              "Use a trusted network, replace credentials only in your private local copy and open the printed local IP address from another device on the same network.",
            circuitDiagramUrl: ESP32_DIAGRAM,
            code: esp32ServerCode,
            pdfUrl: ESP32_PDF,
          },
          {
            title: "Protect Credentials and Record Evidence",
            slug: "protect-credentials-record-evidence",
            type: "text",
            duration: "20 min",
            content:
              "Remove Wi-Fi credentials before sharing code or screenshots. Save a serial reading, the local browser response and one debugging note in the workbook.",
            circuitDiagramUrl: ESP32_DIAGRAM,
            code: esp32ServerCode,
            pdfUrl: ESP32_PDF,
          },
          {
            title: "ESP32 IoT Quiz",
            slug: "esp32-iot-quiz",
            type: "quiz",
            duration: "12 min",
            content:
              "Answer five questions about voltage, sensor timing, local IP addresses, credentials and network scope.",
            pdfUrl: ESP32_PDF,
          },
        ],
      },
    ],
    requiredComponents: [
      { name: "ESP32 development board", quantity: 1, productUrl: `${storeSearch}ESP32+development+board` },
      { name: "DHT11 sensor module", quantity: 1, productUrl: `${storeSearch}DHT11` },
      { name: "10k ohm resistor", quantity: 1, productUrl: `${storeSearch}10k+resistor` },
      { name: "Breadboard and jumper wires", quantity: 1, productUrl: `${storeSearch}breadboard+jumper+wires` },
    ],
    projects: ["Temperature and humidity monitor", "Private local web response"],
    downloadablePdfs: [
      { title: "ESP32 IoT Lab Workbook", url: ESP32_PDF },
    ],
    relatedProducts: [
      { name: "ESP32 and IoT kits", quantity: 1, productUrl: `${storeSearch}ESP32+IoT+kit` },
    ],
    faqs: [
      {
        question: "Does this publish data to the internet?",
        answer: "No. The guided server is available only on the learner's trusted local network.",
      },
      {
        question: "Should I upload my Wi-Fi password with the project?",
        answer: "No. Credentials must stay in a private local copy and be removed before sharing.",
      },
    ],
  },
  {
    title: "Mobile Robotics: Line Follower",
    slug: "robotics-starter-course",
    shortDescription:
      "Calibrate two IR sensors, test a motor driver and tune a complete line-following robot with video, code, wiring and a build guide.",
    description:
      "A complete project path for a two-sensor line follower. Learners assemble the signal chain, calibrate surface detection, test one motor at a time and tune four movement decisions on a broad closed track.",
    category: "Robotics",
    classLevel: "Class 7",
    level: "Beginner",
    duration: "3.5 hours",
    lessonsCount: 5,
    language: "English",
    pricing: "Free",
    thumbnailUrl: "https://img.youtube.com/vi/77_Ua1A88Eo/hqdefault.jpg",
    whatYouWillLearn: [
      "Explain how reflected infrared light distinguishes the track",
      "Calibrate left and right sensor thresholds",
      "Use a motor driver for speed and direction control",
      "Tune forward, left, right and stop decisions safely",
    ],
    modules: [
      {
        title: "Module 1: Sense the Track",
        description: "Understand the build, mount the sensors and record stable surface readings.",
        lessons: [
          {
            title: "Line Follower Build Overview",
            slug: "line-follower-build-overview",
            type: "video",
            duration: "20 min",
            videoUrl: LINE_FOLLOWER_VIDEO,
            content:
              "Watch the official REES52 line follower tutorial and identify the two IR sensors, controller, L298N motor driver and battery path before wiring.",
            circuitDiagramUrl: ROBOTICS_DIAGRAM,
            code: sensorCalibrationCode,
            pdfUrl: ROBOTICS_PDF,
            isPreview: true,
          },
          {
            title: "Calibrate Left and Right Sensors",
            slug: "calibrate-line-sensors",
            type: "project",
            duration: "45 min",
            videoUrl: LINE_FOLLOWER_VIDEO,
            content:
              "Mount both sensors at the same height, move each across the track and adjust the onboard threshold until both switch reliably over the dark line and light background.",
            circuitDiagramUrl: ROBOTICS_DIAGRAM,
            code: sensorCalibrationCode,
            pdfUrl: ROBOTICS_PDF,
          },
        ],
      },
      {
        title: "Module 2: Drive and Tune",
        description: "Test the motor channels, add decisions and document a repeatable run.",
        lessons: [
          {
            title: "Program the Four Movement States",
            slug: "program-four-movement-states",
            type: "video",
            duration: "32 min",
            videoUrl: LINE_FOLLOWER_VIDEO,
            content:
              "Raise the chassis for the first motor test. Confirm one channel at low PWM, then map the two sensor readings to forward, left correction, right correction and stop.",
            circuitDiagramUrl: ROBOTICS_DIAGRAM,
            code: lineFollowerCode,
            pdfUrl: ROBOTICS_PDF,
          },
          {
            title: "Track Test and Troubleshooting",
            slug: "track-test-troubleshooting",
            type: "project",
            duration: "45 min",
            content:
              "Run on a wide closed track, change one speed value at a time and record the effect. Recheck sensor height and common ground before compensating in software.",
            circuitDiagramUrl: ROBOTICS_DIAGRAM,
            code: lineFollowerCode,
            pdfUrl: ROBOTICS_PDF,
          },
          {
            title: "Mobile Robotics Quiz",
            slug: "mobile-robotics-quiz",
            type: "quiz",
            duration: "12 min",
            content:
              "Answer five questions about IR reflection, motor drivers, calibration, safe testing and controlled tuning.",
            pdfUrl: ROBOTICS_PDF,
          },
        ],
      },
    ],
    requiredComponents: [
      { name: "Arduino Uno compatible board", quantity: 1, productUrl: `${storeSearch}Arduino+Uno` },
      { name: "IR line sensor module", quantity: 2, productUrl: `${storeSearch}IR+line+sensor` },
      { name: "L298N motor driver", quantity: 1, productUrl: `${storeSearch}L298N` },
      { name: "Robot chassis, motors and battery pack", quantity: 1, productUrl: `${storeSearch}robot+car+kit` },
    ],
    projects: ["Calibrated two-sensor test rig", "Complete line-following robot"],
    downloadablePdfs: [
      { title: "Mobile Robotics Build Guide", url: ROBOTICS_PDF },
    ],
    relatedProducts: [
      { name: "Robot car kits", quantity: 1, productUrl: `${storeSearch}robot+car+kit` },
    ],
    faqs: [
      {
        question: "Why must the robot be raised for the first motor test?",
        answer: "The wheels can turn without the chassis moving unexpectedly while direction and speed are verified.",
      },
      {
        question: "What evidence completes the project?",
        answer: "A wiring photo, saved code, sensor readings, one debugging note and a successful closed-track run.",
      },
    ],
  },
];

export const lmsProjects: LmsProject[] = [
  {
    title: "Timed LED Signal",
    slug: "timed-led-signal",
    shortDescription: "Wire a protected LED, change its timing and document a repeatable output pattern.",
    description:
      "A complete first Arduino build with official REES52 video guidance, a checked wiring diagram, working code, build steps and a troubleshooting path.",
    category: "Arduino Projects",
    classLevel: "Class 6",
    level: "Beginner",
    estimatedTime: "45 minutes",
    thumbnailUrl: "https://img.youtube.com/vi/r9IVAW675gs/hqdefault.jpg",
    videoUrl: ARDUINO_LED_VIDEO,
    circuitDiagramUrl: ARDUINO_DIAGRAM,
    sourceCode: arduinoBlinkCode,
    steps: [
      "Disconnect USB power and place the LED on the breadboard.",
      "Connect D9 through a 220 ohm resistor to the LED anode.",
      "Connect the LED cathode to GND and verify polarity.",
      "Upload the sketch, record three cycles and change both delay values.",
    ],
    troubleshooting: [
      "If the LED is dark, reverse it only after disconnecting power.",
      "If upload fails, check the selected board, port and data-capable USB cable.",
      "If brightness is unstable, inspect the resistor and common ground connections.",
    ],
    components: [
      { name: "Arduino Uno compatible board", quantity: 1, productUrl: `${storeSearch}Arduino+Uno` },
      { name: "LED", quantity: 1, productUrl: `${storeSearch}LED` },
      { name: "220 ohm resistor", quantity: 1, productUrl: `${storeSearch}220+ohm+resistor` },
      { name: "Breadboard and jumper wires", quantity: 1, productUrl: `${storeSearch}breadboard+jumper+wires` },
    ],
  },
  {
    title: "ESP32 Temperature Monitor",
    slug: "esp32-temperature-monitor",
    shortDescription: "Read DHT11 temperature and humidity values safely with an ESP32.",
    description:
      "A complete sensor project using 3.3 V logic, a local wiring diagram, working serial code, measured results and practical invalid-reading checks.",
    category: "IoT Projects",
    classLevel: "Class 8",
    level: "Intermediate",
    estimatedTime: "60 minutes",
    thumbnailUrl: "https://img.youtube.com/vi/wJj46imDIgA/hqdefault.jpg",
    videoUrl: ESP32_SETUP_VIDEO,
    circuitDiagramUrl: ESP32_DIAGRAM,
    sourceCode: esp32SensorCode,
    steps: [
      "Connect DHT11 VCC to 3V3, DATA to GPIO 4 and GND to GND.",
      "Install the matching DHT sensor library and select the ESP32 board.",
      "Upload the sketch and open Serial Monitor at 115200 baud.",
      "Record three readings at least two seconds apart.",
    ],
    troubleshooting: [
      "If values are invalid, wait two seconds and recheck the sensor type.",
      "If upload fails, hold BOOT only when required by the board variant.",
      "If readings jump, shorten signal wires and verify the pull-up connection.",
    ],
    components: [
      { name: "ESP32 development board", quantity: 1, productUrl: `${storeSearch}ESP32+development+board` },
      { name: "DHT11 sensor", quantity: 1, productUrl: `${storeSearch}DHT11` },
      { name: "10k ohm resistor", quantity: 1, productUrl: `${storeSearch}10k+resistor` },
      { name: "Breadboard and jumper wires", quantity: 1, productUrl: `${storeSearch}breadboard+jumper+wires` },
    ],
  },
  {
    title: "Two-Sensor Line Follower",
    slug: "line-follower-robot",
    shortDescription: "Calibrate two IR sensors and tune four movement decisions on a safe test track.",
    description:
      "A complete mobile robotics project with official REES52 video guidance, a signal-flow diagram, working control code, assembly steps and targeted troubleshooting.",
    category: "Robotics Projects",
    classLevel: "Class 7",
    level: "Beginner",
    estimatedTime: "3 hours",
    thumbnailUrl: "https://img.youtube.com/vi/77_Ua1A88Eo/hqdefault.jpg",
    videoUrl: LINE_FOLLOWER_VIDEO,
    circuitDiagramUrl: ROBOTICS_DIAGRAM,
    sourceCode: lineFollowerCode,
    steps: [
      "Mount both IR sensors at the same height and connect a common ground.",
      "Raise the chassis and verify one motor direction at low PWM.",
      "Record sensor states over the dark line and light background.",
      "Add the four movement decisions and tune one speed value at a time.",
    ],
    troubleshooting: [
      "If the robot oscillates, reduce correction speed before changing hardware.",
      "If one sensor never switches, recalibrate height and threshold.",
      "If both motors run backward, correct the mapping one channel at a time.",
    ],
    components: [
      { name: "Arduino Uno compatible board", quantity: 1, productUrl: `${storeSearch}Arduino+Uno` },
      { name: "IR line sensor", quantity: 2, productUrl: `${storeSearch}IR+line+sensor` },
      { name: "L298N motor driver", quantity: 1, productUrl: `${storeSearch}L298N` },
      { name: "Robot chassis and battery pack", quantity: 1, productUrl: `${storeSearch}robot+car+kit` },
    ],
  },
];

export const lmsEbooks: LmsEbook[] = [
  {
    title: "Arduino Foundations Workbook",
    slug: "arduino-foundations-workbook",
    description:
      "An eight-page lab workbook with materials, safety, wiring, two code labs, troubleshooting, quiz questions and completion evidence.",
    category: "Arduino Guides",
    pages: 8,
    level: "Beginner",
    coverUrl: ARDUINO_DIAGRAM,
    fileUrl: ARDUINO_PDF,
    isFree: true,
  },
  {
    title: "ESP32 IoT Lab Workbook",
    slug: "esp32-iot-lab-workbook",
    description:
      "An eight-page workbook for ESP32 setup, DHT11 measurements, a private local web response, credential safety and quiz evidence.",
    category: "IoT Guides",
    pages: 8,
    level: "Intermediate",
    coverUrl: ESP32_DIAGRAM,
    fileUrl: ESP32_PDF,
    isFree: true,
  },
  {
    title: "Mobile Robotics Build Guide",
    slug: "mobile-robotics-build-guide",
    description:
      "An eight-page line-follower guide with sensor calibration, motor-driver wiring, control code, troubleshooting and a completion checklist.",
    category: "Robotics Guides",
    pages: 8,
    level: "Beginner",
    coverUrl: ROBOTICS_DIAGRAM,
    fileUrl: ROBOTICS_PDF,
    isFree: true,
  },
];

export const lmsQuizzes: LmsQuiz[] = [
  {
    title: "Arduino Foundations Quiz",
    courseSlug: "arduino-beginner-course",
    moduleTitle: "Module 2: Motion Output and Evidence",
    passingScore: 80,
    questions: [
      {
        question: "Why is a resistor used with the LED?",
        options: ["To limit current", "To store code", "To reverse polarity", "To increase voltage"],
        correctOption: "To limit current",
        explanation: "The resistor limits current to protect the LED and Arduino output pin.",
      },
      {
        question: "Which function configures an Arduino pin?",
        options: ["pinMode()", "delay()", "attach()", "print()"],
        correctOption: "pinMode()",
        explanation: "pinMode() declares whether the pin will operate as an input or output.",
      },
      {
        question: "What unit does delay() use?",
        options: ["Milliseconds", "Volts", "Degrees", "Bytes"],
        correctOption: "Milliseconds",
        explanation: "delay(500) pauses the sketch for 500 milliseconds.",
      },
      {
        question: "Which library controls the hobby servo in this course?",
        options: ["Servo", "WiFi", "DHT", "LiquidCrystal"],
        correctOption: "Servo",
        explanation: "The Servo library generates the control signal used by hobby servos.",
      },
      {
        question: "What should you do before changing the wiring?",
        options: ["Disconnect power", "Increase voltage", "Remove the resistor", "Short 5 V to GND"],
        correctOption: "Disconnect power",
        explanation: "Disconnecting power reduces the chance of accidental shorts or damaged components.",
      },
    ],
  },
  {
    title: "ESP32 IoT Quiz",
    courseSlug: "esp32-iot-course",
    moduleTitle: "Module 2: Local Network Output",
    passingScore: 80,
    questions: [
      {
        question: "Which voltage is used for the sensor wiring in this course?",
        options: ["3.3 V", "12 V", "24 V", "Mains voltage"],
        correctOption: "3.3 V",
        explanation: "The guided ESP32 sensor circuit uses 3.3 V logic.",
      },
      {
        question: "Why should the code wait between DHT11 readings?",
        options: ["The sensor updates slowly", "Wi-Fi needs charging", "GPIO 4 is analog only", "The USB cable cools down"],
        correctOption: "The sensor updates slowly",
        explanation: "The DHT11 needs time between measurements to return stable values.",
      },
      {
        question: "What does Serial Monitor show for the local server?",
        options: ["The local IP address", "A certificate", "A motor speed", "A PDF page"],
        correctOption: "The local IP address",
        explanation: "The browser uses the local IP address to reach the ESP32 on the same network.",
      },
      {
        question: "Where should Wi-Fi credentials remain?",
        options: ["Only in a private local copy", "In public screenshots", "In the course title", "On the PCB"],
        correctOption: "Only in a private local copy",
        explanation: "Credentials must be removed before code or screenshots are shared.",
      },
      {
        question: "Which devices can open the guided local server?",
        options: ["Devices on the same network", "Any device without a network", "Only the DHT11", "Only a printer"],
        correctOption: "Devices on the same network",
        explanation: "The course does not expose the server to the public internet.",
      },
    ],
  },
  {
    title: "Mobile Robotics Quiz",
    courseSlug: "robotics-starter-course",
    moduleTitle: "Module 2: Drive and Tune",
    passingScore: 80,
    questions: [
      {
        question: "What do the line sensors compare?",
        options: ["Reflected infrared light", "Motor voltage only", "Wi-Fi strength", "Sound level"],
        correctOption: "Reflected infrared light",
        explanation: "Dark and light surfaces reflect different amounts of infrared light.",
      },
      {
        question: "Why does the robot use a motor driver?",
        options: ["To handle motor current and direction", "To store PDFs", "To measure humidity", "To replace the battery"],
        correctOption: "To handle motor current and direction",
        explanation: "The motor driver safely switches current and direction under controller commands.",
      },
      {
        question: "What should be tested before placing the robot on the track?",
        options: ["One motor direction at low speed", "Maximum speed on the floor", "The battery in reverse", "The certificate page"],
        correctOption: "One motor direction at low speed",
        explanation: "A raised low-speed test verifies wiring without unexpected movement.",
      },
      {
        question: "What does sensor calibration improve?",
        options: ["Reliable line detection", "PDF page count", "Wi-Fi range", "Servo angle"],
        correctOption: "Reliable line detection",
        explanation: "Calibration sets a useful switching threshold for the actual track surface.",
      },
      {
        question: "How should speed values be tuned?",
        options: ["One value at a time", "All values randomly", "Only by increasing voltage", "Without observing the robot"],
        correctOption: "One value at a time",
        explanation: "Changing one value at a time makes the cause of each behavior visible.",
      },
    ],
  },
];

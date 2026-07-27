import { LmsCourse, LmsEbook, LmsProject, LmsQuiz } from "@/lib/lms/types";

const storeSearch = "https://rees52.com/search?s=";
const pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export const lmsCourses: LmsCourse[] = [
  {
    title: "Arduino Beginner Course",
    slug: "arduino-beginner-course",
    shortDescription: "Start electronics with Arduino boards, outputs, sensors, and one complete distance alert project.",
    description:
      "A beginner-friendly course for students and makers who want to learn Arduino through practical circuits, simple code, and real REES52 components.",
    category: "Arduino",
    classLevel: "Class 3",
    level: "Beginner",
    duration: "6 hours",
    lessonsCount: 10,
    language: "English",
    pricing: "Free",
    thumbnailUrl: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=900&auto=format&fit=crop&q=70",
    whatYouWillLearn: [
      "Understand Arduino boards and the Arduino IDE",
      "Control LEDs, buzzers, and RGB output devices",
      "Read IR, ultrasonic, and LDR sensors",
      "Build a smart distance alert system"
    ],
    modules: [
      {
        title: "Module 1: Introduction to Arduino",
        description: "Get comfortable with the board, software, and first upload.",
        lessons: [
          {
            title: "What is Arduino?",
            slug: "what-is-arduino",
            type: "video",
            duration: "18 min",
            videoUrl: "https://www.youtube.com/embed/d8_xXNcGYgo",
            content:
              "Arduino is an open hardware platform used to read sensors and control outputs. In this lesson you will understand where Arduino fits inside robotics, IoT, and classroom STEM projects.",
            pdfUrl,
            isPreview: true
          },
          {
            title: "Arduino Board Overview",
            slug: "arduino-board-overview",
            type: "text",
            duration: "22 min",
            content:
              "Identify digital pins, analog pins, power pins, USB input, reset button, and the microcontroller. Use this as your board orientation before wiring circuits.",
            circuitDiagramUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70",
            pdfUrl
          },
          {
            title: "Arduino IDE Setup",
            slug: "arduino-ide-setup",
            type: "text",
            duration: "25 min",
            content:
              "Install the Arduino IDE, select the board and port, and upload your first sketch. Keep the serial monitor ready for sensor lessons.",
            code: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  Serial.println(\"REES52 Academy ready\");\n  delay(1000);\n}",
            pdfUrl
          },
          {
            title: "Quiz 1",
            slug: "quiz-1",
            type: "quiz",
            duration: "10 min",
            content: "Check your understanding of Arduino boards, pins, and IDE setup."
          }
        ]
      },
      {
        title: "Module 2: Basic Output Devices",
        description: "Control common output devices used in beginner robotics builds.",
        lessons: [
          {
            title: "LED Blinking",
            slug: "led-blinking",
            type: "video",
            duration: "28 min",
            content:
              "Wire an LED with a resistor and control it using a digital pin. This is the classic first step into embedded output control.",
            code: "const int ledPin = 13;\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  delay(500);\n  digitalWrite(ledPin, LOW);\n  delay(500);\n}",
            pdfUrl
          },
          {
            title: "Buzzer Control",
            slug: "buzzer-control",
            type: "text",
            duration: "20 min",
            content:
              "Use a buzzer to create alerts. This prepares you for distance alarms, security systems, and sensor feedback projects.",
            code: "const int buzzer = 8;\n\nvoid setup() {\n  pinMode(buzzer, OUTPUT);\n}\n\nvoid loop() {\n  tone(buzzer, 1000);\n  delay(300);\n  noTone(buzzer);\n  delay(700);\n}"
          },
          {
            title: "RGB LED",
            slug: "rgb-led",
            type: "text",
            duration: "25 min",
            content:
              "Control three color channels with PWM pins and create status indicators for electronics projects."
          },
          {
            title: "Quiz 2",
            slug: "quiz-2",
            type: "quiz",
            duration: "10 min",
            content: "Check your understanding of digital outputs, PWM, LEDs, and buzzers."
          }
        ]
      },
      {
        title: "Module 3: Sensors",
        description: "Read real-world inputs and convert them into decisions.",
        lessons: [
          {
            title: "IR Sensor",
            slug: "ir-sensor",
            type: "video",
            duration: "24 min",
            content:
              "Use an IR sensor to detect nearby objects and create simple line or obstacle logic."
          },
          {
            title: "Ultrasonic Sensor",
            slug: "ultrasonic-sensor",
            type: "video",
            duration: "32 min",
            content:
              "Measure distance with an ultrasonic sensor and use the result to trigger an LED or buzzer.",
            code: "const int trigPin = 9;\nconst int echoPin = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n}\n\nvoid loop() {\n  digitalWrite(trigPin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n  long duration = pulseIn(echoPin, HIGH);\n  int distance = duration * 0.034 / 2;\n  Serial.println(distance);\n  delay(300);\n}"
          },
          {
            title: "LDR Sensor",
            slug: "ldr-sensor",
            type: "text",
            duration: "18 min",
            content:
              "Read analog light levels with an LDR and build light-sensitive project logic."
          },
          {
            title: "Quiz 3",
            slug: "quiz-3",
            type: "quiz",
            duration: "10 min",
            content: "Review sensor wiring, input readings, and simple decisions."
          }
        ]
      },
      {
        title: "Final Project: Smart Distance Alert System",
        description: "Combine outputs and sensors into one practical project.",
        lessons: [
          {
            title: "Smart Distance Alert System",
            slug: "smart-distance-alert-system",
            type: "project",
            duration: "45 min",
            content:
              "Build a small alert system using an ultrasonic sensor, buzzer, and LED indicator. This project reinforces wiring, sensor reading, and conditional logic."
          }
        ]
      }
    ],
    requiredComponents: [
      { name: "Arduino Uno R3", quantity: 1, productUrl: `${storeSearch}Arduino+Uno+R3` },
      { name: "Ultrasonic Sensor HC-SR04", quantity: 1, productUrl: `${storeSearch}HC-SR04` },
      { name: "LED Pack", quantity: 1, productUrl: `${storeSearch}LED` },
      { name: "Buzzer", quantity: 1, productUrl: `${storeSearch}Buzzer` },
      { name: "Jumper Wires", quantity: 1, productUrl: `${storeSearch}Jumper+Wires` }
    ],
    projects: ["Smart Distance Alert System", "Mini Light Alert"],
    downloadablePdfs: ["Arduino pinout guide", "Starter wiring reference", "Smart distance alert worksheet"],
    relatedProducts: [
      { name: "REES52 Uno R3 Starter Kit", quantity: 1, productUrl: "https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html" }
    ],
    faqs: [
      { question: "Do I need prior coding experience?", answer: "No. The course starts from wiring basics and simple Arduino sketches." },
      { question: "Can schools use this course?", answer: "Yes. The modules work well for STEM labs, ATL labs, and classroom demonstrations." }
    ]
  },
  {
    title: "ESP32 IoT Course",
    slug: "esp32-iot-course",
    shortDescription: "Learn Wi-Fi enabled electronics with sensor data, web dashboards, and automation basics.",
    description: "A practical IoT course covering ESP32 setup, Wi-Fi, sensor readings, and simple cloud-ready project patterns.",
    category: "IoT",
    classLevel: "Class 8",
    level: "Intermediate",
    duration: "8 hours",
    lessonsCount: 12,
    language: "English",
    pricing: "Paid",
    price: 999,
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70",
    whatYouWillLearn: ["Configure ESP32", "Read sensors over Wi-Fi", "Create automation triggers", "Build a weather station"],
    modules: [],
    requiredComponents: [{ name: "ESP32 Development Board", quantity: 1, productUrl: `${storeSearch}ESP32` }],
    projects: ["IoT Weather Station", "Home Automation using ESP32"],
    downloadablePdfs: ["ESP32 pinout guide", "IoT wiring checklist"],
    relatedProducts: [{ name: "ESP32 Board", quantity: 1, productUrl: `${storeSearch}ESP32` }],
    faqs: [{ question: "Is this for beginners?", answer: "It is best after basic Arduino or electronics familiarity." }]
  },
  {
    title: "Robotics Starter Course",
    slug: "robotics-starter-course",
    shortDescription: "Build wheeled robots with motors, drivers, sensors, and movement logic.",
    description: "A project-based introduction to robot chassis assembly, motor control, and obstacle decisions.",
    category: "Robotics",
    classLevel: "Class 5",
    level: "Beginner",
    duration: "7 hours",
    lessonsCount: 11,
    language: "English",
    pricing: "Free",
    thumbnailUrl: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=900&auto=format&fit=crop&q=70",
    whatYouWillLearn: ["Assemble a robot chassis", "Use motor drivers", "Add obstacle sensing", "Tune robot movement"],
    modules: [],
    requiredComponents: [{ name: "4WD Robot Car Kit", quantity: 1, productUrl: `${storeSearch}Robot+Car+Kit` }],
    projects: ["Line Follower Robot", "Obstacle Avoiding Robot"],
    downloadablePdfs: ["Robot chassis assembly notes"],
    relatedProducts: [{ name: "REES52 4WD Smart Robot Car Kit", quantity: 1, productUrl: "https://rees52.com/robotics/456-rees52-4wd-smart-robot-car-kit.html" }],
    faqs: [{ question: "Does it include coding?", answer: "Yes. It includes starter motor and sensor code." }]
  },
  {
    title: "Raspberry Pi Basics",
    slug: "raspberry-pi-basics",
    shortDescription: "Set up Raspberry Pi and use it for Linux, GPIO, camera, and classroom computing.",
    description: "A gentle Raspberry Pi course for school labs and beginner makers.",
    category: "Raspberry Pi",
    classLevel: "Class 7",
    level: "Beginner",
    duration: "5 hours",
    lessonsCount: 8,
    language: "English",
    pricing: "Paid",
    price: 799,
    thumbnailUrl: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=900&auto=format&fit=crop&q=70",
    whatYouWillLearn: ["Install Raspberry Pi OS", "Use GPIO safely", "Run Python scripts", "Connect basic modules"],
    modules: [],
    requiredComponents: [{ name: "Raspberry Pi Board", quantity: 1, productUrl: `${storeSearch}Raspberry+Pi` }],
    projects: ["Sensor logger", "Mini camera station"],
    downloadablePdfs: ["Raspberry Pi setup checklist"],
    relatedProducts: [{ name: "Raspberry Pi Accessories", quantity: 1, productUrl: `${storeSearch}Raspberry+Pi` }],
    faqs: [{ question: "Do I need a monitor?", answer: "A monitor is useful for setup, but headless setup can also work." }]
  },
  {
    title: "Drone Technology Basics",
    slug: "drone-technology-basics",
    shortDescription: "Understand frames, motors, ESCs, flight controllers, and safe assembly basics.",
    description: "A foundation course for drone terminology, component selection, and beginner-safe assembly planning.",
    category: "Drones",
    classLevel: "Class 10",
    level: "Intermediate",
    duration: "4 hours",
    lessonsCount: 7,
    language: "English",
    pricing: "Paid",
    price: 1299,
    thumbnailUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=900&auto=format&fit=crop&q=70",
    whatYouWillLearn: ["Identify drone components", "Understand thrust and frame size", "Plan wiring", "Prepare safe test steps"],
    modules: [],
    requiredComponents: [{ name: "F450 Drone Frame Kit", quantity: 1, productUrl: `${storeSearch}F450+Drone` }],
    projects: ["Mini Drone Assembly"],
    downloadablePdfs: ["Drone safety checklist"],
    relatedProducts: [{ name: "REES52 F450 Drone DIY Builder Kit", quantity: 1, productUrl: "https://rees52.com/drones/101-rees52-f450-drone-diy-kit.html" }],
    faqs: [{ question: "Will this teach flying?", answer: "It focuses on technology basics and safe assembly preparation." }]
  },
  {
    title: "3D Printing Basics",
    slug: "3d-printing-basics",
    shortDescription: "Learn slicer settings, materials, printer care, and beginner classroom models.",
    description: "A practical introduction to 3D printing for student labs and maker classrooms.",
    category: "3D Printing",
    classLevel: "Class 6",
    level: "Beginner",
    duration: "4 hours",
    lessonsCount: 7,
    language: "English",
    pricing: "Free",
    thumbnailUrl: "https://images.unsplash.com/photo-1611117775350-ac3950990985?w=900&auto=format&fit=crop&q=70",
    whatYouWillLearn: ["Understand FDM printing", "Prepare models", "Tune common slicer settings", "Fix basic print failures"],
    modules: [],
    requiredComponents: [{ name: "PLA Filament", quantity: 1, productUrl: `${storeSearch}PLA+Filament` }],
    projects: ["3D Printed Toy Model"],
    downloadablePdfs: ["Slicer basics sheet"],
    relatedProducts: [{ name: "3D Printing Accessories", quantity: 1, productUrl: `${storeSearch}3D+Printer` }],
    faqs: [{ question: "Is a printer required?", answer: "A printer is recommended for hands-on practice." }]
  },
  {
    title: "Sensors and Modules Course",
    slug: "sensors-and-modules-course",
    shortDescription: "Test common sensors and modules used in robotics, automation, and ATL labs.",
    description: "A lab-friendly course for understanding sensor outputs, wiring, and testing methods.",
    category: "Sensors",
    classLevel: "Class 4",
    level: "Beginner",
    duration: "6 hours",
    lessonsCount: 10,
    language: "English",
    pricing: "Free",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70",
    whatYouWillLearn: ["Wire common sensors", "Read analog and digital outputs", "Debug sensor readings", "Build a sensor testing kit"],
    modules: [],
    requiredComponents: [{ name: "37-in-1 Sensor Kit", quantity: 1, productUrl: `${storeSearch}37+in+1+Sensor+Kit` }],
    projects: ["Sensor Testing Kit"],
    downloadablePdfs: ["Sensor quick reference"],
    relatedProducts: [{ name: "REES52 Ultimate Sensor Kit", quantity: 1, productUrl: "https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html" }],
    faqs: [{ question: "Does it cover code?", answer: "Yes. Each sensor includes a simple test sketch." }]
  },
  {
    title: "AI for Students",
    slug: "ai-for-students",
    shortDescription: "Understand AI concepts and connect them with robotics and electronics projects.",
    description: "A student-friendly AI course focused on concepts, responsible use, and robotics applications.",
    category: "AI",
    classLevel: "Class 12",
    level: "Beginner",
    duration: "5 hours",
    lessonsCount: 8,
    language: "English",
    pricing: "Paid",
    price: 699,
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=70",
    whatYouWillLearn: ["Understand AI basics", "Use prompts responsibly", "Connect AI with sensor data", "Plan AI-assisted projects"],
    modules: [],
    requiredComponents: [{ name: "Student AI Workbook", quantity: 1, productUrl: `${storeSearch}AI+Kit` }],
    projects: ["AI project planner"],
    downloadablePdfs: ["AI glossary for students"],
    relatedProducts: [{ name: "STEM Learning Kits", quantity: 1, productUrl: `${storeSearch}STEM+Kit` }],
    faqs: [{ question: "Does it need coding?", answer: "The first modules are concept-first and beginner friendly." }]
  }
];

export const lmsProjects: LmsProject[] = [
  {
    title: "Line Follower Robot",
    slug: "line-follower-robot",
    shortDescription: "Build a robot that follows a black line using IR sensors and motor logic.",
    description: "A classic robotics project for learning sensor feedback, motor direction, and calibration.",
    category: "Robotics Projects",
    classLevel: "Class 5",
    level: "Beginner",
    estimatedTime: "3 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=900&auto=format&fit=crop&q=70",
    sourceCode: "if (leftSensor == LOW && rightSensor == HIGH) {\n  turnLeft();\n} else if (leftSensor == HIGH && rightSensor == LOW) {\n  turnRight();\n} else {\n  moveForward();\n}",
    steps: ["Assemble chassis", "Mount IR sensors", "Wire motor driver", "Upload code", "Calibrate sensor height"],
    troubleshooting: ["If the robot spins, swap motor wires.", "If sensors fail, check line contrast and sensor height."],
    components: [
      { name: "Robot Car Chassis", quantity: 1, productUrl: `${storeSearch}Robot+Car+Chassis` },
      { name: "IR Sensor Module", quantity: 2, productUrl: `${storeSearch}IR+Sensor` },
      { name: "L298N Motor Driver", quantity: 1, productUrl: `${storeSearch}L298N` }
    ]
  },
  {
    title: "Obstacle Avoiding Robot",
    slug: "obstacle-avoiding-robot",
    shortDescription: "Use ultrasonic sensing to detect obstacles and steer away automatically.",
    description: "Combine a chassis, motor driver, ultrasonic sensor, and Arduino logic into a moving robot.",
    category: "Robotics Projects",
    classLevel: "Class 6",
    level: "Beginner",
    estimatedTime: "4 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=900&auto=format&fit=crop&q=70",
    sourceCode: "if (distance < 20) {\n  stopMotors();\n  turnRight();\n} else {\n  moveForward();\n}",
    steps: ["Build chassis", "Mount ultrasonic sensor", "Wire motors", "Upload movement code", "Test obstacle response"],
    troubleshooting: ["Use a stable battery pack.", "Keep sensor wires short and firm."],
    components: [
      { name: "Ultrasonic Sensor", quantity: 1, productUrl: `${storeSearch}HC-SR04` },
      { name: "Arduino Uno R3", quantity: 1, productUrl: `${storeSearch}Arduino+Uno` }
    ]
  },
  {
    title: "IoT Weather Station",
    slug: "iot-weather-station",
    shortDescription: "Read temperature and humidity and prepare the data for an IoT dashboard.",
    description: "A practical ESP32 project for collecting environmental data and displaying it online.",
    category: "IoT Projects",
    classLevel: "Class 8",
    level: "Intermediate",
    estimatedTime: "5 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=70",
    sourceCode: "float temperature = dht.readTemperature();\nfloat humidity = dht.readHumidity();\nSerial.println(temperature);",
    steps: ["Wire DHT sensor", "Configure ESP32 Wi-Fi", "Read sensor data", "Send readings to dashboard"],
    troubleshooting: ["Use correct DHT library.", "Check Wi-Fi SSID and password."],
    components: [{ name: "ESP32 Board", quantity: 1, productUrl: `${storeSearch}ESP32` }]
  },
  {
    title: "Smart Dustbin",
    slug: "smart-dustbin",
    shortDescription: "Create an automatic lid system using ultrasonic sensing and servo movement.",
    description: "A school-friendly automation project that combines distance sensing and servo control.",
    category: "Arduino Projects",
    classLevel: "Class 3",
    level: "Beginner",
    estimatedTime: "3 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=70",
    sourceCode: "if (distance < 15) {\n  lidServo.write(90);\n} else {\n  lidServo.write(0);\n}",
    steps: ["Mount sensor", "Attach servo to lid", "Wire Arduino", "Upload code", "Adjust distance threshold"],
    troubleshooting: ["Use external power for servo if it jitters."],
    components: [{ name: "Servo Motor", quantity: 1, productUrl: `${storeSearch}Servo+Motor` }]
  },
  {
    title: "Home Automation using ESP32",
    slug: "home-automation-using-esp32",
    shortDescription: "Control devices through ESP32 relay logic and safe automation concepts.",
    description: "A guided project for low-voltage automation demonstrations.",
    category: "ESP32 Projects",
    classLevel: "Class 9",
    level: "Intermediate",
    estimatedTime: "4 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=900&auto=format&fit=crop&q=70",
    sourceCode: "digitalWrite(relayPin, command == \"ON\" ? HIGH : LOW);",
    steps: ["Wire relay module", "Configure ESP32", "Create control logic", "Test with low-voltage load"],
    troubleshooting: ["Do not connect mains power without qualified supervision."],
    components: [{ name: "Relay Module", quantity: 1, productUrl: `${storeSearch}Relay+Module` }]
  },
  {
    title: "Mini Drone Assembly",
    slug: "mini-drone-assembly",
    shortDescription: "Understand frame, motors, controller, and assembly sequence for a mini drone.",
    description: "A safe introduction to drone parts and assembly planning.",
    category: "Drone Projects",
    classLevel: "Class 10",
    level: "Intermediate",
    estimatedTime: "6 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=900&auto=format&fit=crop&q=70",
    sourceCode: "// Flight controllers use dedicated firmware. Follow the controller documentation.",
    steps: ["Identify frame parts", "Mount motors", "Plan ESC wiring", "Install flight controller", "Run safety checks"],
    troubleshooting: ["Remove propellers during bench tests.", "Check motor rotation before flight."],
    components: [{ name: "F450 Drone Kit", quantity: 1, productUrl: `${storeSearch}F450+Drone` }]
  },
  {
    title: "3D Printed Toy Model",
    slug: "3d-printed-toy-model",
    shortDescription: "Prepare, slice, and print a simple toy model for a classroom activity.",
    description: "A hands-on project for 3D printing basics.",
    category: "3D Printing Projects",
    classLevel: "Class 7",
    level: "Beginner",
    estimatedTime: "2 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1611117775350-ac3950990985?w=900&auto=format&fit=crop&q=70",
    sourceCode: "No source code required.",
    steps: ["Choose model", "Slice file", "Set layer height", "Print", "Inspect quality"],
    troubleshooting: ["Level the bed if first layer fails.", "Reduce speed for small models."],
    components: [{ name: "PLA Filament", quantity: 1, productUrl: `${storeSearch}PLA+Filament` }]
  },
  {
    title: "Sensor Testing Kit",
    slug: "sensor-testing-kit",
    shortDescription: "Create a repeatable test bench for common Arduino sensors.",
    description: "A practical ATL lab project for testing and documenting sensor modules.",
    category: "ATL Lab Projects",
    classLevel: "Class 4",
    level: "Beginner",
    estimatedTime: "4 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70",
    sourceCode: "Serial.println(sensorValue);",
    steps: ["Prepare breadboard", "Test sensor one by one", "Record output values", "Create lab notes"],
    troubleshooting: ["Check VCC/GND polarity.", "Confirm analog vs digital pin usage."],
    components: [{ name: "37-in-1 Sensor Kit", quantity: 1, productUrl: `${storeSearch}37+in+1+Sensor+Kit` }]
  }
];

export const lmsEbooks: LmsEbook[] = [
  {
    title: "Arduino Starter Guide",
    slug: "arduino-starter-guide",
    description: "Board overview, wiring safety, first sketches, and beginner lab worksheets.",
    category: "Arduino Guides",
    pages: 42,
    level: "Beginner",
    coverUrl: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=700&auto=format&fit=crop&q=70",
    fileUrl: pdfUrl,
    isFree: true
  },
  {
    title: "Robotics Chassis Manual",
    slug: "robotics-chassis-manual",
    description: "Assembly notes for wheeled robots, motor driver wiring, and chassis debugging.",
    category: "Robotics Manuals",
    pages: 58,
    level: "Beginner",
    coverUrl: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=700&auto=format&fit=crop&q=70",
    fileUrl: pdfUrl,
    isFree: true
  },
  {
    title: "Sensor Module Quick Reference",
    slug: "sensor-module-quick-reference",
    description: "Pinouts, sample readings, and test sketches for common modules.",
    category: "Sensor Guides",
    pages: 76,
    level: "Beginner",
    coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&auto=format&fit=crop&q=70",
    fileUrl: pdfUrl,
    isFree: false
  },
  {
    title: "ESP32 IoT Notes",
    slug: "esp32-iot-notes",
    description: "Wi-Fi setup, sensor publishing, automation notes, and IoT project worksheets.",
    category: "IoT Notes",
    pages: 64,
    level: "Intermediate",
    coverUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&auto=format&fit=crop&q=70",
    fileUrl: pdfUrl,
    isFree: false
  },
  {
    title: "ATL Lab Project Manual",
    slug: "atl-lab-project-manual",
    description: "Structured project sheets for school innovation labs.",
    category: "ATL Lab Manuals",
    pages: 90,
    level: "Beginner",
    coverUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=70",
    fileUrl: pdfUrl,
    isFree: true
  },
  {
    title: "3D Printing Classroom Guide",
    slug: "3d-printing-classroom-guide",
    description: "Model preparation, print settings, filament basics, and failure fixes.",
    category: "3D Printing Guides",
    pages: 48,
    level: "Beginner",
    coverUrl: "https://images.unsplash.com/photo-1611117775350-ac3950990985?w=700&auto=format&fit=crop&q=70",
    fileUrl: pdfUrl,
    isFree: true
  },
  {
    title: "AI and Robotics Notes",
    slug: "ai-and-robotics-notes",
    description: "Student-friendly AI concepts connected to robotics and electronics examples.",
    category: "AI / ML Notes",
    pages: 52,
    level: "Beginner",
    coverUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700&auto=format&fit=crop&q=70",
    fileUrl: pdfUrl,
    isFree: false
  }
];

export const lmsQuizzes: LmsQuiz[] = [
  {
    title: "Arduino Basics Quiz",
    courseSlug: "arduino-beginner-course",
    moduleTitle: "Module 1: Introduction to Arduino",
    passingScore: 60,
    questions: [
      {
        question: "Which function runs once when an Arduino sketch starts?",
        options: ["loop()", "setup()", "start()", "pinMode()"],
        correctOption: "setup()",
        explanation: "setup() runs once and is used for initialization."
      },
      {
        question: "Which pin mode is used to control an LED?",
        options: ["INPUT", "OUTPUT", "SERIAL", "ANALOG"],
        correctOption: "OUTPUT",
        explanation: "An LED is controlled from a digital output pin."
      }
    ]
  }
];

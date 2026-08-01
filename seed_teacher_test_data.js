import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Teacher Test Credentials
const TEACHER_USER = {
  id: 'usr-teacher-test-001',
  name: 'Dr. Alex Vance (Test Teacher)',
  email: 'teacher.test@rees52.tech',
  password_hash: bcrypt.hashSync('TeacherPass123!', 10),
  role: 'Teacher',
  enrolled_courses: [],
  enrolled_videos: [],
  purchased_ebooks: [],
  progress: {},
  badges: [],
  streak: { current: 5, longest: 14, lastActivityDate: new Date().toISOString() },
  certificates: [],
  recently_viewed: []
};

// 2. Seed User into src/lib/db-store.json
function seedUser() {
  const dbStorePath = path.join(__dirname, 'src', 'lib', 'db-store.json');
  const store = JSON.parse(fs.readFileSync(dbStorePath, 'utf8'));
  store.users = store.users || [];
  
  const existingIdx = store.users.findIndex(u => u.email === TEACHER_USER.email);
  if (existingIdx >= 0) {
    store.users[existingIdx] = TEACHER_USER;
  } else {
    store.users.push(TEACHER_USER);
  }
  
  fs.writeFileSync(dbStorePath, JSON.stringify(store, null, 2), 'utf8');
  console.log('✅ Seeded Teacher user into src/lib/db-store.json');
}

// 3. Seed Course, Project, and E-book into scratch/local-lms-content.json
function seedLocalLmsContent() {
  const scratchDir = path.join(__dirname, 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const contentFilePath = path.join(scratchDir, 'local-lms-content.json');
  let state = {
    courses: {},
    deletedCourseIds: [],
    projects: {},
    deletedProjectIds: [],
    ebooks: {},
    deletedEbookIds: []
  };

  if (fs.existsSync(contentFilePath)) {
    try {
      state = JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse existing local-lms-content.json, creating new state');
    }
  }

  // --- TEST COURSE ---
  const courseId = 'course-teacher-test-001';
  const testCourse = {
    id: courseId,
    title: 'Advanced Robotics & Edge AI Masterclass (Test Course)',
    slug: 'advanced-robotics-edge-ai-masterclass',
    shortDescription: 'Master autonomous mobile robotics with ESP32-CAM, OpenCV edge vision, and PID control.',
    description: 'A complete hands-on course covering motor driver interfacing, PID control, ultrasonic distance mapping, line tracking algorithms, and real-time WiFi video streaming for autonomous ground robots.',
    category: 'Robotics & Smart Cars',
    classLevel: 'Class 8',
    level: 'Advanced',
    duration: '6 Hours',
    lessonsCount: 4,
    language: 'English',
    pricing: 'Free',
    price: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Understand H-Bridge motor drivers (L298N & TB6612FNG)',
      'Implement closed-loop PID control for motor speed & direction',
      'Process edge vision frames on ESP32-CAM',
      'Build an autonomous obstacle avoidance and line-following rover'
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Motor Interfacing & Speed Control',
        lessons: [
          {
            id: 'les-1',
            title: 'H-Bridge Principles & L298N Wiring',
            duration: '20 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/watch?v=77_Ua1A88Eo',
            isPreview: true,
            summary: 'Learn how H-bridges toggle motor polarity to drive DC motors forward and reverse.'
          },
          {
            id: 'les-2',
            title: 'PWM Speed Regulation & Differential Steering',
            duration: '25 min',
            type: 'article',
            isPreview: false,
            summary: 'Pulse Width Modulation (PWM) duty cycles for smooth speed control and precise turning.'
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: Autonomous Navigation Algorithms',
        lessons: [
          {
            id: 'les-3',
            title: 'Ultrasonic Distance Sensor Mapping',
            duration: '30 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/watch?v=r9IVAW675gs',
            isPreview: false,
            summary: 'Calculate object distance using HC-SR04 pulse timing and trigger collision avoidance routines.'
          },
          {
            id: 'les-4',
            title: 'PID Closed-Loop Line Following',
            duration: '35 min',
            type: 'quiz',
            isPreview: false,
            summary: 'Proportional-Integral-Derivative tuning for ultra-smooth line tracking along sharp curves.'
          }
        ]
      }
    ],
    requiredComponents: [
      { name: 'REES52 4WD Smart Robot Car Kit', quantity: 1, productUrl: 'https://rees52.com/robotics/456-rees52-4wd-smart-robot-car-kit.html' },
      { name: 'ESP32-CAM Module with FTDI Programmer', quantity: 1, productUrl: 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html' },
      { name: 'L298N Dual H-Bridge Motor Driver', quantity: 1, productUrl: 'https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html' }
    ],
    projects: ['proj-teacher-test-001'],
    downloadablePdfs: [
      { title: 'Robotics PID Tuning Cheatsheet (PDF)', url: '/downloads/arduino-foundations-workbook.pdf' }
    ],
    relatedProducts: [
      { id: 'prod-2', name: 'REES52 4WD Smart Robot Car Kit v2.0', price: '$29.99', imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=60' }
    ],
    faqs: [
      { question: 'What prerequisites are needed for this course?', answer: 'Basic familiarity with C++ or Arduino syntax and basic circuit wiring.' }
    ]
  };

  state.courses[courseId] = { course: testCourse, isPublished: true };

  // --- TEST PROJECT ---
  const projectId = 'proj-teacher-test-001';
  const testProject = {
    id: projectId,
    title: 'Smart IoT Weather Station with ESP32 & OLED (Test Project)',
    slug: 'smart-iot-weather-station-esp32',
    shortDescription: 'Build a real-time weather monitoring station using DHT22, BMP280, and ESP32 with cloud logging.',
    description: 'This project guides learners through building an automated wireless environmental monitoring node. Sensors read temperature, humidity, and barometric pressure, displaying metrics locally on a 0.96-inch OLED screen and pushing live metrics to an IoT dashboard.',
    category: 'IoT & Sensors',
    classLevel: 'Class 7',
    level: 'Intermediate',
    estimatedTime: '3 Hours',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=wJj46imDIgA',
    circuitDiagramUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80',
    sourceCode: `#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n#include <DHT.h>\n\n#define DHTPIN 4\n#define DHTTYPE DHT22\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  Serial.println("ESP32 IoT Weather Node Ready!");\n}\n\nvoid loop() {\n  float t = dht.readTemperature();\n  float h = dht.readHumidity();\n  Serial.printf("Temp: %.1fC | Humidity: %.1f%%\\n", t, h);\n  delay(2000);\n}`,
    steps: [
      'Assemble the DHT22 temperature sensor and BMP280 pressure sensor on the breadboard.',
      'Connect the I2C OLED display to pins GPIO 21 (SDA) and GPIO 22 (SCL) on the ESP32.',
      'Flash the provided C++ code onto the ESP32 using Arduino IDE.',
      'Verify live sensor data readings on both the OLED screen and serial monitor.'
    ],
    troubleshooting: [
      'If OLED displays a blank screen, verify I2C address 0x3C in code.',
      'If DHT22 reads nan, double-check the 10k pull-up resistor between VCC and Data pin.'
    ],
    products: [
      { name: 'ESP32 Development Board NodeMCU', quantity: 1, productUrl: 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html' },
      { name: 'DHT22 Digital Temperature & Humidity Sensor', quantity: 1, productUrl: 'https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html' },
      { name: '0.96 Inch I2C OLED Screen (128x64)', quantity: 1, productUrl: 'https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html' }
    ]
  };

  state.projects[projectId] = { project: testProject, isPublished: true };

  // --- TEST EBOOK ---
  const ebookId = 'ebk-teacher-test-001';
  const testEbook = {
    id: ebookId,
    title: 'Complete Handbook of Microcontroller Circuitry 2026 (Test Ebook)',
    slug: 'handbook-of-microcontroller-circuitry-2026',
    description: 'A comprehensive reference manual covering schematic design, sensor pinouts, power management, and PCB layout basics for young engineers.',
    category: 'Arduino & Microcontrollers',
    level: 'All Levels',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    fileUrl: '/downloads/arduino-foundations-workbook.pdf',
    pages: 120,
    isFree: true
  };

  state.ebooks[ebookId] = { ebook: testEbook, isPublished: true };

  fs.writeFileSync(contentFilePath, JSON.stringify(state, null, 2), 'utf8');
  console.log('✅ Seeded Teacher Course, Project, and Ebook into scratch/local-lms-content.json');
}

// 4. Seed Quiz Link into scratch/local-quiz-links.json
function seedLocalQuizLinks() {
  const scratchDir = path.join(__dirname, 'scratch');
  const quizFilePath = path.join(scratchDir, 'local-quiz-links.json');
  let quizLinks = [];

  if (fs.existsSync(quizFilePath)) {
    try {
      quizLinks = JSON.parse(fs.readFileSync(quizFilePath, 'utf8'));
    } catch (e) {}
  }

  const testQuizLink = {
    id: 'quiz-teacher-test-001',
    topic: 'Microcontrollers & Sensor Electronics Assessment (Test Quiz)',
    description: 'Test your knowledge on GPIO pins, PWM signals, I2C bus protocols, and analog-to-digital converters.',
    quizUrl: 'https://quiz.rees52.tech/microcontrollers-readiness'
  };

  const existingIdx = quizLinks.findIndex(q => q.id === testQuizLink.id);
  if (existingIdx >= 0) {
    quizLinks[existingIdx] = testQuizLink;
  } else {
    quizLinks.unshift(testQuizLink);
  }

  fs.writeFileSync(quizFilePath, JSON.stringify(quizLinks, null, 2), 'utf8');
  console.log('✅ Seeded Teacher Quiz Link into scratch/local-quiz-links.json');
}

function run() {
  seedUser();
  seedLocalLmsContent();
  seedLocalQuizLinks();
  console.log('\n🎉 Teacher Test Credentials and Uploaded Content Seeded Successfully!');
  console.log('----------------------------------------------------');
  console.log(`Email:    ${TEACHER_USER.email}`);
  console.log(`Password: TeacherPass123!`);
  console.log(`Role:     ${TEACHER_USER.role}`);
  console.log('Uploaded Content: Course, Project, E-book, Quiz Link');
  console.log('----------------------------------------------------');
}

run();

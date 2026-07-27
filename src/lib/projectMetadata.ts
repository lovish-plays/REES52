export interface ProjectComponent {
  name: string;
  url: string;
}

export interface ProjectDownload {
  label: string;
  url: string;
}

export interface ProjectMetadata {
  id: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  durationMins: number;
  popularity: number;
  overview: string;
  learningObjectives: string[];
  components: ProjectComponent[];
  downloads: ProjectDownload[];
  relatedIds: string[];
}

const arduinoDetails: Omit<ProjectMetadata, "id"> = {
  difficulty: "Beginner",
  duration: "2.5 Hours",
  durationMins: 150,
  popularity: 0,
  overview:
    "Build a protected LED circuit, change timing in a working Arduino sketch, control a servo and record the result with a classroom-ready workbook.",
  learningObjectives: [
    "Identify Arduino power, ground and digital output connections",
    "Use a current-limiting resistor with an LED",
    "Change timing values and explain the observed pattern",
    "Control two safe servo positions",
  ],
  components: [
    { name: "Arduino Uno compatible board", url: "https://rees52.com/search?q=Arduino+Uno" },
    { name: "LED and resistor", url: "https://rees52.com/search?q=LED+resistor" },
    { name: "SG90 servo motor", url: "https://rees52.com/search?q=SG90+servo" },
  ],
  downloads: [
    { label: "Arduino Foundations Workbook", url: "/downloads/arduino-foundations-workbook.pdf" },
  ],
  relatedIds: [],
};

const roboticsDetails: Omit<ProjectMetadata, "id"> = {
  difficulty: "Beginner",
  duration: "3.5 Hours",
  durationMins: 210,
  popularity: 0,
  overview:
    "Calibrate two IR sensors, verify motor direction safely and tune a complete line-following robot on a broad closed track.",
  learningObjectives: [
    "Compare reflected infrared light over dark and light surfaces",
    "Calibrate two line-sensor thresholds",
    "Use an L298N driver for motor current and direction",
    "Tune four movement decisions one value at a time",
  ],
  components: [
    { name: "Arduino Uno compatible board", url: "https://rees52.com/search?q=Arduino+Uno" },
    { name: "IR line sensors", url: "https://rees52.com/search?q=IR+line+sensor" },
    { name: "L298N motor driver", url: "https://rees52.com/search?q=L298N" },
    { name: "Robot car chassis", url: "https://rees52.com/search?q=robot+car+kit" },
  ],
  downloads: [
    { label: "Mobile Robotics Build Guide", url: "/downloads/mobile-robotics-build-guide.pdf" },
  ],
  relatedIds: [],
};

const esp32Details: Omit<ProjectMetadata, "id"> = {
  difficulty: "Intermediate",
  duration: "3 Hours",
  durationMins: 180,
  popularity: 0,
  overview:
    "Configure an ESP32, read a DHT11 using 3.3 V logic and serve a short response to a browser on the same trusted local network.",
  learningObjectives: [
    "Configure ESP32 support in the Arduino IDE",
    "Wire and read a DHT11 at safe logic voltage",
    "Recognize invalid sensor readings",
    "Keep Wi-Fi credentials out of shared code and screenshots",
  ],
  components: [
    { name: "ESP32 development board", url: "https://rees52.com/search?q=ESP32+development+board" },
    { name: "DHT11 sensor", url: "https://rees52.com/search?q=DHT11" },
    { name: "Breadboard and jumper wires", url: "https://rees52.com/search?q=breadboard+jumper+wires" },
  ],
  downloads: [
    { label: "ESP32 IoT Lab Workbook", url: "/downloads/esp32-iot-lab-workbook.pdf" },
  ],
  relatedIds: [],
};

const PROJECT_DETAILS_STORE: Record<string, Omit<ProjectMetadata, "id">> = {
  "44444444-4444-4444-4444-444444444441": arduinoDetails,
  "33333333-3333-3333-3333-333333333331": arduinoDetails,
  "44444444-4444-4444-4444-444444444442": roboticsDetails,
  "33333333-3333-3333-3333-333333333332": roboticsDetails,
  "44444444-4444-4444-4444-444444444443": esp32Details,
  "33333333-3333-3333-3333-333333333333": esp32Details,
};

export function getItemMetadata(item: {
  id: string;
  title: string;
  type: string;
}): ProjectMetadata {
  const details = PROJECT_DETAILS_STORE[item.id];
  if (details) return { id: item.id, ...details };

  return {
    id: item.id,
    difficulty: "Beginner",
    duration: "Self-paced",
    durationMins: 0,
    popularity: 0,
    overview:
      "Use this REES52 Academy resource with the published instructions, verify every connection before applying power and record the result in your own words.",
    learningObjectives: [
      "Follow the published build sequence",
      "Verify power, ground and signal connections",
      "Test one change at a time",
      "Record evidence and a debugging note",
    ],
    components: [],
    downloads: [],
    relatedIds: [],
  };
}

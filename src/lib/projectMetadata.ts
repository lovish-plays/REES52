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
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  durationMins: number;
  popularity: number;
  overview: string;
  learningObjectives: string[];
  components: ProjectComponent[];
  downloads: ProjectDownload[];
  relatedIds: string[];
}

const PROJECT_DETAILS_STORE: Record<string, Partial<ProjectMetadata>> = {
  // Video 1
  '44444444-4444-4444-4444-444444444441': {
    difficulty: 'Beginner',
    duration: '30 Mins',
    durationMins: 30,
    popularity: 98,
    overview: 'Learn how to set up the Arduino IDE, connect your Arduino Uno R3 board, and upload your very first program (Blink) to control the onboard LED.',
    learningObjectives: [
      'Install and configure the Arduino IDE software',
      'Understand basic Arduino sketch structure (setup and loop)',
      'Identify pinout configurations on the Arduino Uno board',
      'Code and upload a simple digital write pulse program'
    ],
    components: [
      { name: 'Arduino Uno R3', url: 'https://rees52.com/search?s=Arduino+Uno+R3' },
      { name: 'USB Type B Cable', url: 'https://rees52.com/search?s=USB+Type+B+Cable' },
      { name: 'LED Pack (Red/Green/Yellow)', url: 'https://rees52.com/search?s=LED' },
      { name: '220 Ohm Resistor', url: 'https://rees52.com/search?s=Resistor+220' }
    ],
    downloads: [
      { label: 'Blink_Sketch.ino', url: 'https://raw.githubusercontent.com/arduino/Arduino/master/build/shared/examples/01.Basics/Blink/Blink.ino' },
      { label: 'Arduino_Uno_R3_Pinout.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    relatedIds: ['44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333331']
  },
  // Video 2
  '44444444-4444-4444-4444-444444444442': {
    difficulty: 'Intermediate',
    duration: '2.5 Hours',
    durationMins: 150,
    popularity: 95,
    overview: 'A complete step-by-step walkthrough of assembling the mechanical chassis of a 4-wheel drive robot car, wiring the L298N motor driver, and writing motor control functions.',
    learningObjectives: [
      'Assemble the 4WD mechanical chassis, motors, and speed encoders',
      'Wire the L298N dual H-bridge motor driver to the microcontroller',
      'Program motor speed using Pulse Width Modulation (PWM) signals',
      'Implement forward, backward, left, right, and stop steering routines'
    ],
    components: [
      { name: '4WD Robot Car Chassis', url: 'https://rees52.com/search?s=Robot+Car+Chassis' },
      { name: 'L298N Motor Driver', url: 'https://rees52.com/search?s=L298N' },
      { name: 'Gear Motors (BO Motors)', url: 'https://rees52.com/search?s=Gear+Motor' },
      { name: 'Arduino Uno R3', url: 'https://rees52.com/search?s=Arduino+Uno+R3' },
      { name: '18650 Battery Holder', url: 'https://rees52.com/search?s=18650+Holder' },
      { name: 'Jumper Wires (M-to-M / F-to-M)', url: 'https://rees52.com/search?s=Jumper+Wires' }
    ],
    downloads: [
      { label: '4WD_MotorControl.ino', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { label: 'Wiring_Schematic_L298N.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { label: 'Chassis_Assembly_Manual.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    relatedIds: ['33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444441']
  },
  // Video 3
  '44444444-4444-4444-4444-444444444443': {
    difficulty: 'Intermediate',
    duration: '1.5 Hours',
    durationMins: 90,
    popularity: 92,
    overview: 'Master digital communication protocols by interfacing the DHT11 sensor with your Arduino, reading temperature and humidity values, and displaying them on the Serial Monitor.',
    learningObjectives: [
      'Wire the DHT11 temperature and humidity sensor properly with a pull-up resistor',
      'Install and utilize external sensor libraries inside the Arduino IDE',
      'Program threshold alerts using conditional coding logic',
      'Read, parse, and troubleshoot digital serial datastreams'
    ],
    components: [
      { name: 'DHT11 Temperature Sensor', url: 'https://rees52.com/search?s=DHT11' },
      { name: 'Arduino Uno R3', url: 'https://rees52.com/search?s=Arduino+Uno+R3' },
      { name: 'Solderless Breadboard', url: 'https://rees52.com/search?s=Breadboard' },
      { name: '10k Ohm Resistor', url: 'https://rees52.com/search?s=Resistor+10k' },
      { name: 'Jumper Wires Pack', url: 'https://rees52.com/search?s=Jumper+Wires' }
    ],
    downloads: [
      { label: 'DHT11_Reader.ino', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { label: 'DHT11_Datasheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    relatedIds: ['33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444441']
  },

  // Ebook 1
  '33333333-3333-3333-3333-333333333331': {
    difficulty: 'Beginner',
    duration: '1.5 Hours',
    durationMins: 90,
    popularity: 99,
    overview: 'A comprehensive electronic guide to learning the basics of Arduino prototyping, reading digital inputs, writing to digital outputs, and using analog sensors.',
    learningObjectives: [
      'Learn basic electrical circuit theory (Ohm\'s Law)',
      'Build series and parallel LED circuits safely on breadboards',
      'Write clean C++ programs for Arduino microcontrollers',
      'Interface analog inputs like Potentiometers and Photoresistors'
    ],
    components: [
      { name: 'REES52 Uno R3 Starter Kit', url: 'https://rees52.com/search?s=Uno+R3+Starter+Kit' }
    ],
    downloads: [
      { label: 'Arduino_Starter_Codebook.zip', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { label: 'Schematics_Collection.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    relatedIds: ['44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333']
  },
  // Ebook 2
  '33333333-3333-3333-3333-333333333332': {
    difficulty: 'Advanced',
    duration: '4 Hours',
    durationMins: 240,
    popularity: 94,
    overview: 'The ultimate blueprint guide for building an autonomous obstacle-avoiding smart car using ultrasound scanning and servo-steer navigation.',
    learningObjectives: [
      'Mount an ultrasonic sensor on a SG90 servo motor sweep bracket',
      'Program sweep routines to scan left and right scanning ranges',
      'Develop intelligent pathfinding collision avoidance algorithms',
      'Calibrate and interface infrared TCRT5000 line tracking sensors'
    ],
    components: [
      { name: 'REES52 4WD Smart Robot Car Kit v2.0', url: 'https://rees52.com/search?s=4WD+Robot+Car+Kit' }
    ],
    downloads: [
      { label: 'Autonomous_RobotCar.ino', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { label: 'RobotCar_UserGuide.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    relatedIds: ['44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333331']
  },
  // Ebook 3
  '33333333-3333-3333-3333-333333333333': {
    difficulty: 'Advanced',
    duration: '5 Hours',
    durationMins: 300,
    popularity: 96,
    overview: 'Explore 37 different electronic sensors, including motion, sound, light, touch, gas, and pressure sensors, with detailed wiring diagrams and test code for every single sensor.',
    learningObjectives: [
      'Master analog-to-digital sensor conversion (ADC)',
      'Learn I2C, SPI, and One-Wire bus communication protocols',
      'Interface advanced sensors like MPU6050 Accelerometer/Gyroscope',
      'Log sensor telemetry and build data plotting dashboards'
    ],
    components: [
      { name: 'REES52 Ultimate Sensor Kit (37 in 1)', url: 'https://rees52.com/search?s=Ultimate+Sensor+Kit+37' }
    ],
    downloads: [
      { label: 'All_37_Sensors_Code.zip', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { label: 'Sensors_Wiring_Booklet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    relatedIds: ['44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333331']
  }
};

export function getItemMetadata(item: { id: string; title: string; type: string }): ProjectMetadata {
  const details = PROJECT_DETAILS_STORE[item.id];
  
  if (details) {
    return {
      id: item.id,
      difficulty: details.difficulty ?? 'Beginner',
      duration: details.duration ?? '1 Hour',
      durationMins: details.durationMins ?? 60,
      popularity: details.popularity ?? 50,
      overview: details.overview ?? 'No overview available.',
      learningObjectives: details.learningObjectives ?? ['Understand the basic circuit layout', 'Write simple code commands'],
      components: details.components ?? [],
      downloads: details.downloads ?? [],
      relatedIds: details.relatedIds ?? []
    };
  }

  // Fallback for dynamically added content via admin
  const titleLower = item.title.toLowerCase();
  
  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
  if (titleLower.includes('autonomous') || titleLower.includes('drone') || titleLower.includes('advanced') || titleLower.includes('rtos')) {
    difficulty = 'Advanced';
  } else if (titleLower.includes('car') || titleLower.includes('sensor') || titleLower.includes('motor') || titleLower.includes('interfacing')) {
    difficulty = 'Intermediate';
  }

  let durationMins = 60;
  let duration = '1 Hour';
  if (difficulty === 'Advanced') {
    durationMins = 240;
    duration = '4 Hours';
  } else if (difficulty === 'Intermediate') {
    durationMins = 120;
    duration = '2 Hours';
  } else {
    durationMins = 45;
    duration = '45 Mins';
  }

  const overview = `Master the fundamentals of ${item.title} through a hands-on project path designed to build hardware prototyping and programming expertise.`;
  
  const learningObjectives = [
    `Understand electrical wiring and pin layouts for ${item.title}`,
    `Write, compile, and upload control software routines`,
    `Implement threshold logging and calibration parameters`,
    `Troubleshoot hardware integration issues step-by-step`
  ];

  const components: ProjectComponent[] = [
    { name: 'Arduino Uno R3', url: 'https://rees52.com/search?s=Arduino+Uno+R3' },
    { name: 'Jumper Wires Pack', url: 'https://rees52.com/search?s=Jumper+Wires' },
    { name: 'Breadboard', url: 'https://rees52.com/search?s=Breadboard' }
  ];

  // Try to find a specific component match based on the title
  if (titleLower.includes('dht') || titleLower.includes('temperature') || titleLower.includes('moisture')) {
    components.push({ name: 'DHT11 Temp & Humidity Sensor', url: 'https://rees52.com/search?s=DHT11' });
  } else if (titleLower.includes('robot') || titleLower.includes('car')) {
    components.push({ name: 'L298N Motor Driver', url: 'https://rees52.com/search?s=L298N' });
    components.push({ name: 'DC BO Motor & Wheel', url: 'https://rees52.com/search?s=Gear+Motor' });
  } else if (titleLower.includes('drone') || titleLower.includes('quadcopter')) {
    components.push({ name: 'Quadcopter Frame F450', url: 'https://rees52.com/search?s=F450' });
    components.push({ name: '2212 1000KV Brushless Motor', url: 'https://rees52.com/search?s=2212' });
  }

  const downloads: ProjectDownload[] = [
    { label: 'Sample_Sketch.ino', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { label: 'Connection_Diagram.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
  ];

  return {
    id: item.id,
    difficulty,
    duration,
    durationMins,
    popularity: 60,
    overview,
    learningObjectives,
    components,
    downloads,
    relatedIds: []
  };
}

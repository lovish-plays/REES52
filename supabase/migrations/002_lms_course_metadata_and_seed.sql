-- REES52 Academy LMS metadata and sample content.
-- Run after 001_lms_schema.sql.

alter table public.lessons
add column if not exists duration text;

create table if not exists public.course_outcomes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  outcome text not null,
  position int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.course_components (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  component_name text not null,
  quantity int default 1,
  product_url text,
  price numeric,
  component_role text default 'required',
  position int default 0,
  created_at timestamp with time zone default now(),
  constraint course_components_role_check check (component_role in ('required', 'related'))
);

create table if not exists public.course_projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  project_title text not null,
  position int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.course_pdfs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  file_url text,
  position int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.course_faqs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  question text not null,
  answer text not null,
  position int default 0,
  created_at timestamp with time zone default now()
);

create unique index if not exists course_modules_course_title_idx
on public.course_modules(course_id, title);

create unique index if not exists lessons_course_slug_idx
on public.lessons(course_id, slug);

create unique index if not exists project_components_project_component_idx
on public.project_components(project_id, component_name);

create unique index if not exists quizzes_course_title_idx
on public.quizzes(course_id, title);

create unique index if not exists quiz_questions_quiz_position_idx
on public.quiz_questions(quiz_id, position);

create unique index if not exists course_outcomes_course_position_idx
on public.course_outcomes(course_id, position);

create unique index if not exists course_components_course_role_position_idx
on public.course_components(course_id, component_role, position);

create unique index if not exists course_projects_course_position_idx
on public.course_projects(course_id, position);

create unique index if not exists course_pdfs_course_position_idx
on public.course_pdfs(course_id, position);

create unique index if not exists course_faqs_course_position_idx
on public.course_faqs(course_id, position);

alter table public.course_outcomes enable row level security;
alter table public.course_components enable row level security;
alter table public.course_projects enable row level security;
alter table public.course_pdfs enable row level security;
alter table public.course_faqs enable row level security;

drop policy if exists "Published course outcomes can be read publicly" on public.course_outcomes;
create policy "Published course outcomes can be read publicly"
on public.course_outcomes for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_outcomes.course_id
      and courses.is_published = true
  )
);

drop policy if exists "Admins can manage course outcomes" on public.course_outcomes;
create policy "Admins can manage course outcomes"
on public.course_outcomes for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

drop policy if exists "Published course components can be read publicly" on public.course_components;
create policy "Published course components can be read publicly"
on public.course_components for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_components.course_id
      and courses.is_published = true
  )
);

drop policy if exists "Admins can manage course components" on public.course_components;
create policy "Admins can manage course components"
on public.course_components for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

drop policy if exists "Published course projects can be read publicly" on public.course_projects;
create policy "Published course projects can be read publicly"
on public.course_projects for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_projects.course_id
      and courses.is_published = true
  )
);

drop policy if exists "Admins can manage course projects" on public.course_projects;
create policy "Admins can manage course projects"
on public.course_projects for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

drop policy if exists "Published course PDFs can be read publicly" on public.course_pdfs;
create policy "Published course PDFs can be read publicly"
on public.course_pdfs for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_pdfs.course_id
      and courses.is_published = true
  )
);

drop policy if exists "Admins can manage course PDFs" on public.course_pdfs;
create policy "Admins can manage course PDFs"
on public.course_pdfs for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

drop policy if exists "Published course FAQs can be read publicly" on public.course_faqs;
create policy "Published course FAQs can be read publicly"
on public.course_faqs for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_faqs.course_id
      and courses.is_published = true
  )
);

drop policy if exists "Admins can manage course FAQs" on public.course_faqs;
create policy "Admins can manage course FAQs"
on public.course_faqs for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

insert into public.courses (
  title,
  slug,
  short_description,
  description,
  category,
  level,
  duration,
  thumbnail_url,
  is_free,
  price,
  is_published
) values
(
  'Arduino Beginner Course',
  'arduino-beginner-course',
  'Start electronics with Arduino boards, outputs, sensors, and one complete distance alert project.',
  'A beginner-friendly course for students and makers who want to learn Arduino through practical circuits, simple code, and real REES52 components.',
  'Arduino',
  'Beginner',
  '6 hours',
  'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=900&auto=format&fit=crop&q=70',
  true,
  0,
  true
),
(
  'ESP32 IoT Course',
  'esp32-iot-course',
  'Learn Wi-Fi enabled electronics with sensor data, web dashboards, and automation basics.',
  'A practical IoT course covering ESP32 setup, Wi-Fi, sensor readings, and simple cloud-ready project patterns.',
  'IoT',
  'Intermediate',
  '8 hours',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70',
  false,
  999,
  true
),
(
  'Robotics Starter Course',
  'robotics-starter-course',
  'Build wheeled robots with motors, drivers, sensors, and movement logic.',
  'A project-based introduction to robot chassis assembly, motor control, and obstacle decisions.',
  'Robotics',
  'Beginner',
  '7 hours',
  'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=900&auto=format&fit=crop&q=70',
  true,
  0,
  true
),
(
  'Raspberry Pi Basics',
  'raspberry-pi-basics',
  'Set up Raspberry Pi and use it for Linux, GPIO, camera, and classroom computing.',
  'A gentle Raspberry Pi course for school labs and beginner makers.',
  'Raspberry Pi',
  'Beginner',
  '5 hours',
  'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=900&auto=format&fit=crop&q=70',
  false,
  799,
  true
),
(
  'Drone Technology Basics',
  'drone-technology-basics',
  'Understand frames, motors, ESCs, flight controllers, and safe assembly basics.',
  'A foundation course for drone terminology, component selection, and beginner-safe assembly planning.',
  'Drones',
  'Intermediate',
  '4 hours',
  'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=900&auto=format&fit=crop&q=70',
  false,
  1299,
  true
),
(
  '3D Printing Basics',
  '3d-printing-basics',
  'Learn slicer settings, materials, printer care, and beginner classroom models.',
  'A practical introduction to 3D printing for student labs and maker classrooms.',
  '3D Printing',
  'Beginner',
  '4 hours',
  'https://images.unsplash.com/photo-1611117775350-ac3950990985?w=900&auto=format&fit=crop&q=70',
  true,
  0,
  true
),
(
  'Sensors and Modules Course',
  'sensors-and-modules-course',
  'Test common sensors and modules used in robotics, automation, and ATL labs.',
  'A lab-friendly course for understanding sensor outputs, wiring, and testing methods.',
  'Sensors',
  'Beginner',
  '6 hours',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70',
  true,
  0,
  true
),
(
  'AI for Students',
  'ai-for-students',
  'Understand AI concepts and connect them with robotics and electronics projects.',
  'A student-friendly AI course focused on concepts, responsible use, and robotics applications.',
  'AI',
  'Beginner',
  '5 hours',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=70',
  false,
  699,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  category = excluded.category,
  level = excluded.level,
  duration = excluded.duration,
  thumbnail_url = excluded.thumbnail_url,
  is_free = excluded.is_free,
  price = excluded.price,
  is_published = excluded.is_published,
  updated_at = now();

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_outcomes (course_id, outcome, position)
select c.id, v.outcome, v.position
from c
cross join (
  values
    ('Understand Arduino boards and the Arduino IDE', 1),
    ('Control LEDs, buzzers, and RGB output devices', 2),
    ('Read IR, ultrasonic, and LDR sensors', 3),
    ('Build a smart distance alert system', 4)
) as v(outcome, position)
on conflict (course_id, position) do update set
  outcome = excluded.outcome;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_components (course_id, component_name, quantity, product_url, component_role, position)
select c.id, v.component_name, v.quantity, v.product_url, v.component_role, v.position
from c
cross join (
  values
    ('Arduino Uno R3', 1, 'https://rees52.com/search?s=Arduino+Uno+R3', 'required', 1),
    ('Ultrasonic Sensor HC-SR04', 1, 'https://rees52.com/search?s=HC-SR04', 'required', 2),
    ('LED Pack', 1, 'https://rees52.com/search?s=LED', 'required', 3),
    ('Buzzer', 1, 'https://rees52.com/search?s=Buzzer', 'required', 4),
    ('Jumper Wires', 1, 'https://rees52.com/search?s=Jumper+Wires', 'required', 5),
    ('REES52 Uno R3 Starter Kit', 1, 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html', 'related', 1)
) as v(component_name, quantity, product_url, component_role, position)
on conflict (course_id, component_role, position) do update set
  component_name = excluded.component_name,
  quantity = excluded.quantity,
  product_url = excluded.product_url;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_projects (course_id, project_title, position)
select c.id, v.project_title, v.position
from c
cross join (
  values
    ('Smart Distance Alert System', 1),
    ('Mini Light Alert', 2)
) as v(project_title, position)
on conflict (course_id, position) do update set
  project_title = excluded.project_title;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_pdfs (course_id, title, file_url, position)
select c.id, v.title, v.file_url, v.position
from c
cross join (
  values
    ('Arduino pinout guide', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1),
    ('Starter wiring reference', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 2),
    ('Smart distance alert worksheet', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 3)
) as v(title, file_url, position)
on conflict (course_id, position) do update set
  title = excluded.title,
  file_url = excluded.file_url;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_faqs (course_id, question, answer, position)
select c.id, v.question, v.answer, v.position
from c
cross join (
  values
    ('Do I need prior coding experience?', 'No. The course starts from wiring basics and simple Arduino sketches.', 1),
    ('Can schools use this course?', 'Yes. The modules work well for STEM labs, ATL labs, and classroom demonstrations.', 2)
) as v(question, answer, position)
on conflict (course_id, position) do update set
  question = excluded.question,
  answer = excluded.answer;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
),
m1 as (
  insert into public.course_modules (course_id, title, description, position, is_published)
  select c.id, 'Module 1: Introduction to Arduino', 'Get comfortable with the board, software, and first upload.', 1, true
  from c
  on conflict (course_id, title) do update set
    description = excluded.description,
    position = excluded.position,
    is_published = excluded.is_published
  returning id, course_id
),
m2 as (
  insert into public.course_modules (course_id, title, description, position, is_published)
  select c.id, 'Module 2: Basic Output Devices', 'Control common output devices used in beginner robotics builds.', 2, true
  from c
  on conflict (course_id, title) do update set
    description = excluded.description,
    position = excluded.position,
    is_published = excluded.is_published
  returning id, course_id
),
m3 as (
  insert into public.course_modules (course_id, title, description, position, is_published)
  select c.id, 'Module 3: Sensors', 'Read real-world inputs and convert them into decisions.', 3, true
  from c
  on conflict (course_id, title) do update set
    description = excluded.description,
    position = excluded.position,
    is_published = excluded.is_published
  returning id, course_id
),
m4 as (
  insert into public.course_modules (course_id, title, description, position, is_published)
  select c.id, 'Final Project: Smart Distance Alert System', 'Combine outputs and sensors into one practical project.', 4, true
  from c
  on conflict (course_id, title) do update set
    description = excluded.description,
    position = excluded.position,
    is_published = excluded.is_published
  returning id, course_id
)
insert into public.lessons (
  module_id,
  course_id,
  title,
  slug,
  lesson_type,
  video_url,
  content,
  code,
  pdf_url,
  duration,
  position,
  is_preview,
  is_published
)
select *
from (
  select m1.id, m1.course_id, 'What is Arduino?', 'what-is-arduino', 'video', 'https://www.youtube.com/embed/d8_xXNcGYgo',
    'Arduino is an open hardware platform used to read sensors and control outputs. In this lesson you will understand where Arduino fits inside robotics, IoT, and classroom STEM projects.',
    null::text, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '18 min', 1, true, true
  from m1
  union all
  select m1.id, m1.course_id, 'Arduino Board Overview', 'arduino-board-overview', 'text', null,
    'Identify digital pins, analog pins, power pins, USB input, reset button, and the microcontroller. Use this as your board orientation before wiring circuits.',
    null::text, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '22 min', 2, false, true
  from m1
  union all
  select m1.id, m1.course_id, 'Arduino IDE Setup', 'arduino-ide-setup', 'text', null,
    'Install the Arduino IDE, select the board and port, and upload your first sketch. Keep the serial monitor ready for sensor lessons.',
    'void setup() {' || chr(10) || '  Serial.begin(9600);' || chr(10) || '}' || chr(10) || chr(10) || 'void loop() {' || chr(10) || '  Serial.println(''REES52 Academy ready'');' || chr(10) || '  delay(1000);' || chr(10) || '}',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '25 min', 3, false, true
  from m1
  union all
  select m1.id, m1.course_id, 'Quiz 1', 'quiz-1', 'quiz', null,
    'Check your understanding of Arduino boards, pins, and IDE setup.',
    null::text, null::text, '10 min', 4, false, true
  from m1
  union all
  select m2.id, m2.course_id, 'LED Blinking', 'led-blinking', 'video', null,
    'Wire an LED with a resistor and control it using a digital pin. This is the classic first step into embedded output control.',
    'const int ledPin = 13;' || chr(10) || chr(10) || 'void setup() {' || chr(10) || '  pinMode(ledPin, OUTPUT);' || chr(10) || '}' || chr(10) || chr(10) || 'void loop() {' || chr(10) || '  digitalWrite(ledPin, HIGH);' || chr(10) || '  delay(500);' || chr(10) || '  digitalWrite(ledPin, LOW);' || chr(10) || '  delay(500);' || chr(10) || '}',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '28 min', 1, false, true
  from m2
  union all
  select m2.id, m2.course_id, 'Buzzer Control', 'buzzer-control', 'text', null,
    'Use a buzzer to create alerts. This prepares you for distance alarms, security systems, and sensor feedback projects.',
    'const int buzzer = 8;' || chr(10) || chr(10) || 'void setup() {' || chr(10) || '  pinMode(buzzer, OUTPUT);' || chr(10) || '}' || chr(10) || chr(10) || 'void loop() {' || chr(10) || '  tone(buzzer, 1000);' || chr(10) || '  delay(300);' || chr(10) || '  noTone(buzzer);' || chr(10) || '  delay(700);' || chr(10) || '}',
    null::text, '20 min', 2, false, true
  from m2
  union all
  select m3.id, m3.course_id, 'Ultrasonic Sensor', 'ultrasonic-sensor', 'video', null,
    'Measure distance with an ultrasonic sensor and use the result to trigger an LED or buzzer.',
    'const int trigPin = 9;' || chr(10) || 'const int echoPin = 10;' || chr(10) || chr(10) || 'void setup() {' || chr(10) || '  Serial.begin(9600);' || chr(10) || '  pinMode(trigPin, OUTPUT);' || chr(10) || '  pinMode(echoPin, INPUT);' || chr(10) || '}',
    null::text, '32 min', 1, false, true
  from m3
  union all
  select m4.id, m4.course_id, 'Smart Distance Alert System', 'smart-distance-alert-system', 'project', null,
    'Build a small alert system using an ultrasonic sensor, buzzer, and LED indicator. This project reinforces wiring, sensor reading, and conditional logic.',
    null::text, null::text, '45 min', 1, false, true
  from m4
) as lesson_rows(module_id, course_id, title, slug, lesson_type, video_url, content, code, pdf_url, duration, position, is_preview, is_published)
on conflict (course_id, slug) do update set
  module_id = excluded.module_id,
  title = excluded.title,
  lesson_type = excluded.lesson_type,
  video_url = excluded.video_url,
  content = excluded.content,
  code = excluded.code,
  pdf_url = excluded.pdf_url,
  duration = excluded.duration,
  position = excluded.position,
  is_preview = excluded.is_preview,
  is_published = excluded.is_published;

insert into public.projects (
  title,
  slug,
  short_description,
  description,
  category,
  level,
  estimated_time,
  thumbnail_url,
  source_code,
  steps,
  troubleshooting,
  is_published
) values
(
  'Line Follower Robot',
  'line-follower-robot',
  'Build a robot that follows a black line using IR sensors and motor logic.',
  'A classic robotics project for learning sensor feedback, motor direction, and calibration.',
  'Robotics Projects',
  'Beginner',
  '3 hours',
  'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=900&auto=format&fit=crop&q=70',
  'if (leftSensor == LOW && rightSensor == HIGH) {' || chr(10) || '  turnLeft();' || chr(10) || '} else if (leftSensor == HIGH && rightSensor == LOW) {' || chr(10) || '  turnRight();' || chr(10) || '} else {' || chr(10) || '  moveForward();' || chr(10) || '}',
  'Assemble chassis' || chr(10) || 'Mount IR sensors' || chr(10) || 'Wire motor driver' || chr(10) || 'Upload code' || chr(10) || 'Calibrate sensor height',
  'If the robot spins, swap motor wires.' || chr(10) || 'If sensors fail, check line contrast and sensor height.',
  true
),
(
  'Obstacle Avoiding Robot',
  'obstacle-avoiding-robot',
  'Use ultrasonic sensing to detect obstacles and steer away automatically.',
  'Combine a chassis, motor driver, ultrasonic sensor, and Arduino logic into a moving robot.',
  'Robotics Projects',
  'Beginner',
  '4 hours',
  'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=900&auto=format&fit=crop&q=70',
  'if (distance < 20) {' || chr(10) || '  stopMotors();' || chr(10) || '  turnRight();' || chr(10) || '} else {' || chr(10) || '  moveForward();' || chr(10) || '}',
  'Build chassis' || chr(10) || 'Mount ultrasonic sensor' || chr(10) || 'Wire motors' || chr(10) || 'Upload movement code' || chr(10) || 'Test obstacle response',
  'Use a stable battery pack.' || chr(10) || 'Keep sensor wires short and firm.',
  true
),
(
  'IoT Weather Station',
  'iot-weather-station',
  'Read temperature and humidity and prepare the data for an IoT dashboard.',
  'A practical ESP32 project for collecting environmental data and displaying it online.',
  'IoT Projects',
  'Intermediate',
  '5 hours',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=70',
  'float temperature = dht.readTemperature();' || chr(10) || 'float humidity = dht.readHumidity();' || chr(10) || 'Serial.println(temperature);',
  'Wire DHT sensor' || chr(10) || 'Configure ESP32 Wi-Fi' || chr(10) || 'Read sensor data' || chr(10) || 'Send readings to dashboard',
  'Use correct DHT library.' || chr(10) || 'Check Wi-Fi SSID and password.',
  true
)
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  category = excluded.category,
  level = excluded.level,
  estimated_time = excluded.estimated_time,
  thumbnail_url = excluded.thumbnail_url,
  source_code = excluded.source_code,
  steps = excluded.steps,
  troubleshooting = excluded.troubleshooting,
  is_published = excluded.is_published;

with p as (
  select id from public.projects where slug = 'line-follower-robot'
)
insert into public.project_components (project_id, component_name, quantity, product_url)
select p.id, v.component_name, v.quantity, v.product_url
from p
cross join (
  values
    ('Robot Car Chassis', 1, 'https://rees52.com/search?s=Robot+Car+Chassis'),
    ('IR Sensor Module', 2, 'https://rees52.com/search?s=IR+Sensor'),
    ('L298N Motor Driver', 1, 'https://rees52.com/search?s=L298N')
) as v(component_name, quantity, product_url)
on conflict (project_id, component_name) do update set
  quantity = excluded.quantity,
  product_url = excluded.product_url;

with p as (
  select id from public.projects where slug = 'obstacle-avoiding-robot'
)
insert into public.project_components (project_id, component_name, quantity, product_url)
select p.id, v.component_name, v.quantity, v.product_url
from p
cross join (
  values
    ('Ultrasonic Sensor HC-SR04', 1, 'https://rees52.com/search?s=HC-SR04'),
    ('Arduino Uno R3', 1, 'https://rees52.com/search?s=Arduino+Uno'),
    ('Motor Driver Module', 1, 'https://rees52.com/search?s=Motor+Driver')
) as v(component_name, quantity, product_url)
on conflict (project_id, component_name) do update set
  quantity = excluded.quantity,
  product_url = excluded.product_url;

insert into public.ebooks (
  title,
  slug,
  description,
  category,
  level,
  cover_url,
  file_url,
  is_free,
  is_published
) values
(
  'Arduino Starter Guide',
  'arduino-starter-guide',
  'A quick PDF guide for Arduino boards, pins, wiring, and first sketches.',
  'Arduino Guides',
  'Beginner',
  'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=700&auto=format&fit=crop&q=70',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  true,
  true
),
(
  'Robotics Lab Manual',
  'robotics-lab-manual',
  'Classroom-ready notes for robot chassis, motors, sensors, and testing.',
  'Robotics Manuals',
  'Beginner',
  'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=700&auto=format&fit=crop&q=70',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  level = excluded.level,
  cover_url = excluded.cover_url,
  file_url = excluded.file_url,
  is_free = excluded.is_free,
  is_published = excluded.is_published;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
),
m as (
  select id from public.course_modules
  where course_id = (select id from c)
    and title = 'Module 1: Introduction to Arduino'
),
q as (
  insert into public.quizzes (course_id, module_id, title, passing_score)
  select c.id, m.id, 'Arduino Basics Quiz', 60
  from c, m
  on conflict (course_id, title) do update set
    module_id = excluded.module_id,
    passing_score = excluded.passing_score
  returning id
)
insert into public.quiz_questions (
  quiz_id,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  explanation,
  position
)
select q.id, v.question, v.option_a, v.option_b, v.option_c, v.option_d, v.correct_option, v.explanation, v.position
from q
cross join (
  values
    ('What is Arduino commonly used for?', 'Only video editing', 'Reading sensors and controlling outputs', 'Making spreadsheets', 'Charging batteries only', 'B', 'Arduino is commonly used to read sensors and control output devices.', 1),
    ('Which software is used to upload sketches?', 'Arduino IDE', 'Photoshop', 'Excel', 'VLC', 'A', 'Arduino IDE is used to write and upload sketches.', 2),
    ('Which sensor can measure distance?', 'LDR', 'HC-SR04 ultrasonic sensor', 'Buzzer', 'LED', 'B', 'The HC-SR04 ultrasonic sensor measures distance.', 3)
) as v(question, option_a, option_b, option_c, option_d, correct_option, explanation, position)
on conflict (quiz_id, position) do update set
  question = excluded.question,
  option_a = excluded.option_a,
  option_b = excluded.option_b,
  option_c = excluded.option_c,
  option_d = excluded.option_d,
  correct_option = excluded.correct_option,
  explanation = excluded.explanation;

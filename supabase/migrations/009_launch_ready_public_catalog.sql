-- Align the database catalogue with the launch-ready public experience.
-- The application also applies completeness checks, so unfinished records stay hidden
-- before and after this migration is applied.

update public.courses
set is_published = false
where slug not in (
  'arduino-beginner-course',
  'esp32-iot-course',
  'robotics-starter-course'
);

update public.courses
set
  title = case slug
    when 'arduino-beginner-course' then 'Arduino Foundations: LED and Servo'
    when 'esp32-iot-course' then 'ESP32 IoT: Sensor to Local Web'
    when 'robotics-starter-course' then 'Mobile Robotics: Line Follower'
    else title
  end,
  short_description = case slug
    when 'arduino-beginner-course' then 'Complete two Arduino labs with official REES52 videos, checked wiring, working code, a workbook and a scored quiz.'
    when 'esp32-iot-course' then 'Set up an ESP32, read a DHT11 and serve a local web response with official REES52 videos, code, wiring and a workbook.'
    when 'robotics-starter-course' then 'Calibrate two IR sensors, test a motor driver and tune a complete line-following robot with video, code, wiring and a build guide.'
    else short_description
  end,
  class_level = case slug
    when 'arduino-beginner-course' then 'Class 6'
    when 'esp32-iot-course' then 'Class 8'
    when 'robotics-starter-course' then 'Class 7'
    else class_level
  end,
  duration = case slug
    when 'arduino-beginner-course' then '2.5 hours'
    when 'esp32-iot-course' then '3 hours'
    when 'robotics-starter-course' then '3.5 hours'
    else duration
  end,
  is_free = true,
  price = 0,
  is_published = true
where slug in (
  'arduino-beginner-course',
  'esp32-iot-course',
  'robotics-starter-course'
);

-- Retire the old partial lesson trees. The application supplies the checked launch
-- lesson trees for these three stable course slugs.
update public.course_modules
set is_published = false
where course_id in (
  select id
  from public.courses
  where slug in (
    'arduino-beginner-course',
    'esp32-iot-course',
    'robotics-starter-course'
  )
);

update public.lessons
set is_published = false
where course_id in (
  select id
  from public.courses
  where slug in (
    'arduino-beginner-course',
    'esp32-iot-course',
    'robotics-starter-course'
  )
);

-- The previous projects and ebooks were missing required assets or pointed to test PDFs.
-- Keep them available to administrators while removing them from the public catalogue.
update public.projects
set is_published = false;

update public.ebooks
set is_published = false;

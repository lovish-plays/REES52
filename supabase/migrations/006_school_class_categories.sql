-- Add school-class categories for course and project discovery.

alter table public.courses
  add column if not exists class_level text;

alter table public.projects
  add column if not exists class_level text;

-- Normalize existing rows before enforcing the allowed category values.
update public.courses
set class_level = 'Class 6'
where class_level is null
   or class_level not in ('Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12');

update public.projects
set class_level = 'Class 6'
where class_level is null
   or class_level not in ('Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12');

-- Give the seeded learning paths their initial age-appropriate categories.
update public.courses set class_level = case slug
  when 'arduino-beginner-course' then 'Class 3'
  when 'sensors-and-modules-course' then 'Class 4'
  when 'robotics-starter-course' then 'Class 5'
  when '3d-printing-basics' then 'Class 6'
  when 'raspberry-pi-basics' then 'Class 7'
  when 'esp32-iot-course' then 'Class 8'
  when 'drone-technology-basics' then 'Class 10'
  when 'ai-for-students' then 'Class 12'
  else class_level
end
where slug in (
  'arduino-beginner-course', 'sensors-and-modules-course', 'robotics-starter-course',
  '3d-printing-basics', 'raspberry-pi-basics', 'esp32-iot-course',
  'drone-technology-basics', 'ai-for-students'
);

update public.projects set class_level = case slug
  when 'smart-dustbin' then 'Class 3'
  when 'sensor-testing-kit' then 'Class 4'
  when 'line-follower-robot' then 'Class 5'
  when 'obstacle-avoiding-robot' then 'Class 6'
  when '3d-printed-toy-model' then 'Class 7'
  when 'iot-weather-station' then 'Class 8'
  when 'home-automation-using-esp32' then 'Class 9'
  when 'mini-drone-assembly' then 'Class 10'
  else class_level
end
where slug in (
  'smart-dustbin', 'sensor-testing-kit', 'line-follower-robot',
  'obstacle-avoiding-robot', '3d-printed-toy-model', 'iot-weather-station',
  'home-automation-using-esp32', 'mini-drone-assembly'
);

alter table public.courses alter column class_level set default 'Class 6';
alter table public.courses alter column class_level set not null;
alter table public.projects alter column class_level set default 'Class 6';
alter table public.projects alter column class_level set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'courses_class_level_check') then
    alter table public.courses add constraint courses_class_level_check
      check (class_level in ('Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_class_level_check') then
    alter table public.projects add constraint projects_class_level_check
      check (class_level in ('Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'));
  end if;
end $$;

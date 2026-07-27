import 'server-only';

import { hasSupabaseEnv } from '@/lib/supabaseConfig';
import { supabasePublic } from '@/lib/supabasePublic';

export type QuizLinkItem = {
  id: string;
  topic: string;
  description: string;
  quizUrl: string;
  source: 'academy' | 'teacher';
};

type QuizLinkRow = {
  id: string;
  title: string;
  description: string | null;
  meeting_url: string | null;
};

const academyQuizLinks: QuizLinkItem[] = [
  {
    id: 'academy-arduino-foundations',
    topic: 'Arduino Foundations Quiz',
    description:
      'Check LED wiring, pin modes, resistor safety, servo movement and the debugging checks used in the Arduino Foundations course.',
    quizUrl: '/learn/arduino-beginner-course/arduino-foundations-quiz',
    source: 'academy',
  },
  {
    id: 'academy-esp32-iot',
    topic: 'ESP32 IoT Quiz',
    description:
      'Review ESP32 board setup, DHT11 readings, Wi-Fi credentials and the local web response built during the ESP32 IoT course.',
    quizUrl: '/learn/esp32-iot-course/esp32-iot-quiz',
    source: 'academy',
  },
  {
    id: 'academy-mobile-robotics',
    topic: 'Mobile Robotics Quiz',
    description:
      'Test your understanding of motor drivers, two-sensor calibration, steering decisions and line-follower troubleshooting.',
    quizUrl: '/learn/robotics-starter-course/mobile-robotics-quiz',
    source: 'academy',
  },
];

export async function getPublicQuizLinks(): Promise<QuizLinkItem[]> {
  if (!hasSupabaseEnv) return academyQuizLinks;

  try {
    // External quiz links use the existing public learning-event record shape.
    // A null schedule distinguishes them from scheduled webinars.
    const { data, error } = await supabasePublic
      .from('webinars')
      .select('id,title,description,meeting_url')
      .is('schedule_date', null)
      .eq('is_live', false)
      .order('created_at', { ascending: false });

    if (error || !data) return academyQuizLinks;

    const teacherQuizLinks = (data as QuizLinkRow[])
      .filter(
        (row) =>
          row.title?.trim() &&
          row.description?.trim() &&
          isSafeExternalQuizUrl(row.meeting_url),
      )
      .map((row) => ({
        id: row.id,
        topic: row.title.trim(),
        description: row.description!.trim(),
        quizUrl: row.meeting_url!.trim(),
        source: 'teacher' as const,
      }));

    return [...teacherQuizLinks, ...academyQuizLinks];
  } catch {
    return academyQuizLinks;
  }
}

export function isSafeExternalQuizUrl(value?: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

/**
 * Manual YouTube VN channel playlists → scripts/data/youtube-channels.json
 * Run: npm run parse:youtube-channels
 */
import { type CourseTopicBundle, writeJson } from "./lib/data-expansion.js";

/** Curated playlists from SPEC — extend as needed. */
const MANUAL_CHANNELS: CourseTopicBundle[] = [
  {
    topic: "JavaScript",
    source: "manual",
    courses: [
      {
        title: "JavaScript cơ bản - F8",
        instructor: "F8 Official",
        youtubeUrl: "https://www.youtube.com/playlist?list=PLv6zHk-qN3H0iXJ_gjAiyoz_RY6s8-LQJ",
        playlistId: "PLv6zHk-qN3H0iXJ_gjAiyoz_RY6s8-LQJ",
        thumbnailUrl: "https://i.ytimg.com/vi/PLv6zHk-qN3H0iXJ_gjAiyoz_RY6s8-LQJ/hqdefault.jpg",
        level: "beginner",
      },
    ],
  },
  {
    topic: "React",
    source: "manual",
    courses: [
      {
        title: "ReactJS - Hỏi Dân IT",
        instructor: "Hỏi Dân IT",
        youtubeUrl: "https://www.youtube.com/playlist?list=PLNC7vBHZL8HTvToiY2FBzD4gSkUFhpKOD",
        playlistId: "PLNC7vBHZL8HTvToiY2FBzD4gSkUFhpKOD",
        thumbnailUrl: "https://i.ytimg.com/vi/PLNC7vBHZL8HTvToiY2FBzD4gSkUFhpKOD/hqdefault.jpg",
        level: "intermediate",
      },
      {
        title: "MERN Stack - TrungQuanDev",
        instructor: "TrungQuanDev",
        youtubeUrl: "https://www.youtube.com/playlist?list=PLWvJkIrGynFq9APduetgi3l9xehOCZCTZEG",
        playlistId: "PLWvJkIrGynFq9APduetgi3l9xehOCZCTZEG",
        thumbnailUrl: "https://i.ytimg.com/vi/PLWvJkIrGynFq9APduetgi3l9xehOCZCTZEG/hqdefault.jpg",
        level: "intermediate",
      },
    ],
  },
  {
    topic: "NodeJS",
    source: "manual",
    courses: [
      {
        title: "NodeJS - Hỏi Dân IT",
        instructor: "Hỏi Dân IT",
        youtubeUrl: "https://www.youtube.com/playlist?list=PLNC7vBHZL8HRiFUDxrc2xcieyx6ov84Ci",
        playlistId: "PLNC7vBHZL8HRiFUDxrc2xcieyx6ov84Ci",
        thumbnailUrl: "https://i.ytimg.com/vi/PLNC7vBHZL8HRiFUDxrc2xcieyx6ov84Ci/hqdefault.jpg",
        level: "intermediate",
      },
    ],
  },
  {
    topic: "Flutter",
    source: "manual",
    courses: [
      {
        title: "Flutter - Tùng Sugar",
        instructor: "Tùng Sugar",
        youtubeUrl: "https://www.youtube.com/playlist?list=PLWvJkIrGynFq9APduetgi3l9xehOCZCTZEG",
        playlistId: "PLWvJkIrGynFq9APduetgi3l9xehOCZCTZEG",
        thumbnailUrl: "https://i.ytimg.com/vi/PLWvJkIrGynFq9APduetgi3l9xehOCZCTZEG/hqdefault.jpg",
        level: "beginner",
      },
    ],
  },
  {
    topic: "PHP",
    source: "manual",
    courses: [
      {
        title: "PHP Laravel - ZendVN",
        instructor: "ZendVN",
        youtubeUrl: "https://www.youtube.com/playlist?list=PLv6zHk-qN3H0iXJ_gjAiyoz_RY6s8-LQJ",
        playlistId: "PLv6zHk-qN3H0iXJ_gjAiyoz_RY6s8-LQJ",
        thumbnailUrl: "https://i.ytimg.com/vi/PLv6zHk-qN3H0iXJ_gjAiyoz_RY6s8-LQJ/hqdefault.jpg",
        level: "beginner",
      },
    ],
  },
];

function main() {
  const total = MANUAL_CHANNELS.reduce((n, t) => n + t.courses.length, 0);
  console.log(`Writing ${MANUAL_CHANNELS.length} topics, ${total} manual courses`);
  writeJson("youtube-channels.json", MANUAL_CHANNELS);
}

main();

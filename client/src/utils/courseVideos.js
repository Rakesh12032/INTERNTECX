const COURSE_VIDEO_BY_SLUG = {
  "full-stack-web-development": "https://www.youtube.com/embed/nu_pCVPKzTk",
  "python-programming": "https://www.youtube.com/embed/rfscVS0vtbw",
  "machine-learning-with-python": "https://www.youtube.com/embed/i_LwzRVP7bg",
  "data-science-and-analytics": "https://www.youtube.com/embed/ua-CiDNNj30",
  "ui-ux-design-fundamentals": "https://www.youtube.com/embed/c9Wg6Cb_YlU",
  "dsa-in-java": "https://www.youtube.com/embed/xk4_1vDrzzo",
  "cybersecurity-fundamentals": "https://www.youtube.com/embed/U_P23SqJaDc",
  "cloud-computing-with-aws": "https://www.youtube.com/embed/3hLmDS179YE",
  "android-app-development": "https://www.youtube.com/embed/fis26HvvDII",
  "sql-and-database-design": "https://www.youtube.com/embed/HXV3zeQKqGY",
  "devops-and-docker-basics": "https://www.youtube.com/embed/3c-iBn73dDE",
  "digital-marketing-for-tech": "https://www.youtube.com/embed/nU-IIXBWlS4"
};

export function getCourseVideoUrl(course) {
  if (!course) return "https://www.youtube.com/embed/rfscVS0vtbw";
  const lessonUrl = course.modules?.[0]?.lessons?.[0]?.videoUrl;

  if (lessonUrl && !lessonUrl.includes("dQw4w9WgXcQ")) {
    return lessonUrl;
  }

  return (
    COURSE_VIDEO_BY_SLUG[course.slug] ||
    COURSE_VIDEO_BY_SLUG[course.id] ||
    "https://www.youtube.com/embed/rfscVS0vtbw"
  );
}

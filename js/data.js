// Edit this file only. No server needed, works by double-clicking index.html.
window.ACM = {
  year: 2026,
  about: [
    { id: "acmcu", label: "ACM CU", text: "We are the student chapter of the Association for Computing Machinery at the University of Calcutta. We run workshops, contests and open-source drives, and turn ideas into real-world impact." },
    { id: "cu", label: "University of Calcutta", text: "Founded in 1857, the University of Calcutta is among India's oldest modern universities, with a long tradition of research and scholarship in Kolkata." },
    { id: "acm", label: "ACM", text: "Founded in 1947, ACM is the world's largest educational and scientific computing society, uniting educators, researchers and professionals." }
  ],
  // Our chapter is new, so nothing has happened yet.
  // Planned events go in "upcoming". Add date: "2027-01-15" once an event is confirmed.
  // When an event is finished, move it into "past".
  events: {
    upcoming: [
      { title: "Intro to Git and GitHub", type: "Workshop", text: "Hands-on version control for beginners. Planned, details coming soon." },
      { title: "CodeSprint 1.0", type: "Contest", text: "Our first competitive programming round. Planned, details coming soon." },
      { title: "InspHER Podcast Ep. 1", type: "ACM-W", text: "Women in tech share their journeys. Planned, details coming soon." }
      
    ],
    past: []
  },
  // Footer contact block. Edit the email, address lines and social links here.
  contact: {
    email: "acm@example.com",
    address: [
      "ACM CU, University of Calcutta",
      "Technology Campus (Acharya Prafulla Chandra Siksha Prangan)",
      "Block JD-2, Sector III, Salt Lake City",
      "Bidhannagar, Kolkata 700106",
      "West Bengal, India"
    ],
    mapQuery: "University of Calcutta Technology Campus, JD Block, Sector III, Salt Lake City, Kolkata 700106"
  },
  // Use your real profile links. "#" shows the icon but goes nowhere yet.
  social: [
    { name: "LinkedIn",  url: "#", icon: "fa-brands fa-linkedin-in" },
    { name: "Instagram", url: "#", icon: "fa-brands fa-instagram" },
    { name: "GitHub",    url: "#", icon: "fa-brands fa-github" },
    { name: "Facebook",  url: "#", icon: "fa-brands fa-facebook-f" },
    { name: "YouTube",   url: "#", icon: "fa-brands fa-youtube" },
    { name: "X",         url: "#", icon: "fa-brands fa-x-twitter" }
  ],
  projects: [
    { name: "Project One", text: "Event planning, deadlines and team communication in one place.", link: "#" },
    { name: "Project Two", text: "Event planning, deadlines and team communication in one place.", link: "#" },
    { name: "Project Three", text: "Event planning, deadlines and team communication in one place.", link: "#" }
  ],
  team: [
    { name: "Dr. Sankhayan Choudhury", role: "Faculty Sponsor", img: "assets/images/faculty/sankhayan_choudhury.png", linkedin: "#", github: "" },
    { name: "Mrinal Das", role: "Secretary", img: "assets/images/faculty/Mrinal.png", linkedin: "#", github: "" },
    { name: "Shinjini Bhattacharya", role: "Chair", img: "", linkedin: "#", github: "#" },
    { name: "Debmalya Ghosh", role: "Vice Chair", img: "", linkedin: "#", github: "#" },
    { name: "Roni Dey", role: "Treasurer", img: "", linkedin: "#", github: "#" },
    { name: "Subhra Pratim Mondal", role: "Web Master", img: "", linkedin: "#", github: "#" },
    { name: "Debasmita Pal", role: "Membership Chair", img: "", linkedin: "#", github: "#" }
  ]
};

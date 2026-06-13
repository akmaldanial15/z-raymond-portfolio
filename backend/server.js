import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const filmProjects = [
  {
    id: 1,
    title: "BLUEPRINT NO. 7",
    tagline: "The structure of memory is built on hollow ground.",
    laurels: "OFFICIAL SELECTION — CANNES 2026",
    rating: 5,
    metadata: {
      directedBy: "Z. RAYMOND",
      starring: "ELENA ROSTOVA, MARCUS VANCE",
      cinematography: "JEAN-PIERRE GAUTIER",
      runtime: "108 MINS",
      year: "2026",
      genre: "NEO-NOIR THRILLER"
    },
    synopsis: "In the concrete belly of an industrial labyrinth, an architect uncovers a blueprint that details not a building, but the exact reconstruction of a crime he has yet to commit.",
    imageKey: "parking_garage"
  },
  {
    id: 2,
    title: "THE LONG QUIET",
    tagline: "Some silences speak louder than sirens.",
    laurels: "WINNER BEST DIRECTOR — SUNDANCE 2026",
    rating: 4.8,
    metadata: {
      directedBy: "Z. RAYMOND",
      starring: "SARAH CHEN, DAVID OLAOYE",
      cinematography: "ALEXIS KAUR",
      runtime: "95 MINS",
      year: "2025",
      genre: "PSYCHOLOGICAL DRAMA"
    },
    synopsis: "Lost deep within the ancient, whispered pines of the Pacific Northwest, a retired search-and-rescue operator confronts a haunting presence that feeds on the silence of the woods.",
    imageKey: "forest_night"
  },
  {
    id: 3,
    title: "ECHOES OF DUSK",
    tagline: "To see the city is to look within.",
    laurels: "OFFICIAL SELECTION — VENICE 2026",
    rating: 4.9,
    metadata: {
      directedBy: "Z. RAYMOND",
      starring: "MAYA HARA, CHRISTIAN BALE",
      cinematography: "Z. RAYMOND",
      runtime: "122 MINS",
      year: "2026",
      genre: "SURREALIST SCI-FI"
    },
    synopsis: "A double-exposed journey through the subconscious of a sleepless city. A visual experiment blending urban sprawl with the intimate architecture of human vision.",
    imageKey: "city_eye"
  },
  {
    id: 4,
    title: "THE LAST CRAFTSMAN",
    tagline: "Time is the only antique that cannot be restored.",
    laurels: "AUDIENCE CHOICE — TIFF 2025",
    rating: 4.7,
    metadata: {
      directedBy: "Z. RAYMOND",
      starring: "ARTHUR PENDLETON",
      cinematography: "EMILY WRIGHT",
      runtime: "87 MINS",
      year: "2025",
      genre: "DOCUMENTARY / INDIE"
    },
    synopsis: "An intimate, macro-cinematic look inside a forgotten watchmaker's workshop, where the seconds tick away as a dying art form struggles against the digital age.",
    imageKey: "vintage_room"
  }
];

// Get all film projects
app.get('/api/projects', (req, res) => {
  res.json(filmProjects);
});

// Update project rating (dynamic state)
app.post('/api/projects/:id/rate', (req, res) => {
  const projectId = parseInt(req.params.id);
  const { rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5 stars." });
  }

  const project = filmProjects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Simple dynamic calculation: average the existing rating with the new one
  project.rating = parseFloat(((project.rating + rating) / 2).toFixed(1));
  res.json({ message: "Thank you for rating!", project });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

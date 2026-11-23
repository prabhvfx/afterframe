import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Load the brand fonts from public/fonts so renders match on every machine,
// whatever fonts the OS has. Inter's opsz axis gives the Display cut at big sizes.
const FACES: [family: string, file: string][] = [
  ["Inter Display", "fonts/InterVariable.woff2"],
  ["Inter", "fonts/InterVariable.woff2"],
  ["JetBrains Mono", "fonts/JetBrainsMono-wght.ttf"],
];

const handle = delayRender("Loading brand fonts");
Promise.all(
  FACES.map(async ([family, file]) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, { weight: "100 900" });
    document.fonts.add(await face.load());
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => cancelRender(err)); // fail loudly, never render with fallback fonts

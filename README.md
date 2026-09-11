## Label Maker

HTML-Template to print labels. Make sure you use a modern Browser with Support for CSS custom properties.


This was originally developed for just [one label](https://signalwerk.github.io/label-maker/?bottom=26&h1Scale=85&height=130&isUiVisible=1&left=14&printscale=104.65&right=12&text=%23%23%20IAD%0A----%0A%23%20interaction%20design%0A----%0A%0A----%0ADieser%20Kasten%20beinhaltet%20Material%20der%20HF%20Interaction%20Design.%20%0ABitte%20keine%20Gegenst%C3%A4nde%20entnehmen.%20Danke.%20%0AStefan%20Huber%20%2B41%2078%20744%2037%2038%0A----%0A%0AEndformat%3A%2092x130%0ASichtbar%3A%2078x98%20%28left%3A%208%2C%20top%3A%208%29%0AMargin%20im%20sichtbaren%20Format%3A%20%0A%20%20%20L%20%26%20R%3A%206%0A%20%20%20T%3A%203%0A%20%20%20B%3A%204%0A%0A&top=11&width=92), but since it was fun I tried some more.

### Development

Node.js 24 and npm 11 or newer are required.

```sh
npm install
npm run dev
```

Create and locally preview a production build with:

```sh
npm run build
npm run preview
```

Open the settings panel with the gear button to download the current label as
a PDF, show the optional magenta active-area guide, or add cropmarks. Cropmarks
start 3 mm outside the trim edge and are 7 mm long, so enabling them extends
the output page by 10 mm on every side. Label settings remain in millimetres;
the PDF download converts them to PDF points.

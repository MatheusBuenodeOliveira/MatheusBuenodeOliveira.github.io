# matheusbuenodeoliveira.github.io

My personal site: my career drawn as a neural network.

- **Input → Training data → Experience → Learned features → Output**: each neuron is a piece of my history (education, roles, skills, contact).
- Edges are real relationships with weights. Hover a neuron to trace the signal that fed it and what it produced.
- The timeline is the training run: drag it, or press **Run forward pass** to watch the network learn from 2019 to now.
- The **Model card** section below is the same data as a plain, readable résumé.
- English by default, Portuguese with the EN/PT toggle (or `?lang=pt`).

Built with plain HTML, CSS and JavaScript (canvas). No framework, no build step.

## Edit content

Everything lives in [`js/data.js`](js/data.js): neurons, edges and UI strings, each with `en` and `pt`.

## Run locally

```
python -m http.server 5173
```

Then open http://localhost:5173.

`?snapshot` renders a still frame. That's how `assets/og.png` (the link preview image) is generated.

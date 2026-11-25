# matheusbuenodeoliveira.github.io

My personal site: my career as a neural network you explore one neuron at a time.

- The camera stays close on a single neuron, and its content (role, period, impact, stack) lives inside it.
- Synapses leave the neuron toward where their targets really are. Follow one and the camera travels along that weight.
- Three themed paths start at the input neuron: **Career**, **Education** and **Skills**. Cross-path synapses carry a reason, for example *PUCRS → Dell Intern: selected for Dell IT Academy*, so you can jump paths at any point.
- **Full network** (button, minimap or `N`) zooms out to the whole graph. Click any neuron to dive into it.
- Every neuron has its own URL (`#telus`, `#network`). English by default, Portuguese with the EN/PT toggle (or `?lang=pt`).

Built with plain HTML, CSS and JavaScript (canvas). No framework, no build step.

## Edit content

Everything lives in [`js/data.js`](js/data.js): tracks, neurons, cross-path links and UI strings, each with `en` and `pt`.

## Run locally

```
python -m http.server 5173
```

Then open http://localhost:5173.

`?snapshot` renders a still frame. That's how `assets/og.png` (the link preview image) is generated.

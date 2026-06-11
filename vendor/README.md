# vendor (local libs)

`cad-view.html` uses local files under `vendor/` to avoid CDN blocking.

## What to replace
Replace these stub files with real **Three.js r128** assets:
- `vendor/three@0.128.0/three.min.js`
- `vendor/three@0.128.0/loaders/GLTFLoader.js`
- `vendor/three@0.128.0/loaders/DRACOLoader.js`
- `vendor/three@0.128.0/controls/OrbitControls.js`

Also ensure the Draco decoder binaries are accessible at the path used by `setDecoderPath(...)` in `cad-view.html`.


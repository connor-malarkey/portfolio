/**
 * Synthetic Heart — morphing glass blob + glowing wireframe icosahedron.
 * Vanilla Three.js: blob with transmission/iridescence, wireframe shell, red inner light; hover tightens wireframe and intensifies glow.
 */
(function () {
  const canvas = document.getElementById('globeBreakCanvas');
  const card = document.getElementById('syntheticHeartCard');
  if (!canvas) return;

  const container = canvas.closest('.globe-break-canvas-wrap');
  if (!container) return;

  let width = 0;
  let height = 0;
  let scene = null;
  let camera = null;
  let renderer = null;
  let blob = null;
  let blobGeometry = null;
  let originalPositions = null;
  let wireframe = null;
  let innerLight = null;
  let frameId = 0;
  let time = 0;
  let isHover = false;
  let wireframeScale = 1.2;
  let lightIntensity = 0.4;
  const wireframeScaleRest = 1.2;
  const wireframeScaleHover = 1.02;
  const lightIntensityRest = 0.4;
  const lightIntensityHover = 1.2;

  function getDimensions() {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }

  function simplex3(x, y, z) {
    var n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164) * 43758.5453;
    return n - Math.floor(n);
  }

  function noise3(x, y, z) {
    var i = Math.floor(x);
    var j = Math.floor(y);
    var k = Math.floor(z);
    var u = x - i;
    var v = y - j;
    var w = z - k;
    var n = simplex3(i, j, k) * (1 - u) * (1 - v) * (1 - w) +
            simplex3(i + 1, j, k) * u * (1 - v) * (1 - w) +
            simplex3(i, j + 1, k) * (1 - u) * v * (1 - w) +
            simplex3(i + 1, j + 1, k) * u * v * (1 - w) +
            simplex3(i, j, k + 1) * (1 - u) * (1 - v) * w +
            simplex3(i + 1, j, k + 1) * u * (1 - v) * w +
            simplex3(i, j + 1, k + 1) * (1 - u) * v * w +
            simplex3(i + 1, j + 1, k + 1) * u * v * w;
    return n;
  }

  function init() {
    getDimensions();
    if (width < 10 || height < 10) return;

    import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js').then(function (THREE) {
      const _Scene = THREE.Scene;
      const _PerspectiveCamera = THREE.PerspectiveCamera;
      const _WebGLRenderer = THREE.WebGLRenderer;
      const _SphereGeometry = THREE.SphereGeometry;
      const _IcosahedronGeometry = THREE.IcosahedronGeometry;
      const _EdgesGeometry = THREE.EdgesGeometry;
      const _LineSegments = THREE.LineSegments;
      const _Mesh = THREE.Mesh;
      const _MeshPhysicalMaterial = THREE.MeshPhysicalMaterial;
      const _LineBasicMaterial = THREE.LineBasicMaterial;
      const _PointLight = THREE.PointLight;
      const _Vector3 = THREE.Vector3;
      const _Color = THREE.Color;

      scene = new _Scene();
      scene.background = null;

      camera = new _PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.z = 3.2;

      renderer = new _WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
      else if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

      var radius = 0.72;
      blobGeometry = new _SphereGeometry(radius, 64, 64);
      originalPositions = blobGeometry.attributes.position.array.slice();
      var blobMat = new _MeshPhysicalMaterial({
        transmission: 1,
        thickness: 2,
        roughness: 0,
        metalness: 0,
        color: 0x0a0a0f,
        iridescence: 1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        transparent: true,
        opacity: 0.92
      });
      blob = new _Mesh(blobGeometry, blobMat);
      scene.add(blob);

      var wireGeom = new _IcosahedronGeometry(wireframeScaleRest, 0);
      var edges = new _EdgesGeometry(wireGeom, 15);
      wireframe = new _LineSegments(edges, new _LineBasicMaterial({
        color: 0xff4444,
        transparent: true,
        opacity: 0.9
      }));
      scene.add(wireframe);

      innerLight = new _PointLight(0xff4444, lightIntensityRest, 2, 1.5);
      blob.add(innerLight);

      if (card) {
        card.addEventListener('mouseenter', function () {
          isHover = true;
        });
        card.addEventListener('mouseleave', function () {
          isHover = false;
        });
      }

      function animate() {
        frameId = requestAnimationFrame(animate);
        time += 0.012;

        var targetScale = isHover ? wireframeScaleHover : wireframeScaleRest;
        wireframeScale += (targetScale - wireframeScale) * 0.08;
        wireframe.scale.setScalar(wireframeScale);

        var targetLight = isHover ? lightIntensityHover : lightIntensityRest;
        lightIntensity += (targetLight - lightIntensity) * 0.08;
        innerLight.intensity = lightIntensity;

        var pos = blobGeometry.attributes.position;
        var v3 = new _Vector3();
        for (var i = 0; i < pos.count; i++) {
          v3.set(originalPositions[i * 3], originalPositions[i * 3 + 1], originalPositions[i * 3 + 2]);
          v3.normalize();
          var n = noise3(v3.x * 2 + time * 0.4, v3.y * 2 + time * 0.3, v3.z * 2 + time * 0.35);
          var r = radius + 0.06 * (n - 0.5);
          v3.multiplyScalar(r);
          pos.setXYZ(i, v3.x, v3.y, v3.z);
        }
        pos.needsUpdate = true;
        blobGeometry.computeVertexNormals();

        blob.rotation.y += 0.004;
        wireframe.rotation.y += 0.006;
        wireframe.rotation.x += 0.002;

        renderer.render(scene, camera);
      }
      animate();

      var resizeObserver = new ResizeObserver(function () {
        getDimensions();
        if (width < 10 || height < 10) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });
      resizeObserver.observe(container);
    }).catch(function (err) {
      console.warn('Synthetic Heart (Three.js) failed to load:', err);
    });
  }

  init();
})();

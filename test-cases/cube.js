import registerDeviceOrientationControls from '../controls/DeviceOrientationControls'

export function renderCube(canvas, THREE) {
  var camera, scene, renderer;
  var mesh;

  var axesHelper
  var cameraControls

  init();
  animate();

  function init() {

    // camera
    camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 1, 100);
    // camera.position.z = 400;

    // 拉远点镜头
    camera.position.set(10, 20, 50);
    camera.lookAt(new THREE.Vector3(0,0,0))

    // scene
    scene = new THREE.Scene();

    // axesHelper
    axesHelper = new THREE.AxesHelper(200)
    scene.add(axesHelper)

    // object
    var geometry = new THREE.BoxBufferGeometry(20, 20, 20);
    var texture = new THREE.TextureLoader().load('/assets/crate.gif');
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.5 });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

     // camera controls
    const { DeviceOrientationControls } = registerDeviceOrientationControls(THREE)
    cameraControls = new DeviceOrientationControls(camera)
    cameraControls.update()

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
    renderer.setSize(canvas.width, canvas.height);
  }

  // animate
  function animate() {
    canvas.requestAnimationFrame(animate);
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;
    cameraControls.update()
    renderer.render(scene, camera);
  }
}
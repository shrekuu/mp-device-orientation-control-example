import registerDeviceOrientationControls from '../controls/DeviceOrientationControls'

export function renderCube (canvas, THREE) {
  var camera, scene, renderer
  var cube

  var axesHelper
  var cameraControls

  var raycaster, INTERSECTED
  var mouse = new THREE.Vector2()

  var touched = false

  init()
  animate()
  bindEvents()

  const systemInfo = wx.getSystemInfoSync()

  function init () {

    // camera
    camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 1, 100)

    // 拉远点镜头
    camera.position.set(10, 20, 50)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // scene
    scene = new THREE.Scene()

    // axesHelper
    axesHelper = new THREE.AxesHelper(200)
    scene.add(axesHelper)

    // object
    var geometry = new THREE.BoxBufferGeometry(10, 10, 10)
    var texture = new THREE.TextureLoader().load('/assets/crate.gif')
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    cube = new THREE.Mesh(geometry, material)

    scene.add(cube)

    // camera controls
    const { DeviceOrientationControls } = registerDeviceOrientationControls(THREE)
    cameraControls = new DeviceOrientationControls(camera)
    cameraControls.update()

    // raycaster
    raycaster = new THREE.Raycaster()

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio)
    renderer.setSize(canvas.width, canvas.height)
  }

  // animate
  function animate () {
    canvas.requestAnimationFrame(animate)

    // cast ray from camera to touch point
    raycaster.setFromCamera(mouse, camera)

    // intersection detection
    var intersects = raycaster.intersectObjects([cube])
    if (touched && intersects.length > 0) {
      INTERSECTED = intersects[0].object
      INTERSECTED.material.opacity = .5
    } else {
      if (INTERSECTED) {
        INTERSECTED.material.opacity = 1
      }
      INTERSECTED = null
    }

    cube.rotation.x += 0.005
    cube.rotation.y += 0.01
    cameraControls.update()
    renderer.render(scene, camera)
  }

  // events
  function bindEvents () {

    var onTouch = function (event) {
      console.log('ontouch')
      touched = true

      // normalize
      mouse.x = (event.touches[0].clientX / systemInfo.windowWidth) * 2 - 1
      mouse.y = -(event.touches[0].clientY / systemInfo.windowHeight) * 2 + 1
    }

    renderer.domElement.addEventListener('touchstart', onTouch, false)
    renderer.domElement.addEventListener('touchmove', onTouch, false)

    renderer.domElement.addEventListener('touchend', function (event) {
      touched = false
      console.log('touchend')
    })
  }
}
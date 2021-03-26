import registerDeviceOrientationControls from '../controls/DeviceOrientationControls'

export function renderCube (canvas, THREE) {
  var camera, scene, renderer
  var cube

  var axesHelper
  var cameraControls

  var raycaster, INTERSECTED
  var mouse = new THREE.Vector2()

  var touched = false

  var isMovingCube = true

  var touchX, touchY
  var lon = 0, lat = 0, gradient
  var last_lon
  var last_lat
  var cubeMoveHelperObject = new THREE.Object3D()

  init()
  animate()
  bindEvents()

  const systemInfo = wx.getSystemInfoSync()

  function init () {

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio)
    renderer.setSize(canvas.width, canvas.height)

    // camera
    camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 1, 1000)

    // 拉远点镜头
    camera.position.set(100, 100, 100)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // scene
    scene = new THREE.Scene()

    // axesHelper
    axesHelper = new THREE.AxesHelper(100)
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
  }

  // keep the cube in front of the camera with a helper object
  function putCubeInFrontOfTheCamera () {
    cubeMoveHelperObject.position.copy(camera.position)
    cubeMoveHelperObject.rotation.copy(camera.rotation)
    cubeMoveHelperObject.updateMatrix()
    cubeMoveHelperObject.translateZ(-50)
    cube.position.copy(cubeMoveHelperObject.position)
  }

  putCubeInFrontOfTheCamera()

  // animate
  function animate () {
    canvas.requestAnimationFrame(animate)

    // 这样的旋转使用坐标为 cube 自己的坐标, 并不能像 orbit control 那样直观
    // 只有对象有明显的上下左右时, 用户操作才更直观, 明白对象自身坐标, 单一个 cube 用户转一两下后会感觉, 咦, 咋方向反了, 乱转
    // manual mode
    if (lon !== last_lon ||
      lat !== last_lat) {

      // round y-axis
      if (gradient > 1) {
        cube.rotation.y = lon * 0.01
      }
      // round x-axis
      else {
        cube.rotation.x = lat * 0.01
      }
    }

    if (isMovingCube) {
      putCubeInFrontOfTheCamera()
    }

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

    cameraControls.update()

    renderer.render(scene, camera)
  }

  // events
  function bindEvents () {
    renderer.domElement.addEventListener('touchstart', onTouchStart, false)
    renderer.domElement.addEventListener('touchmove', onTouchMove, false)

    renderer.domElement.addEventListener('touchend', function (event) {
      touched = false
    })
  }

  function onTouch (event) {
    touched = true

    // normalize
    mouse.x = (event.touches[0].clientX / systemInfo.windowWidth) * 2 - 1
    mouse.y = -(event.touches[0].clientY / systemInfo.windowHeight) * 2 + 1
  }

  function onTouchStart (event) {
    onTouch(event)

    var touch = event.touches[0]
    touchX = touch.clientX
    touchY = touch.clientY
  }

  function onTouchMove (event) {
    onTouch(event)

    var touch = event.touches[0]
    var moveX = touch.clientX - touchX
    var moveY = touch.clientY - touchY
    lon += moveX
    lat += moveY
    touchX = touch.clientX
    touchY = touch.clientY
    gradient = Math.abs(moveX / moveY)
  }

  function toggleCubeMove (status) {
    isMovingCube = status
  }

  return {
    toggleCubeMove,
  }
}
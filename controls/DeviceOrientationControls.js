// 未在小程序版 three.js 里, 单独引入吧
import { MathUtils } from '../utils/MathUtils'

/**
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

var registerDeviceOrientationControls = function (THREE) {

  const { Euler, EventDispatcher, Quaternion, Vector3 } = THREE

  const isAndroid = wx.getSystemInfoSync().platform == 'android'

  // game 20ms, ui 60ms, normal 200ms
  const deviceMotionInterval = 'game'

  var DeviceOrientationControls = function (object) {

    var scope = this
    var changeEvent = { type: 'change' }
    var EPS = 0.000001

    this.object = object
    this.object.rotation.reorder('YXZ')

    this.enabled = true

    this.deviceOrientation = {}
    this.screenOrientation = 0

    this.alphaOffset = 0 // radians

    var onDeviceOrientationChangeEvent = function (event) {

      // 安卓上方向想反了, 取反一下
      if (isAndroid) {
        scope.deviceOrientation = {
          alpha: -event.alpha,
          beta: -event.beta,
          gamma: -event.gamma,
        }
        return
      }

      scope.deviceOrientation = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      }
    }

    var onScreenOrientationChangeEvent = function () {

      // 无 API 可用, 直接给 0, 似乎无影响
      scope.screenOrientation = 0

    }

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var setObjectQuaternion = function () {

      var zee = new Vector3(0, 0, 1)

      var euler = new Euler()

      var q0 = new Quaternion()

      var q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)) // - PI/2 around the x-axis

      return function (quaternion, alpha, beta, gamma, orient) {

        euler.set(beta, alpha, -gamma, 'YXZ') // 'ZXY' for the device, but 'YXZ' for us

        quaternion.setFromEuler(euler) // orient the device

        quaternion.multiply(q1) // camera looks out the back of the device, not the top

        quaternion.multiply(q0.setFromAxisAngle(zee, -orient)) // adjust for screen orientation

      }

    }()

    this.connect = function () {

      onScreenOrientationChangeEvent() // run once on load

      wx.onDeviceMotionChange(onDeviceOrientationChangeEvent)

      wx.startDeviceMotionListening({
        interval: deviceMotionInterval,
        success: function () {
          console.log('startDeviceMotionListening', 'success')
        },
        fail: function (error) {
          console.log('startDeviceMotionListening', error)
        },
      })

      scope.enabled = true

    }

    this.disconnect = function () {

      wx.offDeviceMotionChange(onDeviceOrientationChangeEvent)

      wx.stopDeviceMotionListening({
        success: function () {
          console.log('stopDeviceMotionListening', 'success')
        },
        fail: function (error) {
          console.log('stopDeviceMotionListening', error)
        },
      })

      scope.enabled = false

    }

    this.update = (function () {

      var lastQuaternion = new Quaternion()

      return function () {

        if (scope.enabled === false) return

        var device = scope.deviceOrientation

        if (device) {

          var alpha = device.alpha ? MathUtils.degToRad(device.alpha) + scope.alphaOffset : 0 // Z

          var beta = device.beta ? MathUtils.degToRad(device.beta) : 0 // X'

          var gamma = device.gamma ? MathUtils.degToRad(device.gamma) : 0 // Y''

          var orient = scope.screenOrientation ? MathUtils.degToRad(scope.screenOrientation) : 0 // O

          setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient)

          if (8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

            lastQuaternion.copy(scope.object.quaternion)
            scope.dispatchEvent(changeEvent)

          }

        }

      }

    })()

    this.dispose = function () {

      scope.disconnect()

    }

    this.connect()

  }

  DeviceOrientationControls.prototype = Object.create(EventDispatcher.prototype)
  DeviceOrientationControls.prototype.constructor = DeviceOrientationControls

  return { DeviceOrientationControls }

}

export default registerDeviceOrientationControls
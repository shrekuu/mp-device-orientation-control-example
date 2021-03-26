// const { createScopedThreejs } = require('threejs-miniprogram')
import { createScopedThreejs } from 'threejs-miniprogram'

const { renderCube } = require('../test-cases/cube')
const { renderCubes } = require('../test-cases/cubes')
const { renderSphere } = require('../test-cases/sphere')
const { renderModel } = require('../test-cases/model')

const app = getApp()

var cubeModel

Page({
  data: {
    isMovingCube: true,
  },
  onLoad: function () {

    console.log('在手机上预览')

    wx.createSelectorQuery()
      .select('#webgl')
      .node()
      .exec((res) => {
        const canvas = res[0].node
        this.canvas = canvas
        const THREE = createScopedThreejs(canvas)

        cubeModel = renderCube(canvas, THREE)
        // renderCubes(canvas, THREE)
        // renderSphere(canvas, THREE)
        // renderModel(canvas, THREE)
      })
  },
  touchStart(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchstart'})
  },
  touchMove(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchmove'})
  },
  touchEnd(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchend'})
  },
  toggleCubeMove()  {
    this.setData({
      isMovingCube: !this.data.isMovingCube
    })
    cubeModel.toggleCubeMove(this.data.isMovingCube)
  }
})

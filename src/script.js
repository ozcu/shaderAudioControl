import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import GUI from 'lil-gui'
import Microphone from './Microphone'


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0.3,0.0,0.0 ) //0x132020 
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 15
camera.position.y = 15
camera.position.z = 15
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * sphere
 */

const sphereGeo = new THREE.SphereGeometry( 8, 64, 64 )
const sphereMaterial = new THREE.ShaderMaterial({

    vertexShader:vertexShader,
    fragmentShader:fragmentShader,
    uniforms:{
        uTime:{value:0},
        uBigWaveElevation:{value:1},
        uFresnelMultiplier:{value:0.5}
    }
})

const sphere = new THREE.Mesh(sphereGeo,sphereMaterial)

scene.add(sphere)


/**
 * Audio
 */
const microphone = new Microphone()

//Volume
let variations = {}
variations.volume = {}
variations.volume.target = 0
variations.volume.current = 0
variations.volume.upEasing = 0.03
variations.volume.downEasing = 0.002
variations.volume.getValue = () =>
{
    const level0 = microphone.levels[0] || 0
    const level1 = microphone.levels[1] || 0
    const level2 = microphone.levels[2] || 0

    return Math.max(level0, level1, level2) * 3.0
}
variations.volume.getDefault = () =>
{
    return 0.152
}

//Medium Level
variations.lowLevel = {}
variations.lowLevel.target = 0
variations.lowLevel.current = 0
variations.lowLevel.upEasing = 0.008
variations.lowLevel.downEasing = 0.004
variations.lowLevel.getValue = () =>
{
    let value = microphone.levels[0] || 0
    value *= 4
    value += 0.25
    value = Math.max(0.25, value)

    return value
}
variations.lowLevel.getDefault = () =>
{
    return 0.25
}



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * GUI
 */
// const gui = new GUI()

// gui.add(sphereMaterial.uniforms.uBigWaveElevation, 'value').min(0.01).max(1.5).step(0.01).name('uBigWaveElevation')


/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const animateScene = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    //Update shader with time
    sphereMaterial.uniforms.uTime.value = elapsedTime

    sphereMaterial.uniforms.uBigWaveElevation.value = variations.volume.getValue()
     sphereMaterial.uniforms.uFresnelMultiplier.value = variations.lowLevel.getValue()
    //  console.log(variations.lowLevel.getValue())
    //Update Microphone
    microphone.update()
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call animateScene again on the next frame
    window.requestAnimationFrame(animateScene)
}

animateScene()
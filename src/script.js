import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x132020 )
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

const sphereGeo = new THREE.SphereGeometry( 5, 32, 32 )
const sphereMaterial = new THREE.ShaderMaterial({

    vertexShader:vertexShader,
    fragmentShader:fragmentShader,
    uniforms:{
        uTime:{value:0}
    }
})

const sphere = new THREE.Mesh(sphereGeo,sphereMaterial)

scene.add(sphere)

/**
 * Platform
 */
const plane = new THREE.PlaneGeometry(12,12)
const material = new THREE.MeshBasicMaterial( {color: 0x000478F, side: THREE.DoubleSide} )
const platform = new THREE.Mesh(plane,material)
scene.add(platform)
platform.position.set(0,-8,0)
platform.rotation.x = 8

/**
 * Audio
 */

let ready = false
let volume = 0
let levels = []
let stream = null



let analyserNode = {}
analyserNode.fftSize = 256
let byteFrequencyData = null
let floatTimeDomainData = null
const initAudio = ()=>{

    const audioContext = new AudioContext()
    const mediaStreamSourceNode = audioContext.createMediaStreamSource(stream)
    analyserNode = audioContext.createAnalyser()

    mediaStreamSourceNode.connect(analyserNode)
    floatTimeDomainData = new Float32Array(analyserNode.fftSize)
    byteFrequencyData = new Uint8Array(analyserNode.fftSize)

    ready = true

}
let spectrum= {}
    spectrum.width = analyserNode.fftSize
    spectrum.height = 128
    spectrum.halfHeight = Math.round(spectrum.height *0.5)
    spectrum.canvas = document.createElement('canvas')
    spectrum.canvas.width = spectrum.width
    spectrum.canvas.height = spectrum.height
    spectrum.canvas.style.position = 'fixed'
    spectrum.canvas.style.left = 0
    spectrum.canvas.style.bottom = 0
    spectrum.context = spectrum.canvas.getContext('2d')
    spectrum.context.fillStyle = '#ffffff'
document.body.append(spectrum.canvas)

spectrum.update = () =>
{
    spectrum.context.clearRect(0, 0, spectrum.width, spectrum.height)

    for(let i = 0; i < analyserNode.fftSize; i++)
    {
        // const floatTimeDomainValue = floatTimeDomainData[i]
        const byteFrequencyValue = byteFrequencyData[i]
        const normalizeByteFrequencyValue = byteFrequencyValue / 255

        const x = i
        const y = spectrum.height - (normalizeByteFrequencyValue * spectrum.height)
        const width = 1
        // const height = floatTimeDomainValue * spectrum.height
        const height = normalizeByteFrequencyValue * spectrum.height

        spectrum.context.fillRect(x, y, width, height)
    }
    
}

navigator.mediaDevices
    .getUserMedia({audio:true,video:false})
    .then((_stream)=>{
        stream = _stream

        initAudio()
        
    })

const getLevels=()=>
{
    const bufferLength = analyserNode.fftSize
    const levelCount = 8
    const levelBins = Math.floor(bufferLength / levelCount)

    
    let max = 0
    
    for(let i = 0; i < levelCount; i++)
    {
        let sum = 0

        for(let j = 0; j < levelBins; j++)
        {
            sum +=  byteFrequencyData[(i * levelBins) + j]
        }

        const value = sum / levelBins / 256
        levels[i] = value

        if(value > max)
            max = value
    }

    return levels
}

const getVolume=()=>
{
    let sumSquares = 0.0
    for(const amplitude of floatTimeDomainData)
    {
        sumSquares += amplitude * amplitude
    }
    volume = Math.sqrt(sumSquares / floatTimeDomainData.length)
    return volume
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



console.log(spectrum)
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

    //Update Microphone
    if(ready)
    {
        // Retrieve audio data
        analyserNode.getByteFrequencyData(byteFrequencyData)
        analyserNode.getFloatTimeDomainData(floatTimeDomainData)
        
        volume = getVolume()
        levels = getLevels()

        if(spectrum){
            spectrum.update()
        } 
        
    }
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call animateScene again on the next frame
    window.requestAnimationFrame(animateScene)
}

animateScene()
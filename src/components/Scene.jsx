import React, { useContext, useEffect, useState } from "react"
import * as THREE from "three"
import { SceneContext } from "./SceneContext"

export default function Scene({ characterModel }) {
  const { scene, setMousePosition, setCamera } =
    useContext(SceneContext)

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.x, y: event.y })
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  let loaded = false
  let [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // hacky prevention of double render
    if (loaded || isLoaded) return
    setIsLoaded(true)
    loaded = true

    characterModel.scene.position.set(-.4, .1, 0)
    // rotate 180 degrees
    characterModel.scene.rotation.y = Math.PI

    scene.add(characterModel.scene)

    // add a camera to the scene
    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )

    setCamera(camera)
    // set the camera position
    camera.position.set(0, 1.3, 2)

    // find editor-scene canvas
    const canvasRef = document.getElementById("editor-scene")

    // create a new renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }

    // add an eventlistener to resize the canvas when window changes
    window.addEventListener("resize", handleResize)

    // set the renderer size
    renderer.setSize(window.innerWidth, window.innerHeight)

    // set the renderer pixel ratio
    renderer.setPixelRatio(window.devicePixelRatio)

    // set the renderer output encoding
    renderer.outputEncoding = THREE.sRGBEncoding

    // start animation frame loop to render
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    // start the animation loop
    animate()

    return () => {
      removeEventListener("mousemove", handleMouseMove)
      removeEventListener("resize", handleMouseMove)
      if(characterModel) scene.remove(characterModel)
    }
  }, [])

  return <></>
}

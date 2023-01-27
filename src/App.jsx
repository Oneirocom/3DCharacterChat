import React, { Fragment, useContext, useEffect, useState } from "react"

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { ViewMode, ViewContext } from "./context/ViewContext"

import { AnimationManager } from "./library/animationManager"
import { BlinkManager } from "./library/blinkManager"
import { getAsArray } from "./library/utils"
import Background from "./components/Background"
import Scene from "./components/Scene"
import { EffectManager } from "./library/effectManager"

import Landing from "./pages/Landing"
import Mint from "./pages/Mint"
import View from "./pages/View"
import BioPage from "./pages/Bio"
import Save from "./pages/Save"
import Appearance from "./pages/Appearance"
import Create from "./pages/Create"
import Load from "./pages/Load"
import { SceneContext } from "./context/SceneContext"

// dynamically import the manifest
const assetImportPath = import.meta.env.VITE_ASSET_PATH + "/manifest.json"

async function fetchManifest() {
  const manifest = localStorage.getItem("manifest")
  if (manifest) {
    return JSON.parse(manifest)
  }
  const response = await fetch(assetImportPath)
  const data = await response.json()
  localStorage.setItem("manifest", JSON.stringify(data))
  return data
}

async function fetchScene() {
  // load environment
  const modelPath = "/3d/Platform.glb"

  const loader = new GLTFLoader()
  // load the modelPath
  const gltf = await loader.loadAsync(modelPath)
  return gltf.scene
}

async function fetchAnimation(templateInfo) {
  // create an animation manager for all the traits that will be loaded
  const newAnimationManager = new AnimationManager(templateInfo.offset)
  await newAnimationManager.loadAnimations(templateInfo.animationPath)
  return newAnimationManager
}

async function fetchAll() {
  const manifest = await fetchManifest()
  const sceneModel = await fetchScene()

  // check if templateIndex is set in localStorage
  // if not, set it to a random index
  let templateIndex = localStorage.getItem("templateIndex")

  if (!templateIndex) {
    templateIndex = Math.floor(Math.random() * manifest.length)
    localStorage.setItem("templateIndex", templateIndex)
  } else {
    templateIndex = parseInt(templateIndex)
  }
  const tempInfo = manifest[templateIndex]

  const animManager = await fetchAnimation(tempInfo)

  // check if initialTraits is set in localStorage
  // if not, set it to a random index
  let initialTraits = localStorage.getItem("initialTraits")
  if (!initialTraits) {
    initialTraits = initialTraits = [
      ...new Set([
        ...getAsArray(tempInfo.requiredTraits),
        ...getAsArray(tempInfo.randomTraits),
      ]),
    ]
    localStorage.setItem("initialTraits", JSON.stringify(initialTraits))
  } else {
    initialTraits = JSON.parse(initialTraits)
  }

  const blinkManager = new BlinkManager(0.1, 0.1, 0.5, 5)

  const effectManager = new EffectManager()

  return {
    manifest,
    sceneModel,
    tempInfo,
    animManager,
    initialTraits,
    blinkManager,
    effectManager,
  }
}

const fetchData = () => {
  let status, result

  const manifestPromise = fetchAll()
  // const modelPromise = fetchModel()
  const suspender = manifestPromise.then(
    (r) => {
      status = "success"
      result = r
    },
    (e) => {
      status = "error"
      result = e
    },
  )

  return {
    read() {
      if (status === "error") {
        throw result
      } else if (status === "success") {
        return result
      }
      throw suspender
    },
  }
}

const resource = fetchData()

export default function App() {
  const {
    manifest,
    sceneModel,
    tempInfo,
    initialTraits,
    animManager,
    blinkManager,
    effectManager,
  } = resource.read()

  const { viewMode } = useContext(ViewContext)

  const [hideUi, setHideUi] = useState(false)

  const [animationManager, setAnimationManager] = useState(animManager)

  const { camera, scene, templateInfo, setTemplateInfo} = useContext(SceneContext)
  effectManager.camera = camera
  effectManager.scene = scene

  //const [templateInfo, setTemplateInfo] = useState(tempInfo)

  // detect a double tap on the screen or a mouse click
  // switch the UI on and off
  let lastTap = 0

  useEffect(() => { 
    setTemplateInfo(tempInfo)
  }, [])

  useEffect(() => {
    const handleTap = (e) => {
      const now = new Date().getTime()
      const timesince = now - lastTap
      if (timesince < 300 && timesince > 10) {
        const tgt = e.target
        if (tgt.id == "editor-scene") setHideUi(!hideUi)
      }
      lastTap = now
    }
    window.addEventListener("touchend", handleTap)
    window.addEventListener("click", handleTap)
    return () => {
      window.removeEventListener("touchend", handleTap)
      window.removeEventListener("click", handleTap)
    }
  }, [hideUi])

  const fetchNewModel = (index) => {
    return new Promise((resolve) => {
      asyncResolve()
      async function asyncResolve() {
        setTemplateInfo(manifest[index])
        const animManager = await fetchAnimation(manifest[index])
        setAnimationManager(animManager)

        let initialTraits = localStorage.getItem("initialTraits")
        if (!initialTraits) {
          initialTraits = initialTraits = [
            ...new Set([
              ...getAsArray(manifest[index].requiredTraits),
              ...getAsArray(manifest[index].randomTraits),
            ]),
          ]
          localStorage.setItem("initialTraits", JSON.stringify(initialTraits))
        } else {
          initialTraits = JSON.parse(initialTraits)
        }
        setTimeout(() => {
          resolve(manifest[index])
        }, 2000)
      }
    })
  }

  // map current app mode to a page
  const pages = {
    [ViewMode.LANDING]: <Landing />,
    [ViewMode.APPEARANCE]: (
      <Appearance
        manifest={manifest}
        animationManager={animationManager}
        initialTraits={initialTraits}
        templateInfo={templateInfo}
        blinkManager={blinkManager}
        effectManager={effectManager}
        fetchNewModel={fetchNewModel}
      />
    ),
    [ViewMode.BIO]: <BioPage />,
    [ViewMode.CREATE]: <Create />,
    [ViewMode.LOAD]: <Load />,
    [ViewMode.MINT]: <Mint />,
    [ViewMode.SAVE]: <Save />,
    [ViewMode.VIEW]: <View />,
  }
  return (
    <Fragment>
      <Background />
      <Scene manifest={manifest} sceneModel={sceneModel} initialTraits={initialTraits} templateInfo={templateInfo} />
      {pages[viewMode]}
      {/*
        <Logo />
          <Scene manifest={manifest} sceneModel={sceneModel} initialTraits={initialTraits} templateInfo={templateInfo} />
          <div style = {{display:(hideUi ? "none" : "block")}}>
            <Fragment >
            <ChatButton />
           <ARButton /> 
          <UserMenu />
          {currentAppMode === AppMode.CHAT && <ChatComponent />}
          {currentAppMode === AppMode.APPEARANCE && <Editor />}
            </Fragment>
        </div>
          */}
    </Fragment>
  )
}

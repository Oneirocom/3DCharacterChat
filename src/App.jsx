import React, { Fragment, useContext, useEffect, useState } from "react"
import * as THREE from "three"
import styles from "./App.module.css"
import { BlinkManager } from "./library/blinkManager"
import Chat from "./components/Chat"
import { loadModel } from "./library/utils"
import Scene from "./components/Scene"
import Background from "./components/Background"
import {AnimationManager} from "./library/animationManager"

async function fetchAll() {
  const characterModel =  await loadModel("/3d/avatar.vrm")

  console.log('characterModel is', characterModel)

  const blinkManager = new BlinkManager(0.1, 0.1, 0.5, 5)
  const animationManager = new AnimationManager()
  await animationManager.loadAnimations("/3d/idle_drophunter.fbx")
  animationManager.startAnimation(characterModel)
  blinkManager.addBlinker(characterModel)

  return {
    characterModel,
    blinkManager,
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
  const [micEnabled, setMicEnabled] = React.useState(false)
  const [speechRecognition, setSpeechRecognition] = React.useState(false)

  const {
    characterModel,
  } = resource.read()

  const [hideUi, setHideUi] = useState(false)

  let lastTap = 0
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

  return (
    <Fragment>
      <Background />
      <Scene
        characterModel={characterModel}
      />
      <div className={styles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.topLine} />
        <div className={styles.bottomLine} />
        <div className={styles.scrollContainer}>
          <Chat
            micEnabled = {micEnabled}
            setMicEnabled = {setMicEnabled}
            speechRecognition = {speechRecognition}
            setSpeechRecognition = {setSpeechRecognition}
          />
        </div>
      </div>
    </div>
    </Fragment>
  )
}

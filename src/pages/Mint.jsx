import React from "react"
import styles from "./Mint.module.scss"
import { ViewMode, ViewContext } from "../context/ViewContext"

///<<<<<<< tcm-screenshot
///import Mint from "../components/Mint"
///=======
// import Mint from "../components/Mint"
// import ResizableDiv from "../components/Resizable"
///>>>>>>> full-mint-support
import CustomButton from "../components/custom-button"

function MintComponent({screenshotManager, blinkManager, animationManager}) {
  const { setViewMode } = React.useContext(ViewContext)
  // const [screenshotPosition,  setScreenshotPosition] = React.useState({x:250,y:25,width:256,height:256});

  const back = () => {
    setViewMode(ViewMode.SAVE)
  }

  const next = () => {
    setViewMode(ViewMode.CHAT)
  }

  function MenuTitle() {
    return (
      <div className={styles["mainTitleWrap"]}>
        <div className={styles["topLine"]} />
        <div className={styles["mainTitle"]}>Mint</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Mint Your Character</div>
///<<<<<<< tcm-screenshot
      ///<div className={styles.mintContainer}>
        ///<div className={styles.topLine} />
       /// <div className={styles.bottomLine} />
        ///<div className={styles.scrollContainer}>
          
         /// <Mint screenshotManager = {screenshotManager} blinkManager = {blinkManager} animationManager = {animationManager}/>
///=======
      
      {/* <ResizableDiv setScreenshotPosition = {setScreenshotPosition} screenshotPosition = {screenshotPosition}/> */}

      <div className={styles.mintContainer}>
        <MenuTitle />

        <div className={styles.mintButtonContainer}>
          <CustomButton
            size={16}
            theme="light"
            icon="polygon"
            text="Open Edition"
            className={styles.mintButton}
          />

          <div className={styles.divider}></div>

          <CustomButton
            size={16}
            theme="light"
            icon="tokens"
            text="Genesis Edition"
            className={styles.mintButton}
          />

          <span className={styles.genesisText}>(<span className={styles.required}>Genesis pass holders only</span>)</span>
///>>>>>>> full-mint-support
        </div>
      </div>

      <div className={styles.bottomContainer}>
        <CustomButton
          theme="light"
          text="Back"
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <CustomButton
          theme="light"
          text="Chat"
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
      </div>
    </div>
  )
}

export default MintComponent

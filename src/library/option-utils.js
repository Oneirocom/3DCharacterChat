import * as THREE from "three"
import { getAsArray } from "./utils"

export function getRandomizedTemplateOptions (template) {
  return getMultipleRandomTraits(getInitialTraits(template),template)
}

// const resetCurrentCharacter = () =>{
//   setSelectedOptions(
//     loadUserSelection(templateInfo.name)
//   )
// }
export function getInitialTraits(template){

  return[
    ...new Set([
      ...getAsArray(template.requiredTraits),
      ...getAsArray(template.randomTraits),
    ]),
  ]
}

export function getMultipleRandomTraits(traitNames, template) {
  const resultTraitOptions = []

  traitNames.map((traitName) => {
    const traitFound = template.traits.find(
      (trait) => trait.trait === traitName,
    )
    if (traitFound) {
      const options = getTraitOptions(traitFound, template)
      if (options?.length > 0)
        resultTraitOptions.push(
          options[Math.floor(Math.random() * options.length)],
        )
    }
  })
  return resultTraitOptions
}
export const getClassOptions = (manifest) => {
  const options = []
  manifest.map((character, index) => {
    options.push(getClassOption("class_" + index, character.thumbnail, index))
  })
  return options
}

export function getTraitOptions(trait, template) {
  const traitOptions = []
  const thumbnailBaseDir = template.thumbnailsDirectory
  trait.collection.map((item, index) => {
    const textureTraits = template.textureCollections.find(
      (texture) => texture.trait === item.textureCollection,
    )
    const colorTraits = template.colorCollections.find(
      (color) => color.trait === item.colorCollection,
    )

    // if no there is no collection defined for textures and colors, just grab the base option
    if (textureTraits == null && colorTraits == null) {
      const key = trait.name + "_" + index
      traitOptions.push(
        getOption(key, trait, item, thumbnailBaseDir + item.thumbnail),
      )
    }

    // in case we find collections of subtraits, add them as menu items
    if (textureTraits?.collection.length > 0) {
      textureTraits.collection.map((textureTrait, txtrIndex) => {
        const key = trait.name + "_" + index + "_txt" + txtrIndex
        const thumbnail = getThumbnail(item, textureTrait, txtrIndex)
        traitOptions.push(
          getOption(
            key,
            trait,
            item,
            thumbnailBaseDir + thumbnail,
            null,
            textureTrait,
          ),
        )
      })
    }
    if (colorTraits?.collection.length > 0) {
      colorTraits.collection.map((colorTrait, colIndex) => {
        const key = trait.name + "_" + index + "_col" + colIndex
        const thumbnail = getThumbnail(item, colorTrait, colIndex)
        traitOptions.push(
          getOption(
            key,
            trait,
            item,
            thumbnailBaseDir + thumbnail,
            getHSL(colorTrait.value[0], colorTrait.iconSaturation),
            null,
            colorTrait,
          ),
        )
      })
    }
  })
  return traitOptions
}

function getOption(
  key,
  trait,
  item,
  icon,
  iconHSL = null,
  textureTrait = null,
  colorTrait = null,
) {
  return {
    key,
    trait,
    item,
    icon,
    iconHSL,
    textureTrait,
    colorTrait,
  }
}
function getHSL (hex, overrideSaturation){
  const color = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  color.getHSL(hsl)
  hsl.s = overrideSaturation ? overrideSaturation : hsl.s
  return hsl
}

function getClassOption (key, icon, avatarIndex){
  return {
    key,
    icon,
    avatarIndex,
  }
}

function getThumbnail (item, subtrait, index) {
  // thumbnail override is the most important, check if its defined
  if (item.thumbnailOverrides)
    if (item.thumbnailOverrides[index]) return item.thumbnailOverrides[index]

  // if not, check if its defined in the subtrait (texture collection or color collection) or just grab the base thumbnail from the item
  return subtrait.thumbnail || item.thumbnail
}

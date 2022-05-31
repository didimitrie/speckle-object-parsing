
// Nodejs (backend) parsing of objects example relying on the speckle object loader.


import { fetch } from 'undici' // you do not need this in the browser, as speckle will rely on the default fetch
import ObjectLoader from '@speckle/objectloader'

const loader = new ObjectLoader({
  serverUrl: 'https://speckle.xyz',
  streamId: '0ec74dbb28',
  objectId: '6e5fd39d216302666c84a918a9ea6b18',
  // token: 'xxx' // use here the users's api token
  options: { enableCaching: false, fetch } // note, if used in the browser, this line shoud go away!
})

let total = 0
let processedCount = 0 
let allObjects = []
let ignoredSpeckleTypes = ['Objects.Geometry.Mesh', 'Objects.Other.RenderMaterial', 'Speckle.Core.Models.DataChunk']

let totalExteriorWallArea = 0
let totalExteriorCurtainWallArea = 0
let totalInteriorWallArea = 0

let exteriorWallTypes = ['Wall - Timber Clad', 'SIP 202mm Wall - conc clad'] // Note: these should most likely be user inputs
let curtainWallTypes = ['SH_Curtain wall'] // Note: these should most likely be user inputs
let intWallTypes = [] // Not used, we assume any other wall that is not anything from the above is an interior wall

let extWallChildElementIds = []
let intWallChildElementIds = []

console.log('First processing step start (main elements)')
// first pass: we iterate through all the objects as they get received from the api.
for await ( let obj of loader.getObjectIterator() ) {
  if( !total ) total = obj.totalChildrenCount // set the total children count from the first object
  processedCount++ 

  if(ignoredSpeckleTypes.indexOf(obj.speckle_type) !== -1) // ignore objects we know we don't need
    allObjects.push(obj)

  if(obj.speckle_type === 'Objects.BuiltElements.Wall:Objects.BuiltElements.Revit.RevitWall') {
    if(exteriorWallTypes.indexOf(obj.type) !== -1 ) {
      // const area = obj.baseLine.length * obj.height // one way of calculating the area - a bit more basic, and does not take into account window openings.
      totalExteriorWallArea += obj.parameters.HOST_AREA_COMPUTED.value  // another way of getting the area by relying on the revit prop itself; more reliable.

      // TODO: go through the obj.elements array, where the references to windows and doors are stored
      if(obj.elements) {
        extWallChildElementIds.push( ...obj.elements.map(el => el.referencedId))
      }
    } else if(curtainWallTypes.indexOf(obj.type) !== -1) {
      totalExteriorCurtainWallArea += obj.parameters.HOST_AREA_COMPUTED.value 
    } else {
      // TODO: Assume interior wall
      totalInteriorWallArea += obj.parameters.HOST_AREA_COMPUTED.value
      if(obj.elements) {
        intWallChildElementIds.push( ...obj.elements.map(el => el.referencedId))
      }
    }
  }

  // TODO: if roof
  // Note, roofs contain windows that need to be pushed by ids in "extWallChildElementIds"

  // TODO: if slab
  // - add area to total floor area
  // - check for building footprint (by level? by lowest centroid?)

  // TODO: if level, push to separate list and process afterwards for average floor height? 

}
console.log('Second processing step start (windows, doors)')

for(let id of extWallChildElementIds) {
  // TODO: push in ext door areas, ext window area
}

for(let id of intWallChildElementIds) {
  // TODO: push in int door areas, ext window area
}

console.log(`Ext wall area: ${totalExteriorWallArea} m2`)
console.log(`Curtain wall area: ${totalExteriorCurtainWallArea} m2`)
console.log(`Int wall area: ${totalInteriorWallArea} m2`)


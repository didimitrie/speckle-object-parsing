
// Nodejs (backend) parsing of objects example relying on the speckle object loader.


import { fetch } from 'undici'
import ObjectLoader from '@speckle/objectloader'

const loader = new ObjectLoader({
  serverUrl: 'https://speckle.xyz',
  streamId: '0ec74dbb28',
  objectId: '6e5fd39d216302666c84a918a9ea6b18',
  // token: 'xxx' // use here the users's api token
  options: { enableCaching: false, fetch } // note, if used in the browser, this line shoud go away!
})

let total = 0
let count = 0 
let allObjects = []

let totalExteriorWallArea = 0
let totalExteriorCurtainWallArea = 0
let totalInteriorWallArea = 0

let exteriorWallTypes = ['Wall - Timber Clad', 'SIP 202mm Wall - conc clad']
let curtainWallTypes = ['SH_Curtain wall']

let extWallElementIds = []
let intWallElementIds = []

// first pass: we iterate through all the objects as they get received from the api.
for await ( let obj of loader.getObjectIterator() ) {
  allObjects.push(obj)
  if( !total ) total = obj.totalChildrenCount // set the total children count from the first object

  if(obj.speckle_type === 'Objects.BuiltElements.Wall:Objects.BuiltElements.Revit.RevitWall') {
    if(exteriorWallTypes.indexOf(obj.type) !== -1 ) {
      // const area = obj.baseLine.length * obj.height // one way of calculating the area - a bit more basic, and does not take into account window openings.
      totalExteriorWallArea += obj.parameters.HOST_AREA_COMPUTED.value  // another way of getting the area by relying on the revit prop itself; more reliable.

      // TODO: go through the obj.elements array, where the references to windows and doors are stored
      if(obj.elements) {
        extWallElementIds.push( ...obj.elements.map(el => el.referencedId))
      }
    } else if(curtainWallTypes.indexOf(obj.type) !== -1) {
      totalExteriorCurtainWallArea += obj.parameters.HOST_AREA_COMPUTED.value 
    } else {
      // TODO: Assume interior wall
      totalInteriorWallArea += obj.parameters.HOST_AREA_COMPUTED.value
      if(obj.elements) {
        intWallElementIds.push( ...obj.elements.map(el => el.referencedId))
      }
    }
  }

  // TODO: if roof

  // TODO: if slab
  // - add area to total floor area
  // - check for footprint (by level? by lowest centroid?)

  // TODO: if level, push to separate list and process afterwards for average floor height? 

}

for(let id of extWallElementIds) {
  // TODO: push in ext door areas, ext window area
}

for(let id of intWallElementIds) {
  // TODO: push in int door areas, ext window area
}

console.log(`Ext wall area: ${totalExteriorWallArea} m2`)
console.log(`Curtain wall area: ${totalExteriorCurtainWallArea} m2`)
console.log(`Int wall area: ${totalInteriorWallArea} m2`)


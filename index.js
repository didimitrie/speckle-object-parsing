import { fetch } from 'undici'
import ObjectLoader from '@speckle/objectloader'

const loader = new ObjectLoader({
  serverUrl: 'https://speckle.xyz',
  streamId: '0ec74dbb28',
  objectId: '6e5fd39d216302666c84a918a9ea6b18',
  // token: 'xxx' // use here the users's api token
  options: { enableCaching: false, fetch }
})

let total = 0
let count = 0 

let totalExteriorWallArea = 0
let totalExteriorCurtainWallArea = 0
let totalInteriorWallArea = 0

let exteriorWallTypes = ['Wall - Timber Clad', 'SIP 202mm Wall - conc clad']
let curtainWallTypes = ['SH_Curtain wall']

for await ( let obj of loader.getObjectIterator() ) {
  if( !total ) total = obj.totalChildrenCount // set the total children count from the first object
  console.log( `Progress: ${count++}/${total}` )

  if(obj.speckle_type === 'Objects.BuiltElements.Wall:Objects.BuiltElements.Revit.RevitWall') {
    if(exteriorWallTypes.indexOf(obj.type) !== -1 ) {
      const area = obj.baseLine.length * obj.height // one way of calculating the area - a bit more basic
      totalExteriorWallArea += area
    } else if(curtainWallTypes.indexOf(obj.type !== -1)) {
      console.log(obj.parameters.HOST_AREA_COMPUTED)
    }
  }

}


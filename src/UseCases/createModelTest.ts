import * as fs from 'fs'
import * as vscode from 'vscode'
import { v4 as uuidv4 } from 'uuid'

interface ModelInput {
  name: string,
  propertyNames: string[]
}

function createModelTest (model: ModelInput, context: vscode.ExtensionContext) {
  const workspaceDirectory: string = vscode.workspace.rootPath || ''

  const modelTestsDirectory = `${workspaceDirectory}/${context.globalState.get('modelTestsDirectory')}`
  try {
    const doesModelTestsDirectoryExist = fs.existsSync(modelTestsDirectory)
    if (!doesModelTestsDirectoryExist) fs.mkdirSync(modelTestsDirectory)
  } catch {
    vscode.window.showErrorMessage('Ensure path to Model Tests directory exists and is set in Settings')
    return
  }

  const modelTestToCreateDirectory = `${modelTestsDirectory}/${model.name}`
  const doesMoodelToCreateDirectoryExist = fs.existsSync(modelTestToCreateDirectory)
  if (!doesMoodelToCreateDirectoryExist) fs.mkdirSync(modelTestToCreateDirectory)

  const modelTestToCreateFilePath = `${modelTestToCreateDirectory}/${model.name}Test.js`
  const doesModelFileExist = fs.existsSync(modelTestToCreateFilePath)
  if (doesModelFileExist) {
    return
  }

  const inputGetAssignments = model.propertyNames.map(p => {
    return `\n${p}: '${uuidv4()}',`
  })

  let inputGetAssignmentsAsString = ''
  inputGetAssignments.forEach(a => {
    inputGetAssignmentsAsString += a
  })

  const inputSetAssignments = model.propertyNames.map(p => {
    return `\n${p}: '${uuidv4()}',`
  })

  let inputSetAssignmentsAsString = ''
  inputSetAssignments.forEach(a => {
    inputSetAssignmentsAsString += a
  })

  const modelClassText = `import ${model.name} from '../../../${context.globalState.get('modelsDirectory')}/${model.name}/${model.name}.js'

    const getPropsTest = () => {
      const input = {${inputGetAssignmentsAsString}\n}

      const expectedOutput = {${inputGetAssignmentsAsString}\n}

      const modelInstance = new ${model.name}(input)
      const modelProps = modelInstance.props

      if (JSON.stringify(modelProps) === JSON.stringify(expectedOutput)) return true
      else return false
    }
    

    const setPropsTest = () => {
      const input = {${inputGetAssignmentsAsString}\n}

      const modifiedData = {${inputSetAssignmentsAsString}\n}

      const modelInstance = new ${model.name}(input)
      for (let key in modifiedData) {
        modelInstance[key] = modifiedData[key]
      }
      const modelProps = modelInstance.props

      if (JSON.stringify(modelProps) === JSON.stringify(modifiedData)) return true
      else return false
    }

    export default [
      { name: 'Model | Get ${model.name} Properties', test: getPropsTest },
      { name: 'Model | Set ${model.name} Properties', test: setPropsTest },
    ]
  `

  fs.writeFileSync(modelTestToCreateFilePath, modelClassText, 'utf-8')
  vscode.window.showInformationMessage('Successfully Create Model Test')
}

export default createModelTest

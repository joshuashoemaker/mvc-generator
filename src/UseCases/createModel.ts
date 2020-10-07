import * as fs from 'fs'
import * as vscode from 'vscode'

interface ModelInput {
  name: string,
  propertyNames: string[]
}

function createModel (model: ModelInput) {
  console.log(model)
  const workspaceDirectory: string = vscode.workspace.rootPath || ''

  const modelsDirectory = `${workspaceDirectory}/Models`
  const doesModelsDirectoryExist = fs.existsSync(modelsDirectory)
  if (!doesModelsDirectoryExist) fs.mkdirSync(modelsDirectory)

  const modelToCreateDirectory = `${modelsDirectory}/${model.name}`
  const doesMoodelToCreateDirectoryExist = fs.existsSync(modelToCreateDirectory)
  if (!doesMoodelToCreateDirectoryExist) fs.mkdirSync(modelToCreateDirectory)

  const modelToCreateFilePath = `${modelToCreateDirectory}/${model.name}.js`
  const doesModelFileExist = fs.existsSync(modelToCreateFilePath)
  if (doesModelFileExist) {
    vscode.window.showErrorMessage('Model Already Exists')
    return
  }

  const constructorAssignments = model.propertyNames.map(p => {
    return `\nthis.${p} = props.${p}`
  })

  let constructorAssignmentsAsString = ''
  constructorAssignments.forEach(a => {
    constructorAssignmentsAsString += a
  })

  const getterAndSetterMethods = model.propertyNames.map(p => {
    return `get ${p} () {
        return this._${p}
      }
    
      set ${p} (value) {
        this._${p} = value
        return this._${p}
      }

    `
  })

  let getterAndSetterMethodsAsString = ''
  getterAndSetterMethods.forEach(m => {
    getterAndSetterMethodsAsString += m
  })

  const modelClassText = `class ${model.name} {
      constructor (props = {}) {${constructorAssignmentsAsString}
      }

      ${getterAndSetterMethodsAsString}
    }

    export default ${model.name}
  `

  fs.writeFileSync(modelToCreateFilePath, modelClassText, 'utf-8')
}

export default createModel

import * as fs from 'fs'
import * as vscode from 'vscode'

interface ModelInput {
  name: string,
  propertyNames: string[]
}

function createModel (model: ModelInput, context: vscode.ExtensionContext) {
  const workspaceDirectory: string = vscode.workspace.rootPath || ''

  const modelsDirectory = `${workspaceDirectory}/${context.globalState.get('modelsDirectory')}`
  try {
    const doesModelsDirectoryExist = fs.existsSync(modelsDirectory)
    if (!doesModelsDirectoryExist) fs.mkdirSync(modelsDirectory)
  } catch {
    vscode.window.showErrorMessage('Ensure path to Models directory exists and is set in Settings')
    return
  }

  const modelToCreateDirectory = `${modelsDirectory}/${model.name}`
  const doesMoodelToCreateDirectoryExist = fs.existsSync(modelToCreateDirectory)
  if (!doesMoodelToCreateDirectoryExist) fs.mkdirSync(modelToCreateDirectory)

  const modelToCreateFilePath = `${modelToCreateDirectory}/${model.name}.js`
  const doesModelFileExist = fs.existsSync(modelToCreateFilePath)
  if (doesModelFileExist) {
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
    return `
    get ${p} () {
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

  const propsGetterObject = model.propertyNames.map(p => {
    return `\n${p}: this.${p},`
  })
  let propsGetterObjectAsString = ''
  propsGetterObject.forEach(p => {
    propsGetterObjectAsString += p
  })



  const modelClassText = `class ${model.name} {
      constructor (props = {}) {${constructorAssignmentsAsString}
      }
      ${getterAndSetterMethodsAsString}
      get props () {
        return {${propsGetterObjectAsString}
        }
      }
    }

    export default ${model.name}
  `

  fs.writeFileSync(modelToCreateFilePath, modelClassText, 'utf-8')
  vscode.window.showInformationMessage('Successfully Create Model')
}

export default createModel

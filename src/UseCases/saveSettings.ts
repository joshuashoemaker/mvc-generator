import * as vscode from 'vscode'

interface SettingsInput {
  modelsDirectory: string,
  modelTestsDirectory: string
}

function saveSettings (settings: SettingsInput, context: vscode.ExtensionContext) {
  context.globalState.update('modelsDirectory', settings.modelsDirectory)
  context.globalState.update('modelTestsDirectory', settings.modelTestsDirectory)

  vscode.window.showInformationMessage('Successfully Saved Settings')
}

export default saveSettings

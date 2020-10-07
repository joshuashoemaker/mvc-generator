import * as vscode from 'vscode'
import MVCForm from './Views/MVCForm'
import MVCSettings from './Views/MVCSettings'

export function activate(context: vscode.ExtensionContext) {
	let openFormCommand = vscode.commands.registerCommand('mvc-generator.openForm', () => {
		MVCForm.show(context.extensionUri, context)
	});

	let openSettingsCommand = vscode.commands.registerCommand('mvc-generator.openSettings', () => {
		MVCSettings.show(context.extensionUri, context)
	});

	context.subscriptions.push(openFormCommand)
	context.subscriptions.push(openSettingsCommand)
}

export function deactivate() {}

import * as vscode from 'vscode'
import MVCForm from './Views/MVCForm'

export function activate(context: vscode.ExtensionContext) {
	let openFormCommand = vscode.commands.registerCommand('mvc-generator.openForm', () => {
		vscode.window.showInformationMessage('Starting To Open Form')
		MVCForm.show(context.extensionUri)
	});

	context.subscriptions.push(openFormCommand)
}

export function deactivate() {}

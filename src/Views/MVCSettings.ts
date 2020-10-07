import * as vscode from 'vscode'
import saveSettings from '../UseCases/saveSettings'

class MVCSettings {
  public static currentPanel: MVCSettings | undefined
  public static readonly viewType = 'MVCSettings'
  private readonly _panel: vscode.WebviewPanel
  private readonly _extentionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []
  private context: vscode.ExtensionContext
  
  public static show (extentionUri: vscode.Uri, context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined
    
      if (MVCSettings.currentPanel) {
        MVCSettings.currentPanel._panel.reveal(column)
      }

      const panel = vscode.window.createWebviewPanel(
        MVCSettings.viewType,
        'MVC Form',
        column || vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(extentionUri, 'viewResources')]
        }
      )

      MVCSettings.currentPanel = new MVCSettings(panel, extentionUri, context)
  }

  public static revive (panel: vscode.WebviewPanel, extentionUri: vscode.Uri, context: vscode.ExtensionContext) {
    MVCSettings.currentPanel = new MVCSettings(panel, extentionUri, context)
  }

  private constructor (panel: vscode.WebviewPanel, extentionUri: vscode.Uri, context: vscode.ExtensionContext) {
    this._panel = panel
    this._extentionUri = extentionUri
    this.context = context

    this._update()

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    this._panel.onDidChangeViewState((e: any) => {
      if (this._panel.visible) this._update()
    },
    null,
    this._disposables
    )
  }

  public dispose () {
    MVCSettings.currentPanel = undefined
    this._panel.dispose()
    
    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) x.dispose()
    }
  }

  private _update () {
    const webview = this._panel.webview
    
    this._panel.title = 'MVC Settings'
    this._panel.webview.html = this._getHtmlForWebview(webview)
    this._panel.webview.onDidReceiveMessage((e: any) => {
      saveSettings(e, this.context)
    },
    undefined,
    this._disposables
    )
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const modelsDirectory = this.context.globalState.get('modelsDirectory')
    const modelTestsDirectory = this.context.globalState.get('modelTestsDirectory')
    return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MVC Settings</title>

      <style>
        button {
          color: white;
          background-color: rgb(75, 147, 255);
          border: solid rgb(49, 139, 255) 1px;
          border-radius: 4px;
          padding: 6px 10px;
          display: block;
          margin: 10px 0px;
        }

        label {
          display: block;
          margin-top: 6px;
        }

        input {
          display: block;
          background-color: rgba(255, 255, 255, 0.1);
          color: rgb(250, 250, 250);
          font-size: 16px;
          padding: 6px 10px;
          border: solid 1px rgb(196, 196, 196);
          margin-bottom: 6px;
        }
      </style>
    </head>

    <body>
      <label for="modelsDirectory">Models Directory</label>
      <input id="modelsDirectory" />

      <label for="modelTestsDirectory">Model Tests Directory</label>
      <input id="modelTestsDirectory" />


      <button onclick="submit()">Save</button>
    </body>

    <script>
      const vscode = acquireVsCodeApi()

      document.getElementById('modelsDirectory').value = '${modelsDirectory}'
      document.getElementById('modelTestsDirectory').value = '${modelTestsDirectory}'
      
      function submit() {
        vscode.postMessage(
          {
            modelsDirectory: document.getElementById('modelsDirectory').value,
            modelTestsDirectory: document.getElementById('modelTestsDirectory').value
          }
        )
      }
    </script>

    </html>
    `
  }
}

export default MVCSettings


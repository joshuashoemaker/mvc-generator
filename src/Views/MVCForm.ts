import * as vscode from 'vscode'
import createModel from '../UseCases/createModel'

class MVCForm {
  public static currentPanel: MVCForm | undefined
  public static readonly viewType = 'mvcForm'
  private readonly _panel: vscode.WebviewPanel
  private readonly _extentionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []
  
  public static show (extentionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined
    
      if (MVCForm.currentPanel) {
        MVCForm.currentPanel._panel.reveal(column)
      }

      const panel = vscode.window.createWebviewPanel(
        MVCForm.viewType,
        'MVC Form',
        column || vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(extentionUri, 'viewResources')]
        }
      )

      MVCForm.currentPanel = new MVCForm(panel, extentionUri)
  }

  public static revive (panel: vscode.WebviewPanel, extentionUri: vscode.Uri) {
    MVCForm.currentPanel = new MVCForm(panel, extentionUri)
  }

  private constructor (panel: vscode.WebviewPanel, extentionUri: vscode.Uri) {
    this._panel = panel
    this._extentionUri = extentionUri

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
    MVCForm.currentPanel = undefined
    this._panel.dispose()
    
    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) x.dispose()
    }
  }

  private _update () {
    const webview = this._panel.webview
    
    this._panel.title = 'MVC Generator'
    this._panel.webview.html = this._getHtmlForWebview(webview)
    this._panel.webview.onDidReceiveMessage((e: any) => {
      createModel(e)
    },
    undefined,
    this._disposables
    )
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // const controllerOnDisk = vscode.Uri.joinPath(this._extentionUri, 'Controllers', 'mvcFormController.js')
    // const controllerUri = webview.asWebviewUri(controllerOnDisk)

    return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MVC Generator</title>
    
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
      <label for="modelName"> Model Name</label>
      <input id="modelName" />
    
      <div id="propertyList">
        <h4>Properties</h4>
        <input class="propertyNameInput" />
      </div>
      <button onclick="addProperty()">Add Property</button>
    
      <br />
      <button onclick="submit()">Generate</button>
    </body>
    
    <script>
      const vscode = acquireVsCodeApi()
    
      function addProperty () {
        const input = document.createElement('input')
        input.setAttribute('class', 'propertyNameInput')
        
        const newPropertyElement = document.createElement('div')
        newPropertyElement.appendChild(input)
    
        const listElement = document.getElementById('propertyList')
        listElement.appendChild(newPropertyElement)
    
        input.focus()
      }
      
      function submit() {
        const inputs = document.querySelectorAll('.propertyNameInput') || []
        const propertyNames = [...inputs].map(i => i.value)
        
        vscode.postMessage(
          {
            name: document.getElementById('modelName').value,
            propertyNames: propertyNames
          }
        )
      }
    </script>
    
    </html>
    `
  }
}

export default MVCForm


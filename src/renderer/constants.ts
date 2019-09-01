import Path from 'path'
import electron, { OpenDialogOptions } from 'electron'
import DEFAULT_AVATAR_PATH from './images/default-avatar.png'

export { DEFAULT_AVATAR_PATH }

export const FILE_DIALOG_OPTIONS: OpenDialogOptions = {
  properties: ['openFile'],
}

export const AUDIO_DIALOG_OPTIONS: OpenDialogOptions = {
  properties: ['openFile'],
  filters: [{ name: 'Audio', extensions: ['mp3', 'ogg', 'wav'] }],
}

export const IMAGE_DIALOG_OPTIONS: OpenDialogOptions = {
  properties: ['openFile'],
  filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] }],
}

export const PDF_DIALOG_OPTIONS: OpenDialogOptions = {
  properties: ['openFile'],
  filters: [{ name: 'PDF files', extensions: ['pdf'] }],
}

// Prefer NAME if explicitly set.
// Otherwise look for OS-level USER (Mac / Linux) or USERNAME (Windows.)
export const USER = process.env.NAME || process.env.USER || process.env.USERNAME

if (!USER) {
  throw new Error('No user name found')
}

// We want these constants available from both the main and render threads.
const app = electron.app || electron.remote.app
export const DATA_PATH = app.getPath('userData')
export const USER_PATH = Path.join(DATA_PATH, 'pushpin-v10', USER)

export const WORKSPACE_URL_PATH = Path.join(USER_PATH, 'workspace-id.json')
export const HYPERMERGE_PATH = Path.join(USER_PATH, 'hypermerge')
export const HYPERFILE_PATH = Path.join(USER_PATH, 'hyperfile')

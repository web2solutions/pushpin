import React, { useContext, useRef } from 'react'
import { DocUrl } from 'hypermerge'

import Automerge from 'automerge'
import {
  createDocumentLink,
  PushpinUrl,
  parseDocumentLink,
  HypermergeUrl,
} from '../../../ShareLink'

import { DEFAULT_AVATAR_PATH } from '../../../constants'
import Content, { ContentProps } from '../../Content'
import { ContactDoc, ContactDocInvites } from '.'
import { FileDoc } from '../files'

import ColorPicker from '../../ColorPicker'
import { useDocument } from '../../../Hooks'
import Heading from '../../Heading'
import SecondaryText from '../../SecondaryText'

import { CurrentDeviceContext } from '../workspace/Device'
import { importFileList } from '../../../ImportData'
import ConnectionStatusBadge from './ConnectionStatusBadge'
import { useConnectionStatus } from '../../../PresenceHooks'
import Badge from '../../Badge'
import CenteredStack from '../../CenteredStack'
import { without } from '../../../Misc'
import ContactEditorDevice from './ContactEditorDevice'
import ListMenuSection from '../../ListMenuSection'
import ListMenuItem from '../../ListMenuItem'
import TitleEditor from '../../TitleEditor'
import ListItem from '../../ListItem'
import ListMenu from '../../ListMenu'
import { USER_COLORS } from './Constants'
import './ContactEditor.css'

export default function ContactEditor(props: ContentProps) {
  const [doc, changeDoc] = useDocument<ContactDoc>(props.hypermergeUrl)
  const [avatarImageDoc] = useDocument<FileDoc>(doc && doc.avatarDocId)
  const { hyperfileUrl: avatarHyperfileUrl = null } = avatarImageDoc || {}

  const currentDeviceId = useContext(CurrentDeviceContext)
  const hiddenFileInput = useRef<HTMLInputElement>(null)
  const status = useConnectionStatus(props.hypermergeUrl)

  const { hypermergeUrl: selfUrl } = props

  if (!doc) {
    return null
  }

  function setColor(color: { hex: string }) {
    changeDoc((d) => {
      d.color = color.hex
    })
  }

  const { color, devices, invites } = doc

  const onImportClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click()
    }
  }

  // xxx: only allow images & only one
  const onFilesChanged = (e) => {
    importFileList(e.target.files, (url) =>
      changeDoc((doc) => {
        const { hypermergeUrl } = parseDocumentLink(url)
        doc.avatarDocId = hypermergeUrl
      })
    )
  }

  function removeDevice(url: PushpinUrl) {
    const { hypermergeUrl: deviceUrl } = parseDocumentLink(url)
    changeDoc((d) => {
      const devices = d.devices as Automerge.List<DocUrl>
      if (!devices) {
        return
      }
      without(deviceUrl, devices)
    })
  }

  return (
    <CenteredStack centerText={false}>
      <ListMenu>
        <div className="ContactEditor-heading">
          <Heading>Edit Profile...</Heading>
        </div>
        {renderNameEditor(props.hypermergeUrl)}
        {renderAvatarEditor(avatarHyperfileUrl, onFilesChanged, hiddenFileInput, onImportClick)}
        {renderPresenceColorSelector(color, setColor)}
        {renderDevices(devices, status, selfUrl, removeDevice, currentDeviceId)}
        {renderShares(invites)}
      </ListMenu>
    </CenteredStack>
  )
}

const renderNameEditor = (hypermergeUrl) => (
  <ListMenuSection title="Display Name">
    <ListMenuItem>
      <TitleEditor field="name" url={hypermergeUrl} />
    </ListMenuItem>
  </ListMenuSection>
)

const renderAvatarEditor = (avatarHyperfileUrl, onFilesChanged, hiddenFileInput, onImportClick) => {
  return (
    <ListMenuSection title="Avatar">
      <ListMenuItem>
        <Badge img={avatarHyperfileUrl || DEFAULT_AVATAR_PATH} />
        <CenteredStack direction="row">
          <input
            type="file"
            id="hiddenImporter"
            accept="image/*"
            onChange={onFilesChanged}
            ref={hiddenFileInput}
            style={{ display: 'none' }}
          />
          <button type="button" onClick={onImportClick}>
            Choose from file...
          </button>
        </CenteredStack>
      </ListMenuItem>
    </ListMenuSection>
  )
}

const renderPresenceColorSelector = (color, setColor) => (
  <ListMenuSection title="Presence Color">
    <ListMenuItem>
      <ColorPicker color={color} colors={Object.values(USER_COLORS)} onChangeComplete={setColor} />
    </ListMenuItem>
    <ListMenuItem>
      <SecondaryText>
        Your presence colour will be used by other authors to identify you when you are present
        within a document.
      </SecondaryText>
    </ListMenuItem>
  </ListMenuSection>
)

const renderDevices = (devices, status, selfUrl, removeDevice, currentDeviceId) => {
  if (!devices) {
    return <SecondaryText>Something is wrong, you should always have a device!</SecondaryText>
  }
  const renderedDevices = devices
    .map((deviceUrl: HypermergeUrl) => createDocumentLink('device', deviceUrl))
    .map((deviceId: PushpinUrl) => (
      <ContactEditorDevice
        key={deviceId}
        selfUrl={selfUrl}
        deviceId={deviceId}
        onRemoveDevice={removeDevice}
        isCurrentDevice={deviceId === currentDeviceId}
      />
    ))

  const title = (
    <>
      <ConnectionStatusBadge size="small" hover={false} contactId={selfUrl} />
      Devices
    </>
  )

  return (
    <ListMenuSection title={title}>
      {renderedDevices}
      {status !== 'connected' ? (
        <ListMenuItem key="storage-peer-hint">
          <ListItem>
            <Badge backgroundColor="#00000000" size="medium" icon="cloud" />
            <SecondaryText>
              Consider adding{' '}
              <a href="https://github.com/mjtognetti/pushpin-peer">a storage peer</a> to keep your
              data online when PushPin is offline or closed.
            </SecondaryText>
          </ListItem>
        </ListMenuItem>
      ) : null}
    </ListMenuSection>
  )
}

const renderShares = (invites: ContactDocInvites) => {
  return (
    <ListMenuSection title="Shares">
      {invites ? (
        Object.entries(invites).map(([contact, shares]) => (
          <ListMenuItem key={contact}>
            <Content context="list" url={createDocumentLink('contact', contact as DocUrl)} />
            <SecondaryText>{shares.length} items shared</SecondaryText>
          </ListMenuItem>
        ))
      ) : (
        <ListMenuItem>
          <Heading>No shares...</Heading>
        </ListMenuItem>
      )}
    </ListMenuSection>
  )
}

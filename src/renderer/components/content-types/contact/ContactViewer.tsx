import React from 'react'
import { DocUrl } from 'hypermerge'

import { createDocumentLink, PushpinUrl, HypermergeUrl } from '../../../ShareLink'

import { DEFAULT_AVATAR_PATH } from '../../../constants'
import Content, { ContentProps } from '../../Content'
import { ContactDoc, ContactDocInvites } from '.'
import { FileDoc } from '../files'

import { useDocument } from '../../../Hooks'
import Heading from '../../Heading'
import SecondaryText from '../../SecondaryText'

import ConnectionStatusBadge from './ConnectionStatusBadge'
import Badge from '../../Badge'
import CenteredStack from '../../CenteredStack'
import ListMenuSection from '../../ListMenuSection'
import ListMenuItem from '../../ListMenuItem'

import './ContactEditor.css'
import ListMenu from '../../ListMenu'

export default function ContactViewer(props: ContentProps) {
  const { hypermergeUrl: contactUrl } = props
  const [doc] = useDocument<ContactDoc>(contactUrl)
  const [avatarImageDoc] = useDocument<FileDoc>(doc && doc.avatarDocId)
  const { hyperfileUrl: avatarHyperfileUrl = null } = avatarImageDoc || {}

  if (!doc) {
    return null
  }
  const { devices, invites } = doc

  return (
    <CenteredStack centerText={false}>
      <ListMenu>
        <ListMenuSection title="Display Name">
          <ListMenuItem>
            <Heading>{doc.name}</Heading>
          </ListMenuItem>
        </ListMenuSection>
        <ListMenuSection title="Avatar">
          <ListMenuItem>
            <Badge img={avatarHyperfileUrl || DEFAULT_AVATAR_PATH} />
          </ListMenuItem>
        </ListMenuSection>
        {renderDevices(devices, contactUrl)}
        {renderShares(invites)}
      </ListMenu>
    </CenteredStack>
  )
}

const renderDevices = (devices: DocUrl[] | undefined, contactUrl: HypermergeUrl) => {
  if (!devices) {
    return <SecondaryText>Something is wrong, you should always have a device!</SecondaryText>
  }
  const renderedDevices = devices
    .map((deviceUrl: HypermergeUrl) => createDocumentLink('device', deviceUrl))
    .map((deviceId: PushpinUrl) => (
      <Content key={deviceId} context="list" url={deviceId} editable />
    ))

  const title = (
    <>
      <ConnectionStatusBadge size="small" hover={false} contactId={contactUrl} />
      Devices
    </>
  )

  return <ListMenuSection title={title}>{renderedDevices}</ListMenuSection>
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

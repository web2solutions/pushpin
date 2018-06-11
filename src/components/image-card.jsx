import React from 'react'
import PropTypes from 'prop-types'
import Debug from 'debug'

import ContentTypes from '../content-types'

const log = Debug('pushpin:image-card')

export default class ImageCard extends React.PureComponent {
  static propTypes = {
    docId: PropTypes.string.isRequired
  }

  static initializeDocument = (image, { hyperfileId }) => {
    image.hyperfileId = hyperfileId
  }

  state = {}

  componentDidMount = () => {
    this.handle = window.hm.openHandle(this.props.docId)
    this.handle.onChange((doc) => this.setState({ ...doc }))

    log('componentDidMount')
  }

  render = () => {
    log('render')

    if (this.state.hyperfile && this.state.hyperfile.key) {
      return (
        <p>
          Error: This image uses an outdated version of hyperfile,
          please delete and re-upload.
        </p>
      )
    }

    if (!this.state.hyperfileId) {
      // we used to show some kind of stand-in value but we don't have a design
      // for one that works everywhere the image works, so for now: nothing.
      return null
    }

    return <img className="image" alt="" src={`hyperfile://${this.state.hyperfileId}`} />
  }
}

ContentTypes.register({
  component: ImageCard,
  type: 'image',
  name: 'Image',
  icon: 'image'
})

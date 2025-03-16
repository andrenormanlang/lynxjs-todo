import { furniturePictures } from './pictures/furniturePictures.tsx'
import ImageCard from './imageCard.tsx'
import { TodoApp } from './todoApp.tsx'
import "tailwindcss/utilities.css";


import { root } from '@lynx-js/react'
import Gallery from './gallery.tsx'

function FirstImageCard() {
  return <Gallery pictureData={furniturePictures}/>
}

const items = [
  "This is a text 1",
  "This is a text 1",
  "This is a text 1",
  "This is a text 1",
  "This is a text 1",
  "This is a text 1",
  "This is a text 1",
  "This is a text 1",
  "This is a text 1",
  "This is a text 1",
]

// root.render(<FirstImageCard />)
root.render(<TodoApp items={items} />)

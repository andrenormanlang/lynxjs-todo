import "./index.css";
import type { Picture } from "./pictures/furniturePictures.tsx";

export default function ImageCard(props: { picture: Picture }) {
  const { picture } = props;
  return (
    <view className="picture-wrapper">
      <image
        className="image"
        style={{ width: "100%", aspectRatio: picture.width / picture.height }}
        src={picture.src}
      />
    </view>
  );
}

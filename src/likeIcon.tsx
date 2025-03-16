import { useState } from "@lynx-js/react";
import redHeart from "./pictures/redHeart.png";
import whiteHeart from "./pictures/whiteHeart.png";
import "./index.css";

export default function LikeIcon() {
  const [isLiked, setIsLiked] = useState(false);
  const onTap = () => {
    setIsLiked(true);
  };
  return (
    <view className="like-icon" bindtap={onTap}>
      {isLiked && <view className="circle" />}
      {isLiked && <view className="circle circleAfter" />}
      <image src={isLiked ? redHeart : whiteHeart} className="heart-love" />
    </view>
  );
}

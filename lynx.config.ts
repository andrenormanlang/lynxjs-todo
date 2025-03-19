import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'

export default defineConfig({
  output: {
    dataUriLimit: Number.MAX_SAFE_INTEGER,
  },
  plugins: [
    pluginReactLynx(),
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
	//return `${url}?fullscreen=true`
        return `http://192.168.0.4:3000/main.lynx.bundle?fullscreen=true`
      },
    }),
  ],
})



// Android/iOS: ship pre-rendered artwork instead of relying on native SVG filter,
// gradient and mask support. The original SVG remains the canonical editable asset.
// Web continues using the original SVGR transformer for development previews.
const path = require("path");
const fs = require("fs");
const svgTransformer = require("react-native-svg-transformer");
const babelTransformer = svgTransformer.getExpoTransformer();

module.exports.transform = ({ src, filename, options, ...rest }) => {
  if (!filename.endsWith(".svg") || options?.platform === "web") {
    return svgTransformer.transform({ src, filename, options, ...rest });
  }
  const png = filename.replace(/\.svg$/, ".png");
  if (!fs.existsSync(png)) throw new Error(`Missing native raster artwork: ${png}`);
  const localAsset = `./${path.basename(png)}`;
  const code = `
    const React = require("react");
    const { Image } = require("react-native");
    const rasterSource = require(${JSON.stringify(localAsset)});
    function NativeArt({width, height, style, preserveAspectRatio, accessibilityLabel, ...rest}) {
      const resizeMode = preserveAspectRatio === "none" ? "stretch" :
        (typeof preserveAspectRatio === "string" && preserveAspectRatio.includes("slice") ? "cover" : "contain");
      return React.createElement(Image, {
        source: rasterSource,
        resizeMode,
        accessibilityLabel,
        style: [{ width: width === undefined ? "100%" : width,
                  height: height === undefined ? "100%" : height }, style],
      });
    }
    NativeArt.rasterSource = rasterSource;
    module.exports = NativeArt;
    module.exports.default = NativeArt;
  `;
  return babelTransformer.transform({ src: code, filename, options, ...rest });
};

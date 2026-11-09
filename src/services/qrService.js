import QRCodeLib from "qrcode";

export class QRService {
  static async toDataURL(text, options = {}) {
    return QRCodeLib.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: options.width || 400,
      color: {
        dark: options.foregroundColor || "#000000",
        light: options.backgroundColor || "#FFFFFF"
      }
    });
  }

  static async toBuffer(text, options = {}) {
    return QRCodeLib.toBuffer(text, {
      type: "png",
      errorCorrectionLevel: "H",
      margin: 2,
      width: options.width || 600,
      color: {
        dark: options.foregroundColor || "#000000",
        light: options.backgroundColor || "#FFFFFF"
      }
    });
  }

  static async toSVG(text, options = {}) {
    return QRCodeLib.toString(text, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 2,
      width: options.width || 600,
      color: {
        dark: options.foregroundColor || "#000000",
        light: options.backgroundColor || "#FFFFFF"
      }
    });
  }
}

export default QRService;

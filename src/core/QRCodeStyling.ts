import getMode from "../tools/getMode";
import mergeDeep from "../tools/merge";
import downloadURI from "../tools/downloadURI";
import QRSVG from "./QRSVG";

import defaultOptions, { RequiredOptions } from "./QROptions";
import sanitizeOptions from "../tools/sanitizeOptions";
import { QRCode, Options } from "../types";
import qrcode from "qrcode-generator";

export default class QRCodeStyling {
  _options: RequiredOptions;
  _container?: HTMLElement;
  _svg?: QRSVG;
  _qr?: QRCode;
  _canvasDrawingPromise?: Promise<void>;
  _svgDrawingPromise?: Promise<void>;

  constructor(options?: Partial<Options>) {
    this._options = options ? sanitizeOptions(mergeDeep(defaultOptions, options) as RequiredOptions) : defaultOptions;
    this.update();
  }

  static _clearContainer(container?: HTMLElement): void {
    if (container) {
      container.innerHTML = "";
    }
  }

  async _getQRStylingElement(): Promise<QRSVG> {
    if (!this._qr) throw "QR code is empty";

    let promise, svg: QRSVG;

    if (this._svg && this._svgDrawingPromise) {
      svg = this._svg;
      promise = this._svgDrawingPromise;
    } else {
      svg = new QRSVG(this._options);
      promise = svg.drawQR(this._qr);
    }

    await promise;

    return svg;
  }

  update(options?: Partial<Options>): void {
    QRCodeStyling._clearContainer(this._container);
    this._options = options ? sanitizeOptions(mergeDeep(this._options, options) as RequiredOptions) : this._options;

    if (!this._options.data) {
      return;
    }

    this._qr = qrcode(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
    this._qr.addData(this._options.data, this._options.qrOptions.mode || getMode(this._options.data));
    this._qr.make();

    this._svg = new QRSVG(this._options);
    this._svgDrawingPromise = this._svg.drawQR(this._qr);
    this._canvasDrawingPromise = undefined;

    this.append(this._container);
  }

  append(container?: HTMLElement): void {
    if (!container) {
      return;
    }

    if (typeof container.appendChild !== "function") {
      throw "Container should be a single DOM node";
    }

    if (this._svg) {
      container.appendChild(this._svg.getElement());
    }

    this._container = container;
  }

  async getRawData(): Promise<Blob | null> {
    if (!this._qr) throw "QR code is empty";
    const element = await this._getQRStylingElement();
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(((element as unknown) as QRSVG).getElement());

    return new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + source], { type: "image/svg+xml" });
  }

  async download(filename = "qr"): Promise<void> {
    if (!this._qr) throw "QR code is empty";

    const element = await this._getQRStylingElement();
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(((element as unknown) as QRSVG).getElement());

    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    downloadURI(url, `${filename}.svg`);
  }
}

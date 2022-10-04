import QRSVG from "./QRSVG";
import { RequiredOptions } from "./QROptions";
import { QRCode, Options } from "../types";
export default class QRCodeStyling {
    _options: RequiredOptions;
    _container?: HTMLElement;
    _svg?: QRSVG;
    _qr?: QRCode;
    _canvasDrawingPromise?: Promise<void>;
    _svgDrawingPromise?: Promise<void>;
    constructor(options?: Partial<Options>);
    static _clearContainer(container?: HTMLElement): void;
    _getQRStylingElement(): Promise<QRSVG>;
    update(options?: Partial<Options>): void;
    append(container?: HTMLElement): void;
    getRawData(): Promise<Blob | null>;
    download(filename?: string): Promise<void>;
}

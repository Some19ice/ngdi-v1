declare module "leaflet" {
  export type LatLngExpression =
    | LatLng
    | [number, number]
    | [number, number, number]
    | { lat: number; lng: number; alt?: number }
  export type LatLngBoundsExpression =
    | LatLngBounds
    | LatLngExpression[]
    | [LatLngExpression, LatLngExpression]

  export class LatLng {
    constructor(lat: number, lng: number, alt?: number)
    lat: number
    lng: number
    alt?: number
    equals(otherLatLng: LatLng, maxMargin?: number): boolean
    toString(): string
    distanceTo(otherLatLng: LatLng): number
    wrap(): LatLng
    toBounds(sizeInMeters: number): LatLngBounds
  }

  export class LatLngBounds {
    constructor(southWest: LatLngExpression, northEast: LatLngExpression)
    constructor(latlngs: LatLngExpression[])
    extend(latlng: LatLngExpression): this
    extend(bounds: LatLngBoundsExpression): this
    pad(bufferRatio: number): LatLngBounds
    getCenter(): LatLng
    getSouthWest(): LatLng
    getNorthEast(): LatLng
    getNorthWest(): LatLng
    getSouthEast(): LatLng
    getWest(): number
    getSouth(): number
    getEast(): number
    getNorth(): number
    contains(otherBounds: LatLngBoundsExpression): boolean
    contains(latlng: LatLngExpression): boolean
    intersects(otherBounds: LatLngBoundsExpression): boolean
    overlaps(otherBounds: LatLngBoundsExpression): boolean
    toBBoxString(): string
    equals(otherBounds: LatLngBoundsExpression): boolean
    isValid(): boolean
  }

  export interface MapOptions {
    center?: LatLngExpression
    zoom?: number
    preferCanvas?: boolean
    maxBounds?: LatLngBoundsExpression
    maxZoom?: number
    minZoom?: number
    [key: string]: any
  }

  export interface LayerOptions {
    attribution?: string
    [key: string]: any
  }

  export interface TileLayerOptions extends LayerOptions {
    maxZoom?: number
    minZoom?: number
    [key: string]: any
  }

  export interface MarkerOptions {
    icon?: Icon
    draggable?: boolean
    keyboard?: boolean
    title?: string
    alt?: string
    zIndexOffset?: number
    opacity?: number
    riseOnHover?: boolean
    riseOffset?: number
    [key: string]: any
  }

  export interface RectangleOptions {
    color?: string
    weight?: number
    opacity?: number
    fillColor?: string
    fillOpacity?: number
    [key: string]: any
  }

  export interface IconOptions {
    iconUrl?: string
    iconRetinaUrl?: string
    iconSize?: Point | [number, number]
    iconAnchor?: Point | [number, number]
    popupAnchor?: Point | [number, number]
    shadowUrl?: string
    shadowRetinaUrl?: string
    shadowSize?: Point | [number, number]
    shadowAnchor?: Point | [number, number]
    className?: string
    [key: string]: any
  }

  export class Layer {
    addTo(map: Map): this
    remove(): this
    removeFrom(map: Map): this
    getPane(name?: string): HTMLElement | undefined
    bindPopup(
      content: string | HTMLElement | Function | Popup,
      options?: PopupOptions
    ): this
    unbindPopup(): this
    openPopup(latlng?: LatLngExpression): this
    closePopup(): this
    bindTooltip(
      content: string | HTMLElement | Function | Tooltip,
      options?: TooltipOptions
    ): this
    unbindTooltip(): this
    openTooltip(latlng?: LatLngExpression): this
    closeTooltip(): this
    on(type: string, fn: Function, context?: any): this
    off(type: string, fn?: Function, context?: any): this
  }

  export class TileLayer extends Layer {
    constructor(urlTemplate: string, options?: TileLayerOptions)
  }

  export class Marker extends Layer {
    constructor(latlng: LatLngExpression, options?: MarkerOptions)
    setLatLng(latlng: LatLngExpression): this
    getLatLng(): LatLng
    setZIndexOffset(offset: number): this
    setIcon(icon: Icon): this
    setOpacity(opacity: number): this
  }

  export class Rectangle extends Layer {
    constructor(bounds: LatLngBoundsExpression, options?: RectangleOptions)
    setBounds(bounds: LatLngBoundsExpression): this
  }

  export class Icon {
    constructor(options: IconOptions)
  }

  export class DivIcon extends Icon {
    constructor(options?: IconOptions)
  }

  export class Point {
    constructor(x: number, y: number, round?: boolean)
    x: number
    y: number
    add(otherPoint: Point): Point
    subtract(otherPoint: Point): Point
    multiplyBy(number: number): Point
    divideBy(number: number): Point
    toString(): string
  }

  export class Popup {
    constructor(options?: PopupOptions, source?: Layer)
    setLatLng(latlng: LatLngExpression): this
    setContent(content: string | HTMLElement): this
    openOn(map: Map): this
    close(): this
  }

  export interface PopupOptions {
    maxWidth?: number
    minWidth?: number
    maxHeight?: number
    autoPan?: boolean
    autoPanPaddingTopLeft?: Point | [number, number]
    autoPanPaddingBottomRight?: Point | [number, number]
    autoPanPadding?: Point | [number, number]
    keepInView?: boolean
    closeButton?: boolean
    closeOnClick?: boolean
    [key: string]: any
  }

  export class Tooltip {
    constructor(options?: TooltipOptions, source?: Layer)
    setLatLng(latlng: LatLngExpression): this
    setContent(content: string | HTMLElement): this
    openOn(map: Map): this
    close(): this
  }

  export interface TooltipOptions {
    permanent?: boolean
    sticky?: boolean
    direction?: string
    opacity?: number
    [key: string]: any
  }

  export class FeatureGroup extends Layer {
    constructor(layers?: Layer[])
    addLayer(layer: Layer): this
    removeLayer(layer: Layer): this
    clearLayers(): this
    getBounds(): LatLngBounds
  }

  export class Map {
    constructor(element: string | HTMLElement, options?: MapOptions)
    getCenter(): LatLng
    setView(center: LatLngExpression, zoom?: number, options?: any): this
    setZoom(zoom: number, options?: any): this
    getZoom(): number
    getBounds(): LatLngBounds
    fitBounds(bounds: LatLngBoundsExpression, options?: any): this
    panTo(latlng: LatLngExpression, options?: any): this
    addLayer(layer: Layer): this
    removeLayer(layer: Layer): this
    hasLayer(layer: Layer): boolean
    eachLayer(fn: (layer: Layer) => void, context?: any): this
    openPopup(popup: Popup): this
    openPopup(
      content: string | HTMLElement,
      latlng: LatLngExpression,
      options?: PopupOptions
    ): this
    closePopup(popup?: Popup): this
    openTooltip(tooltip: Tooltip): this
    openTooltip(
      content: string | HTMLElement,
      latlng: LatLngExpression,
      options?: TooltipOptions
    ): this
    closeTooltip(tooltip?: Tooltip): this
    invalidateSize(options?: {
      animate?: boolean
      pan?: boolean
      debounceMoveend?: boolean
    }): this
    remove(): this
    on(type: string, fn: Function, context?: any): this
    off(type: string, fn?: Function, context?: any): this
  }

  export function map(element: string | HTMLElement, options?: MapOptions): Map
  export function tileLayer(
    urlTemplate: string,
    options?: TileLayerOptions
  ): TileLayer
  export function marker(
    latlng: LatLngExpression,
    options?: MarkerOptions
  ): Marker
  export function rectangle(
    bounds: LatLngBoundsExpression,
    options?: RectangleOptions
  ): Rectangle
  export function featureGroup(layers?: Layer[]): FeatureGroup
  export function icon(options: IconOptions): Icon
  export function divIcon(options?: IconOptions): DivIcon
  export function point(x: number, y: number, round?: boolean): Point
  export function latLng(
    latitude: number,
    longitude: number,
    altitude?: number
  ): LatLng
  export function latLng(
    coords:
      | [number, number]
      | [number, number, number]
      | { lat: number; lng: number; alt?: number }
  ): LatLng
  export function latLngBounds(
    southWest: LatLngExpression,
    northEast: LatLngExpression
  ): LatLngBounds
  export function latLngBounds(latlngs: LatLngExpression[]): LatLngBounds
}

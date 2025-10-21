import * as L from "leaflet";

declare module "leaflet" {
  interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean;
    spiderfyOnMaxZoom?: boolean;
    zoomToBoundsOnClick?: boolean;
    maxClusterRadius?: number | ((zoom: number) => number);
  }

  interface MarkerClusterGroup extends L.FeatureGroup {
    addLayer(layer: L.Layer): this;
    clearLayers(): this;
    removeLayer(layer: L.Layer): this;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
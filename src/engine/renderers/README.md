# Scene Renderers

The renderer layer converts scene configuration into Remotion visuals.

- MapLayerRenderer resolves a dataset from DatasetRegistry.
- GeographicMap draws geographic features, routes, and markers.
- TextLayerRenderer displays positioned text.
- ImageLayerRenderer displays positioned images.
- SceneRenderer combines the visual layers in scene order.
- SceneCompositor connects SceneTimeline to SceneRenderer.

Route and marker layers are geographic overlays. They are drawn inside
GeographicMap so they use the same geographic projection, camera rotation,
and zoom as the map.

Audio, infographic, custom rendering, and transition animation are not
implemented by this stage.

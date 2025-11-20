import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  ZoomIn,
  ZoomOut,
  MyLocation,
  Layers,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material'

// Importações Leaflet (lazy loaded)
let L: any = null

interface MapViewerProps {
  /** Latitude inicial */
  latitude?: number
  /** Longitude inicial */
  longitude?: number
  /** Nível de zoom inicial (1-18) */
  zoom?: number
  /** Altura do mapa */
  height?: string | number
  /** Marcadores a exibir */
  markers?: Array<{
    id: string
    lat: number
    lng: number
    title?: string
    description?: string
    color?: 'red' | 'blue' | 'green' | 'orange' | 'yellow' | 'violet' | 'grey' | 'black'
  }>
  /** Polígonos a exibir (imóveis, setores fiscais, etc.) */
  polygons?: Array<{
    id: string
    coordinates: Array<[number, number]>
    title?: string
    fillColor?: string
    strokeColor?: string
  }>
  /** Callback quando um marcador é clicado */
  onMarkerClick?: (markerId: string) => void
  /** Callback quando um polígono é clicado */
  onPolygonClick?: (polygonId: string) => void
  /** Callback quando o mapa é movido */
  onMapMove?: (center: { lat: number; lng: number }, zoom: number) => void
  /** Mostrar controles */
  showControls?: boolean
  /** Permitir fullscreen */
  allowFullscreen?: boolean
}

export const MapViewer: React.FC<MapViewerProps> = ({
  latitude = -23.5505,  // São Paulo como padrão
  longitude = -46.6333,
  zoom = 13,
  height = '500px',
  markers = [],
  polygons = [],
  onMarkerClick,
  onPolygonClick,
  onMapMove,
  showControls = true,
  allowFullscreen = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any[]>([])
  const polygonsLayerRef = useRef<any[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentLayer, setCurrentLayer] = useState<'streets' | 'satellite'>('streets')

  // Carregar Leaflet dinamicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        setLoading(true)

        // Carregar Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
        }

        // Carregar Leaflet JS
        L = (window as any).L
        if (!L) {
          await import('leaflet')
          L = (window as any).L

          // Fix do ícone padrão do Leaflet
          delete (L.Icon.Default.prototype as any)._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          })
        }

        setLoading(false)
      } catch (err) {
        console.error('Erro ao carregar Leaflet:', err)
        setError('Erro ao carregar o mapa. Verifique sua conexão.')
        setLoading(false)
      }
    }

    loadLeaflet()
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || !L || loading) return

    // Criar mapa se não existe
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: zoom,
        zoomControl: false, // Vamos criar controles customizados
      })

      // Adicionar camada de ruas (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)

      // Listener de movimento do mapa
      if (onMapMove) {
        mapInstanceRef.current.on('moveend', () => {
          const center = mapInstanceRef.current.getCenter()
          const zoom = mapInstanceRef.current.getZoom()
          onMapMove({ lat: center.lat, lng: center.lng }, zoom)
        })
      }
    }

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [loading, L])

  // Atualizar marcadores
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return

    // Remover marcadores antigos
    markersLayerRef.current.forEach(marker => marker.remove())
    markersLayerRef.current = []

    // Adicionar novos marcadores
    markers.forEach(marker => {
      const icon = marker.color ? L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${marker.color}.png`,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }) : undefined

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .addTo(mapInstanceRef.current)

      // Popup
      if (marker.title || marker.description) {
        const popupContent = `
          ${marker.title ? `<b>${marker.title}</b><br/>` : ''}
          ${marker.description || ''}
        `
        leafletMarker.bindPopup(popupContent)
      }

      // Click
      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker.id))
      }

      markersLayerRef.current.push(leafletMarker)
    })

    // Ajustar visualização para mostrar todos os marcadores
    if (markers.length > 0 && polygons.length === 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]))
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [markers, L])

  // Atualizar polígonos
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return

    // Remover polígonos antigos
    polygonsLayerRef.current.forEach(polygon => polygon.remove())
    polygonsLayerRef.current = []

    // Adicionar novos polígonos
    polygons.forEach(poly => {
      const leafletPolygon = L.polygon(poly.coordinates, {
        fillColor: poly.fillColor || '#3388ff',
        fillOpacity: 0.4,
        color: poly.strokeColor || '#3388ff',
        weight: 2,
      }).addTo(mapInstanceRef.current)

      // Popup
      if (poly.title) {
        leafletPolygon.bindPopup(`<b>${poly.title}</b>`)
      }

      // Click
      if (onPolygonClick) {
        leafletPolygon.on('click', () => onPolygonClick(poly.id))
      }

      polygonsLayerRef.current.push(leafletPolygon)
    })

    // Ajustar visualização para mostrar todos os polígonos
    if (polygons.length > 0) {
      const bounds = L.latLngBounds(polygons.flatMap(p => p.coordinates))
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [polygons, L])

  // Funções de controle
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 16)

            // Adicionar marcador temporário
            L.marker([latitude, longitude], {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            })
              .addTo(mapInstanceRef.current)
              .bindPopup('Você está aqui')
              .openPopup()
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          setError('Não foi possível obter sua localização')
        }
      )
    }
  }

  const toggleLayer = () => {
    if (!mapInstanceRef.current || !L) return

    // Remover todas as camadas
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current.removeLayer(layer)
      }
    })

    // Adicionar nova camada
    if (currentLayer === 'streets') {
      // Mudar para satélite
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
      setCurrentLayer('satellite')
    } else {
      // Mudar para ruas
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
      setCurrentLayer('streets')
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (loading) {
    return (
      <Paper sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    )
  }

  return (
    <Paper
      sx={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        height: isFullscreen ? '100vh' : height,
        zIndex: isFullscreen ? 9999 : 1,
      }}
    >
      <Box ref={mapRef} sx={{ height: '100%', width: '100%' }} />

      {/* Controles customizados */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
            <Tooltip title="Zoom In" placement="left">
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out" placement="left">
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut />
              </IconButton>
            </Tooltip>
          </Paper>

          <Paper>
            <Tooltip title="Minha Localização" placement="left">
              <IconButton onClick={handleMyLocation} size="small">
                <MyLocation />
              </IconButton>
            </Tooltip>
          </Paper>

          <Paper>
            <Tooltip
              title={currentLayer === 'streets' ? 'Satélite' : 'Ruas'}
              placement="left"
            >
              <IconButton onClick={toggleLayer} size="small">
                <Layers />
              </IconButton>
            </Tooltip>
          </Paper>

          {allowFullscreen && (
            <Paper>
              <Tooltip
                title={isFullscreen ? 'Sair do Fullscreen' : 'Fullscreen'}
                placement="left"
              >
                <IconButton onClick={toggleFullscreen} size="small">
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            </Paper>
          )}
        </Box>
      )}

      {/* Legenda */}
      {(markers.length > 0 || polygons.length > 0) && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 1000,
            p: 1,
            maxWidth: 200,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
            Legenda
          </Typography>
          {markers.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              {markers.length} marcador(es)
            </Typography>
          )}
          {polygons.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              {polygons.length} área(s)
            </Typography>
          )}
        </Paper>
      )}
    </Paper>
  )
}

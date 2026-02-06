# 📡 Visualizador de Patrones de Radiación de Antenas

**Universidad de Oriente**  
Facultad de Ingenierías en Telecomunicaciones, Informática y Biomédica  
Asignatura: Optativa I - Aplicaciones Web  
Semestre I - 2026

---

## 📋 Descripción del Proyecto

Aplicación web interactiva para visualizar y analizar patrones de radiación de diferentes tipos de antenas utilizadas en sistemas de telecomunicaciones. La aplicación permite ajustar parámetros específicos de cada antena y observar en tiempo real cómo estos cambios afectan los patrones de radiación en 2D y 3D.

### ✨ Características Principales

- **4 Tipos de Antenas**: Dipolo, Monopolo, Arreglo de 2 elementos, y Yagi
- **Visualización 2D**: Patrones polares en los planos azimutal y de elevación
- **Visualización 3D**: Proyección isométrica del patrón tridimensional
- **Controles Dinámicos**: Parámetros ajustables específicos para cada tipo de antena
- **Análisis en Tiempo Real**: Cálculos automáticos de ganancia, ancho de haz y relación frente-espalda
- **Modos de Visualización**: Escala logarítmica (dB) y escala lineal (potencia normalizada)
- **Diseño Responsive**: Adaptable a dispositivos móviles, tablets y escritorio
- **Accesibilidad**: Cumple con estándares WCAG AA
- **Captura de Imágenes**: Exportación de las visualizaciones en formato PNG

---

## 🎯 Objetivos Cumplidos

### Objetivos Técnicos
✅ HTML5 semántico con uso correcto de etiquetas estructurales  
✅ CSS3 con Grid y Flexbox para diseño responsive  
✅ JavaScript moderno (ES6+) con módulos y funciones flecha  
✅ Canvas API para visualizaciones gráficas dinámicas  
✅ SVG para efectos y gradientes  
✅ Accesibilidad con ARIA labels y navegación por teclado  

### Objetivos Académicos
✅ Integración de conocimientos de desarrollo frontend  
✅ Implementación de interfaz de usuario avanzada  
✅ Diseño responsive y profesional  
✅ Visualizaciones técnicas dinámicas  
✅ Cálculos electromagnéticos precisos  

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Variables CSS, Grid, Flexbox, Animaciones
- **JavaScript ES6+**: Módulos, Arrow Functions, Destructuring
- **Canvas API**: Renderizado 2D y 3D de patrones

### Fuentes
- **Orbitron** (Google Fonts): Títulos y elementos destacados
- **Share Tech Mono** (Google Fonts): Texto de cuerpo y valores técnicos

### Herramientas de Desarrollo
- Editor de código (VS Code, Sublime Text, etc.)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Git (opcional, para control de versiones)

---

## 📦 Estructura del Proyecto

```
antenna-radiation-visualizer/
│
├── index.html          # Página principal (HTML)
├── styles.css          # Estilos de la aplicación (CSS)
├── script.js           # Lógica de la aplicación (JavaScript)
├── README.md           # Este archivo (Documentación)
│
└── assets/             # Carpeta opcional para recursos adicionales
    └── screenshots/    # Capturas de pantalla de la aplicación
```

---

## 🚀 Instalación y Uso

### Requisitos Previos

- **Navegador Web Moderno**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Conexión a Internet**: Necesaria solo para cargar las fuentes de Google Fonts
- **Servidor Web Local** (opcional): Para desarrollo local

### Opción 1: Uso Directo (Recomendado)

1. **Descargar los archivos**:
   bash
   # Descargar o clonar el repositorio
   git clone https://github.com/tu-usuario/antenna-radiation-visualizer.git
   

2. Abrir el archivo HTML:
   - Navega hasta la carpeta del proyecto
   - Haz doble clic en `index.html`
   - El archivo se abrirá en tu navegador predeterminado

3. ¡Listo!: La aplicación estará funcionando completamente

### Opción 2: Servidor Web Local

Usando Python 3:
bash
cd antenna-radiation-visualizer
python -m http.server 8000

Luego abre en tu navegador: `http://localhost:8000`

Usando Node.js (http-server):
bash
npm install -g http-server
cd antenna-radiation-visualizer
http-server -p 8000

Luego abre en tu navegador: `http://localhost:8000`

Usando VS Code:
- Instala la extensión "Live Server"
- Clic derecho en `index.html`
- Selecciona "Open with Live Server"



## 📖 Guía de Uso

### 1. Seleccionar Tipo de Antena

En el panel de configuración, selecciona uno de los cuatro tipos disponibles:

- **Dipolo**: Antena básica de media onda
- **Monopolo**: Antena sobre plano de tierra
- **Arreglo 2λ**: Sistema de dos elementos
- **Yagi**: Antena direccional con directores

### 2. Ajustar Parámetros

Cada antena tiene controles específicos:

**Dipolo**:
- Longitud: 0.1λ a 2λ (óptimo en 0.5λ)

**Monopolo**:
- Longitud: 0.1λ a 1λ (óptimo en 0.25λ)

**Arreglo**:
- Separación: 0.1λ a 2λ
- Diferencia de fase: -180° a +180°

**Yagi**:
- Número de directores: 1 a 10

### 3. Elegir Modo de Visualización

- **Ganancia (dBi)**: Escala logarítmica, mejor para analizar lóbulos secundarios
- **Potencia Normalizada**: Escala lineal, mejor para ver distribución real de energía

### 4. Interpretar Resultados

El panel de resultados muestra:

- **Ganancia Directiva (dBi)**: Concentración de energía en la dirección principal
- **Ancho del Haz**: Ángulo entre los puntos de -3dB (half-power)
- **Relación Frente-Espalda**: Comparación entre radiación frontal y trasera

### 5. Capturar Imágenes

Haz clic en "📸 Capturar Imagen" para descargar una imagen PNG con todas las visualizaciones.

---

## 🎨 Paleta de Colores

La aplicación utiliza una paleta técnica inspirada en software de simulación electromagnética:

| Color | Código HEX | Uso |
|-------|-----------|-----|
| Cyan | `#00d4ff` | Elementos primarios, destacados |
| Magenta | `#ff006e` | Acentos, gradientes |
| Amarillo | `#ffbe0b` | Botones activos, alertas |
| Verde | `#00ff88` | Resultados, confirmaciones |
| Azul Oscuro | `#0a0e1a` | Fondo principal |

### Escala de Colores del Patrón

El patrón de radiación usa una escala espectral:
- **Azul** (0, 0, 255): Intensidad mínima (-30 dB)
- **Cyan** (0, 255, 255): Intensidad baja (-20 dB)
- **Verde** (0, 255, 0): Intensidad media (-10 dB)
- **Amarillo** (255, 255, 0): Intensidad alta (-5 dB)
- **Rojo** (255, 0, 0): Intensidad máxima (0 dB)

---

## 🔬 Fundamentos Técnicos

### Cálculos Electromagnéticos

La aplicación implementa fórmulas precisas de teoría de antenas:

**Dipolo**:
```
E(θ) = [cos(kL·cos(θ)) - cos(kL)] / sin(θ)
```
Donde k = 2π/λ y L es la longitud

**Monopolo**:
Similar al dipolo pero con factor 2 por efecto del plano de tierra

**Arreglo**:
```
AF(θ,φ) = cos(ψ/2)
ψ = 2π·d·sin(θ)·cos(φ) + β
```
Donde d es la separación y β la diferencia de fase

**Yagi**:
Modelo simplificado con directividad basada en número de elementos

### Parámetros Calculados

**Ganancia Directiva**:
```
D = 10·log₁₀(U_max / U_avg)
```

**Ancho del Haz (HPBW)**:
Ángulo entre puntos de -3dB (potencia mitad)

**Relación Frente-Espalda**:
```
F/B = 10·log₁₀(P_front / P_back)
```

---

## 🔧 Configuración Avanzada

### Modificar Resolución de Canvas

En `script.js`, ajusta la configuración:

```javascript
const CONFIG = {
  CANVAS_RESOLUTION: {
    azimut: { width: 500, height: 500 },    // Cambiar aquí
    elevacion: { width: 500, height: 500 }, // Cambiar aquí
    threeD: { width: 1000, height: 500 }    // Cambiar aquí
  },
  PATTERN_SAMPLES: 360,  // Puntos de muestreo (más = mayor precisión)
  // ... más configuraciones
};
```

### Modificar Rango de dB

```javascript
const CONFIG = {
  DB_MIN: -30,  // dB mínimo mostrado
  DB_MAX: 0,    // dB máximo mostrado
  // ...
};
```

### Personalizar Colores

En `styles.css`, modifica las variables CSS:

```css
:root {
  --accent-cyan: #00d4ff;      /* Cambiar color principal */
  --accent-magenta: #ff006e;   /* Cambiar color secundario */
  /* ... más variables */
}
```

---

## 📱 Compatibilidad

### Navegadores Soportados

| Navegador | Versión Mínima | Estado |
|-----------|---------------|--------|
| Chrome | 90+ | ✅ Totalmente compatible |
| Firefox | 88+ | ✅ Totalmente compatible |
| Safari | 14+ | ✅ Totalmente compatible |
| Edge | 90+ | ✅ Totalmente compatible |
| Opera | 76+ | ✅ Totalmente compatible |

### Dispositivos

- ✅ **Desktop**: 1920×1080, 1366×768, 1280×720
- ✅ **Tablet**: iPad, Android tablets
- ✅ **Móvil**: iPhone, Android (responsive)

### Características Requeridas

- Canvas 2D Context
- CSS Grid y Flexbox
- ES6+ JavaScript
- CSS Custom Properties (variables)

---

## 🐛 Solución de Problemas

### La aplicación no se carga

**Problema**: Pantalla en blanco  
**Solución**: 
- Verifica que los archivos `styles.css` y `script.js` estén en la misma carpeta que `index.html`
- Abre la consola del navegador (F12) y verifica errores
- Asegúrate de tener conexión a internet para cargar las fuentes

### Los gráficos no se muestran

**Problema**: Canvas vacíos  
**Solución**:
- Verifica que tu navegador soporte Canvas
- Actualiza tu navegador a la última versión
- Desactiva extensiones que puedan bloquear JavaScript

### Los controles no responden

**Problema**: Los sliders no actualizan los gráficos  
**Solución**:
- Recarga la página (Ctrl+F5 o Cmd+R)
- Verifica que JavaScript esté habilitado
- Limpia la caché del navegador

### Problemas de rendimiento

**Problema**: La aplicación va lenta  
**Solución**:
- Reduce la resolución del canvas en la configuración
- Cierra otras pestañas del navegador
- Usa un navegador más moderno

---

## 📊 Casos de Uso Educativos

### 1. Comparación de Antenas

**Objetivo**: Comparar ganancia de dipolo λ/2 vs monopolo λ/4

**Pasos**:
1. Selecciona Dipolo, ajusta longitud a 0.5λ
2. Observa ganancia: ~2.15 dBi
3. Selecciona Monopolo, ajusta longitud a 0.25λ
4. Observa ganancia: ~5.15 dBi
5. Conclusión: Monopolo tiene 3 dB más por efecto del plano de tierra

### 2. Efecto del Espaciamiento en Arreglos

**Objetivo**: Observar cómo la separación afecta la directividad

**Pasos**:
1. Selecciona Arreglo 2λ
2. Ajusta separación de 0.1λ a 2λ gradualmente
3. Observa cambios en ancho del haz y ganancia
4. Óptimo: separación ~0.5λ con fase 0°

### 3. Análisis de Yagi

**Objetivo**: Estudiar ganancia vs número de elementos

**Pasos**:
1. Selecciona Yagi
2. Varía directores de 1 a 10
3. Observa incremento de ganancia (~1.2 dB por director)
4. Nota el estrechamiento del haz principal

---

## 🎓 Referencias Técnicas

### Libros Recomendados

1. **Balanis, C. A.** (2016). *Antenna Theory: Analysis and Design* (4th ed.). Wiley.
2. **Stutzman, W. L., & Thiele, G. A.** (2012). *Antenna Theory and Design* (3rd ed.). Wiley.
3. **Kraus, J. D., & Marhefka, R. J.** (2002). *Antennas: For All Applications* (3rd ed.). McGraw-Hill.

### Recursos en Línea

- [Antenna Theory](https://www.antenna-theory.com/) - Tutorial interactivo de antenas
- [Electromagnetic Waves and Antennas](https://www.ece.rutgers.edu/~orfanidi/ewa/) - Libro online de Orfanidis
- [ITU Resources](https://www.itu.int/) - Organización Internacional de Telecomunicaciones

### Estándares y Especificaciones

- IEEE Standard 145-2013: IEEE Standard for Definitions of Terms for Antennas
- ITU-R P.526: Propagation by diffraction
- ETSI EN 302 326: Fixed Radio Systems

---

## 👥 Créditos

**Desarrollado por**: George Medina Mena y Tahimi Noa Peña 
**Universidad**: Universidad de Oriente  
**Asignatura**: Optativa I - Aplicaciones Web  
**Profesor**: [Juan Garcia Perez]  
**Fecha**: Enero 2026

### Tecnologías Open Source Utilizadas

- Google Fonts (Orbitron, Share Tech Mono)
- Canvas API (HTML5)
- CSS Grid y Flexbox
- JavaScript ES6+

---

## 📄 Licencia

Este proyecto es de carácter educativo y está desarrollado para fines académicos en la Universidad de Oriente.

---

## 📞 Contacto y Soporte

Para preguntas, sugerencias o reportar problemas:

- **Correo**: [georgemedinamena@gmail.com]
- **GitHub Issues**: [URL del repositorio]/issues
- **Profesor**: [correo-profesor@universidad.edu]

---

## 🔄 Historial de Versiones

### v1.0.0 (Enero 2026)
- ✨ Versión inicial
- ✅ 4 tipos de antenas implementados
- ✅ Visualización 2D y 3D
- ✅ Cálculos electromagnéticos precisos
- ✅ Diseño responsive completo
- ✅ Modo ganancia y potencia normalizada
- ✅ Captura de screenshots

---

## 🚀 Mejoras Futuras (Roadmap)

- [ ] Más tipos de antenas (patch, helicoidal, bocina)
- [ ] Exportación de datos a CSV/JSON
- [ ] Comparación lado a lado de múltiples antenas
- [ ] Modo oscuro/claro
- [ ] Animaciones de transición entre patrones
- [ ] Integración con bibliotecas de graficación (Chart.js)
- [ ] Soporte para idiomas múltiples
- [ ] Tutorial interactivo integrado
- [ ] Modo offline (PWA)
- [ ] Calculadora de alcance y cobertura

---

## 🙏 Agradecimientos

Agradecimiento especial a:
- Universidad de Oriente por el apoyo académico
- Profesores de la Facultad de Ingenierías
- Comunidad de desarrolladores web
- Autores de recursos educativos de teoría de antenas

---

**¡Gracias por usar el Visualizador de Patrones de Radiación de Antenas!** 📡✨

Si encuentras útil este proyecto, considera darle una ⭐ en GitHub.

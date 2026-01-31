    'use strict';

    // ==================== CONSTANTS & CONFIGURATION ====================
    const CONFIG = {
      CANVAS_RESOLUTION: {
        azimut: { width: 500, height: 500 },
        elevacion: { width: 500, height: 500 },
        threeD: { width: 1000, height: 500 }
      },
      PATTERN_SAMPLES: 360,
      THETA_STEPS_3D: 24,
      PHI_STEPS_3D: 48,
      DB_MIN: -30,
      DB_MAX: 0,
      GRID_LEVELS: 6,
      ISO_ANGLE: Math.PI / 6,
      COLORS: {
        grid: 'rgba(0, 212, 255, 0.15)',
        axes: 'rgba(0, 212, 255, 0.4)',
        pattern: 'rgba(0, 212, 255, 0.8)'
      }
    };

    // ==================== DOM ELEMENT REFERENCES ====================
    const elements = {
      // Canvas elements
      azimutCanvas: document.getElementById('azimut-canvas'),
      elevacionCanvas: document.getElementById('elevacion-canvas'),
      threeDCanvas: document.getElementById('threeD-canvas'),
      
      // Control inputs
      antennaRadios: document.querySelectorAll('input[name="antenna"]'),
      viewRadios: document.querySelectorAll('input[name="view"]'),
      
      // Dipolo controls
      dipoloLength: document.getElementById('dipolo-length'),
      dipoloLengthValue: document.getElementById('dipolo-length-value'),
      dipoloControls: document.getElementById('dipolo-controls'),
      
      // Monopolo controls
      monopoloLength: document.getElementById('monopolo-length'),
      monopoloLengthValue: document.getElementById('monopolo-length-value'),
      monopoloControls: document.getElementById('monopolo-controls'),
      
      // Arreglo controls
      arregloSeparation: document.getElementById('arreglo-separation'),
      arregloSeparationValue: document.getElementById('arreglo-separation-value'),
      arregloPhase: document.getElementById('arreglo-phase'),
      arregloPhaseValue: document.getElementById('arreglo-phase-value'),
      arregloControls: document.getElementById('arreglo-controls'),
      
      // Yagi controls
      yagiDirectors: document.getElementById('yagi-directors'),
      yagiControls: document.getElementById('yagi-controls'),
      
      // Results
      gainValue: document.getElementById('gain-value'),
      beamwidthValue: document.getElementById('beamwidth-value'),
      fbrValue: document.getElementById('fbr-value'),
      
      // Legend
      legendLabels: document.getElementById('legend-labels'),
      currentModeLabel: document.getElementById('current-mode-label'),
      
      // Screenshot button
      screenshotBtn: document.getElementById('screenshot-btn')
    };

    // Canvas contexts
    const contexts = {
      azimut: elements.azimutCanvas.getContext('2d'),
      elevacion: elements.elevacionCanvas.getContext('2d'),
      threeD: elements.threeDCanvas.getContext('2d')
    };

    // ==================== APPLICATION STATE ====================
    const state = {
      currentAntenna: 'dipolo',
      currentView: 'gain',
      isDrawing: false
    };

    // ==================== UTILITY FUNCTIONS ====================
    const Utils = {
      /**
       * Clamp a value between min and max
       */
      clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      },

      /**
       * Convert linear gain to dB
       */
      toDecibels(gain, reference = 1) {
        if (gain <= 0 || reference <= 0) return -Infinity;
        return 10 * Math.log10(gain / reference);
      },

      /**
       * Normalize angle to [0, 2π]
       */
      normalizeAngle(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
      },

      /**
       * Get color from value using spectrum mapping
       */
      getColorFromValue(value, minVal = CONFIG.DB_MIN, maxVal = CONFIG.DB_MAX) {
        const clampedValue = this.clamp(value, minVal, maxVal);
        const normalized = (clampedValue - minVal) / (maxVal - minVal);
        
        let r, g, b;
        
        if (normalized < 0.25) {
          // Blue to Cyan (0 -> 0.25)
          const t = normalized / 0.25;
          r = 0;
          g = Math.floor(255 * t);
          b = 255;
        } else if (normalized < 0.5) {
          // Cyan to Green (0.25 -> 0.5)
          const t = (normalized - 0.25) / 0.25;
          r = 0;
          g = 255;
          b = Math.floor(255 * (1 - t));
        } else if (normalized < 0.75) {
          // Green to Yellow (0.5 -> 0.75)
          const t = (normalized - 0.5) / 0.25;
          r = Math.floor(255 * t);
          g = 255;
          b = 0;
        } else {
          // Yellow to Red (0.75 -> 1.0)
          const t = (normalized - 0.75) / 0.25;
          r = 255;
          g = Math.floor(255 * (1 - t));
          b = 0;
        }
        
        return `rgb(${r}, ${g}, ${b})`;
      },

      /**
       * Debounce function for performance
       */
      debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }
    };

    // ==================== RADIATION PATTERN CALCULATIONS ====================
    const RadiationPattern = {
      /**
       * Calculate radiation pattern for dipole antenna
       */
      dipolo(theta, phi) {
        const length = parseFloat(elements.dipoloLength.value);
        const kL = Math.PI * length;
        const sinTheta = Math.sin(theta);
        
        if (Math.abs(sinTheta) < 1e-6) return 0;
        
        const numerator = Math.pow(Math.cos(kL * Math.cos(theta)) - Math.cos(kL), 2);
        const denominator = Math.pow(sinTheta, 2);
        
        return numerator / denominator;
      },

      /**
       * Calculate radiation pattern for monopole antenna
       */
      monopolo(theta, phi) {
        // Monopolo only radiates in upper hemisphere
        if (theta > Math.PI / 2) return 0;
        
        const length = parseFloat(elements.monopoloLength.value);
        const kL = Math.PI * length;
        const sinTheta = Math.sin(theta);
        
        if (Math.abs(sinTheta) < 1e-6) return 0;
        
        const numerator = Math.pow(Math.cos(kL * Math.cos(theta)) - Math.cos(kL), 2);
        const denominator = Math.pow(sinTheta, 2);
        
        // Monopolo has twice the directivity of dipole (ground plane effect)
        return 2 * numerator / denominator;
      },

      /**
       * Calculate radiation pattern for two-element array
       */
      arreglo(theta, phi) {
        const separation = parseFloat(elements.arregloSeparation.value);
        const phaseAngle = parseFloat(elements.arregloPhase.value) * Math.PI / 180;
        
        // Element pattern (dipole)
        const sinTheta = Math.sin(theta);
        if (Math.abs(sinTheta) < 1e-6) return 0;
        
        const elementPattern = Math.pow(Math.cos(Math.PI / 2 * Math.cos(theta)) / sinTheta, 2);
        
        // Array factor
        const psi = 2 * Math.PI * separation * Math.sin(theta) * Math.cos(phi) + phaseAngle;
        const arrayFactor = Math.pow(Math.cos(psi / 2), 2);
        
        return elementPattern * arrayFactor * 4; // Factor of 4 for two-element array
      },

      /**
       * Calculate radiation pattern for Yagi antenna (simplified model)
       */
      yagi(theta, phi) {
        const numDirectors = parseInt(elements.yagiDirectors.value) || 3;
        
        // Simplified model: highly directive in forward direction (phi = 0)
        const sinTheta = Math.sin(theta);
        if (Math.abs(sinTheta) < 1e-6) return 0;
        
        // Base pattern
        const basePattern = Math.pow(sinTheta, 2);
        
        // Directivity enhancement based on number of directors
        const directivity = Math.pow(Math.max(0, Math.cos(phi)), numDirectors * 0.8);
        
        // Front-to-back ratio improvement
        const backSuppression = phi > Math.PI / 2 && phi < 3 * Math.PI / 2 ? 
          Math.pow(10, -numDirectors * 0.3) : 1;
        
        return basePattern * directivity * backSuppression * (2 + numDirectors);
      },

      /**
       * Get radiation pattern value for current antenna type
       */
      getValue(antenna, theta, phi) {
        switch (antenna) {
          case 'dipolo':
            return this.dipolo(theta, phi);
          case 'monopolo':
            return this.monopolo(theta, phi);
          case 'arreglo':
            return this.arreglo(theta, phi);
          case 'yagi':
            return this.yagi(theta, phi);
          default:
            return Math.pow(Math.sin(theta), 2);
        }
      }
    };

    // ==================== VISUALIZATION FUNCTIONS ====================
    const Visualization = {
      /**
       * Draw polar grid
       */
      drawPolarGrid(ctx, canvas, centerX, centerY, radius) {
        ctx.strokeStyle = CONFIG.COLORS.grid;
        ctx.lineWidth = 1;
        
        // Concentric circles
        for (let i = 1; i <= CONFIG.GRID_LEVELS; i++) {
          const r = radius * (i / CONFIG.GRID_LEVELS);
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
          
          // dB labels
          if (i < CONFIG.GRID_LEVELS) {
            const dbValue = CONFIG.DB_MIN + (CONFIG.DB_MAX - CONFIG.DB_MIN) * (i / CONFIG.GRID_LEVELS);
            ctx.fillStyle = CONFIG.COLORS.grid;
            ctx.font = '10px Share Tech Mono';
            ctx.fillText(`${dbValue.toFixed(0)}dB`, centerX + 5, centerY - r);
          }
        }
        
        // Radial lines (every 30 degrees)
        ctx.strokeStyle = CONFIG.COLORS.grid;
        for (let angle = 0; angle < 360; angle += 30) {
          const rad = angle * Math.PI / 180;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + radius * Math.cos(rad - Math.PI / 2),
            centerY + radius * Math.sin(rad - Math.PI / 2)
          );
          ctx.stroke();
          
          // Angle labels
          const labelRadius = radius + 15;
          const labelX = centerX + labelRadius * Math.cos(rad - Math.PI / 2);
          const labelY = centerY + labelRadius * Math.sin(rad - Math.PI / 2);
          ctx.fillStyle = CONFIG.COLORS.axes;
          ctx.font = '11px Share Tech Mono';
          ctx.textAlign = 'center';
          ctx.fillText(`${angle}°`, labelX, labelY);
        }
      },

      /**
       * Draw polar pattern (azimuth or elevation)
       */
      drawPolarPattern(ctxName, isAzimut = true) {
        const canvas = isAzimut ? elements.azimutCanvas : elements.elevacionCanvas;
        const ctx = contexts[ctxName];
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.80;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        this.drawPolarGrid(ctx, canvas, centerX, centerY, radius);
        
        // Sample pattern
        const gains = [];
        let maxGain = 0;
        
        for (let i = 0; i < CONFIG.PATTERN_SAMPLES; i++) {
          const angle = (i / CONFIG.PATTERN_SAMPLES) * Math.PI * 2;
          let theta, phi;
          
          if (isAzimut) {
            // Azimuth: θ = π/2, vary φ
            theta = Math.PI / 2;
            phi = angle;
          } else {
            // Elevation: φ = 0, vary θ
            theta = angle;
            phi = 0;
          }
          
          const gain = RadiationPattern.getValue(state.currentAntenna, theta, phi);
          gains.push(gain);
          if (gain > maxGain) maxGain = gain;
        }
        
        if (maxGain === 0) maxGain = 1;
        
        // Draw pattern with gradient
        const points = [];
        for (let i = 0; i < CONFIG.PATTERN_SAMPLES; i++) {
          const angle = (i / CONFIG.PATTERN_SAMPLES) * Math.PI * 2;
          const gain = gains[i];
          
          let scale, displayValue;
          
          if (state.currentView === 'gain') {
            // Ganancia en dB (escala logarítmica)
            const gainDB = Utils.toDecibels(gain, maxGain);
            const dbClamped = Utils.clamp(gainDB, CONFIG.DB_MIN, CONFIG.DB_MAX);
            scale = (dbClamped - CONFIG.DB_MIN) / (CONFIG.DB_MAX - CONFIG.DB_MIN);
            displayValue = dbClamped;
          } else {
            // Potencia normalizada (escala lineal)
            const normalizedPower = gain / maxGain;
            // Para potencia, usamos escala lineal directa
            scale = Math.max(0, normalizedPower);
            // Convertir a dB para el color pero mantener escala lineal para radio
            displayValue = Utils.toDecibels(gain, maxGain);
          }
          
          const r = radius * scale;
          const x = centerX + r * Math.cos(angle - Math.PI / 2);
          const y = centerY + r * Math.sin(angle - Math.PI / 2);
          
          points.push({ x, y, db: displayValue, scale: scale });
        }
        
        // Draw filled pattern
        if (points.length > 0) {
          // Create gradient path
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.closePath();
          
          // Fill with semi-transparent color
          const avgDb = points.reduce((sum, p) => sum + p.db, 0) / points.length;
          ctx.fillStyle = Utils.getColorFromValue(avgDb) + '33'; // 20% opacity
          ctx.fill();
          
          // Draw outline with varying colors
          for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = Utils.getColorFromValue(p1.db);
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
        }
        
        // Update results on azimuth draw
        if (isAzimut) {
          this.updateResults(maxGain, gains);
        }
      },

      /**
       * Draw 3D isometric projection
       */
      draw3DPattern() {
        const canvas = elements.threeDCanvas;
        const ctx = contexts.threeD;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = Math.min(canvas.width, canvas.height) * 0.35;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Sample 3D pattern
        const data = [];
        let maxGain = 0;
        
        for (let ti = 0; ti <= CONFIG.THETA_STEPS_3D; ti++) {
          const theta = (ti / CONFIG.THETA_STEPS_3D) * Math.PI;
          const row = [];
          
          for (let pi = 0; pi <= CONFIG.PHI_STEPS_3D; pi++) {
            const phi = (pi / CONFIG.PHI_STEPS_3D) * Math.PI * 2;
            const gain = RadiationPattern.getValue(state.currentAntenna, theta, phi);
            
            if (gain > maxGain) maxGain = gain;
            row.push(gain);
          }
          data.push(row);
        }
        
        if (maxGain === 0) maxGain = 1;
        
        // Isometric projection helper
        const project = (x, y, z) => {
          const scaleX = Math.cos(CONFIG.ISO_ANGLE);
          const scaleY = Math.sin(CONFIG.ISO_ANGLE);
          
          return {
            x: centerX + size * (x * scaleX - y * scaleX),
            y: centerY + size * (-z + (x + y) * scaleY)
          };
        };
        
        // Draw surface with proper depth sorting
        const quads = [];
        
        for (let ti = 0; ti < CONFIG.THETA_STEPS_3D; ti++) {
          for (let pi = 0; pi < CONFIG.PHI_STEPS_3D; pi++) {
            const gains = [
              data[ti][pi],
              data[ti][pi + 1],
              data[ti + 1][pi + 1],
              data[ti + 1][pi]
            ];
            
            const dbValues = gains.map(g => Utils.toDecibels(g, maxGain));
            
            let scales;
            if (state.currentView === 'gain') {
              // Modo ganancia: escala logarítmica (dB)
              scales = dbValues.map(db => {
                const clamped = Utils.clamp(db, CONFIG.DB_MIN, CONFIG.DB_MAX);
                return Math.max(0, (clamped - CONFIG.DB_MIN) / (CONFIG.DB_MAX - CONFIG.DB_MIN));
              });
            } else {
              // Modo potencia: escala lineal
              scales = gains.map(g => Math.max(0, g / maxGain));
            }
            
            // Calculate vertices
            const vertices = [];
            for (let i = 0; i < 4; i++) {
              const tIdx = i < 2 ? ti : ti + 1;
              const pIdx = (i === 0 || i === 3) ? pi : pi + 1;
              
              const theta = (tIdx / CONFIG.THETA_STEPS_3D) * Math.PI;
              const phi = (pIdx / CONFIG.PHI_STEPS_3D) * Math.PI * 2;
              const scale = scales[i];
              
              const x = scale * Math.sin(theta) * Math.cos(phi);
              const y = scale * Math.sin(theta) * Math.sin(phi);
              const z = scale * Math.cos(theta);
              
              vertices.push({ x, y, z });
            }
            
            // Calculate average depth for sorting
            const avgZ = vertices.reduce((sum, v) => sum + v.z, 0) / 4;
            const avgDb = dbValues.reduce((sum, db) => sum + db, 0) / 4;
            
            quads.push({ vertices, avgZ, avgDb });
          }
        }
        
        // Sort by depth (painter's algorithm)
        quads.sort((a, b) => a.avgZ - b.avgZ);
        
        // Draw quads
        quads.forEach(quad => {
          const projected = quad.vertices.map(v => project(v.x, v.y, v.z));
          const color = Utils.getColorFromValue(quad.avgDb);
          
          ctx.fillStyle = color + 'CC'; // 80% opacity
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.5;
          
          ctx.beginPath();
          ctx.moveTo(projected[0].x, projected[0].y);
          for (let i = 1; i < projected.length; i++) {
            ctx.lineTo(projected[i].x, projected[i].y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        
        // Draw axes for reference
        const axisLength = size * 1.2;
        ctx.lineWidth = 2;
        
        // X axis (red)
        const xStart = project(0, 0, 0);
        const xEnd = project(axisLength / size, 0, 0);
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
        ctx.beginPath();
        ctx.moveTo(xStart.x, xStart.y);
        ctx.lineTo(xEnd.x, xEnd.y);
        ctx.stroke();
        
        // Y axis (green)
        const yEnd = project(0, axisLength / size, 0);
        ctx.strokeStyle = 'rgba(100, 255, 100, 0.6)';
        ctx.beginPath();
        ctx.moveTo(xStart.x, xStart.y);
        ctx.lineTo(yEnd.x, yEnd.y);
        ctx.stroke();
        
        // Z axis (blue)
        const zEnd = project(0, 0, axisLength / size);
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(xStart.x, xStart.y);
        ctx.lineTo(zEnd.x, zEnd.y);
        ctx.stroke();
      },

      /**
       * Calculate beamwidth from radiation pattern (HPBW - Half Power Beam Width)
       * Finds the angular width between the -3dB points
       */
      calculateBeamwidth(gains) {
        if (!gains || gains.length === 0) return 90;
        
        const maxGain = Math.max(...gains);
        if (maxGain === 0) return 180;
        
        // -3dB point is half power (10^(-3/10) ≈ 0.501)
        const threshold = maxGain * 0.5;
        
        // Find all crossings of the threshold
        const crossings = [];
        for (let i = 0; i < gains.length; i++) {
          const current = gains[i];
          const next = gains[(i + 1) % gains.length];
          
          // Check if we cross the threshold
          if ((current >= threshold && next < threshold) || 
              (current < threshold && next >= threshold)) {
            crossings.push(i);
          }
        }
        
        if (crossings.length < 2) {
          // Pattern is too wide or too narrow
          return gains[0] >= threshold ? 360 : 0;
        }
        
        // For symmetric patterns, find the main lobe
        // Assume maximum is at or near index 0
        let beamwidth = 0;
        
        // Find the two closest crossings to the maximum
        if (crossings.length >= 2) {
          // Calculate angular separation between first two crossings
          const angle1 = (crossings[0] / gains.length) * 360;
          const angle2 = (crossings[1] / gains.length) * 360;
          beamwidth = Math.abs(angle2 - angle1);
          
          // If beamwidth is > 180, we got the back lobe, take complement
          if (beamwidth > 180) {
            beamwidth = 360 - beamwidth;
          }
        }
        
        return Math.max(1, Math.min(360, beamwidth));
      },

      /**
       * Calculate front-to-back ratio
       * Compares maximum gain in forward direction (0°) to maximum in back (180°)
       */
      calculateFBR(gains) {
        if (!gains || gains.length === 0) return Infinity;
        
        const numSamples = gains.length;
        
        // Define angular ranges for front and back
        // Front: 0° ± 30° 
        // Back: 180° ± 30°
        const angleRange = 30; // degrees
        const sampleRange = Math.floor(numSamples * angleRange / 360);
        
        // Find maximum in front sector
        let frontMax = 0;
        for (let i = 0; i <= sampleRange; i++) {
          frontMax = Math.max(frontMax, gains[i]);
          // Also check the wrap-around
          const wrapIdx = numSamples - i;
          frontMax = Math.max(frontMax, gains[wrapIdx]);
        }
        
        // Find maximum in back sector (180°)
        const backCenter = Math.floor(numSamples / 2);
        let backMax = 0;
        for (let i = -sampleRange; i <= sampleRange; i++) {
          const idx = (backCenter + i + numSamples) % numSamples;
          backMax = Math.max(backMax, gains[idx]);
        }
        
        if (backMax === 0 || backMax < 1e-10) return Infinity;
        
        // Return ratio in dB
        const ratio = frontMax / backMax;
        return 10 * Math.log10(ratio);
      },

      /**
       * Calculate directivity from radiation pattern
       * D = 4π / ∫∫ U(θ,φ) sin(θ) dθ dφ
       * Simplified 2D version using azimuth pattern
       */
      calculateDirectivity(maxGain, gains) {
        if (!gains || gains.length === 0) return 0;
        if (maxGain === 0) return 0;
        
        // Numerical integration of the pattern
        // For 2D (azimuth only), we approximate the 3D integral
        const avgGain = gains.reduce((sum, g) => sum + g, 0) / gains.length;
        
        if (avgGain === 0) return 0;
        
        // Directivity = 4π * Pmax / Prad
        // In normalized units: D = Umax / Uavg
        const directivity = maxGain / avgGain;
        
        // Convert to dBi
        return 10 * Math.log10(directivity);
      },

      /**
       * Calculate theoretical gain for dipole based on length
       * Using accurate electromagnetic formulas
       */
      calculateDipoleGain(length) {
        // For a center-fed dipole of length L
        const L = length; // in wavelengths
        
        // Radiation resistance and directivity vary with length
        // These are empirical formulas based on antenna theory
        
        if (L < 0.1) {
          // Very short dipole (Hertzian)
          return 10 * Math.log10(1.5); // ~1.76 dBi
        } else if (L >= 0.45 && L <= 0.55) {
          // Half-wave dipole (optimal)
          return 2.15; // dBi
        } else if (L >= 0.95 && L <= 1.05) {
          // Full-wave dipole
          return 3.82; // dBi
        } else if (L >= 1.45 && L <= 1.55) {
          // 3λ/2 dipole
          return 3.5; // dBi (has side lobes)
        } else {
          // Interpolate based on length
          // General formula: D ≈ 1.64 for short, up to ~4 dBi for certain lengths
          const baseDbi = 1.64; // Short dipole base
          const lengthFactor = Math.sin(Math.PI * L) * Math.sin(Math.PI * L);
          const gain = baseDbi + 0.5 * lengthFactor;
          return Math.max(0, Math.min(4.0, gain));
        }
      },

      /**
       * Calculate theoretical gain for monopole based on length
       */
      calculateMonopoleGain(length) {
        // Monopole over ground plane has 3 dB more gain than equivalent dipole
        // Due to image theory (radiation in half-space only)
        const equivalentDipoleLength = length * 2; // Image creates equivalent dipole
        const dipoleGain = this.calculateDipoleGain(equivalentDipoleLength);
        
        // Add 3 dB for ground plane effect
        return dipoleGain + 3.0;
      },

      /**
       * Update results panel with calculated parameters
       * All calculations are dynamic and based on actual antenna parameters
       */
      updateResults(maxGain, gains) {
        let gainDbi, beamwidth, fbr;
        
        // Calculate from actual radiation pattern
        beamwidth = this.calculateBeamwidth(gains);
        fbr = this.calculateFBR(gains);
        const measuredDirectivity = this.calculateDirectivity(maxGain, gains);
        
        // Calculate theoretical values based on antenna type and parameters
        switch (state.currentAntenna) {
          case 'dipolo': {
            const length = parseFloat(elements.dipoloLength.value);
            const theoreticalGain = this.calculateDipoleGain(length);
            
            // Use the higher of measured or theoretical (more accurate)
            gainDbi = Math.max(measuredDirectivity, theoreticalGain);
            
            // For dipoles, F/B ratio is typically infinite (omnidirectional in azimuth)
            if (!isFinite(fbr) || fbr > 30) {
              fbr = Infinity;
            }
            break;
          }
            
          case 'monopolo': {
            const length = parseFloat(elements.monopoloLength.value);
            const theoreticalGain = this.calculateMonopoleGain(length);
            
            gainDbi = Math.max(measuredDirectivity, theoreticalGain);
            
            // Monopoles are also omnidirectional in azimuth
            if (!isFinite(fbr) || fbr > 30) {
              fbr = Infinity;
            }
            break;
          }
            
          case 'arreglo': {
            const separation = parseFloat(elements.arregloSeparation.value);
            const phaseAngle = parseFloat(elements.arregloPhase.value);
            
            // Base element gain (dipole)
            const elementGain = 2.15;
            
            // Array factor gain
            // For 2-element array: G = G_element + 10*log10(N) + array_factor
            const numElements = 2;
            const arrayGain = 10 * Math.log10(numElements); // ~3 dB
            
            // Directivity depends on spacing and phase
            // Optimal spacing is 0.5λ with 0° phase
            let spacingFactor = 0;
            if (separation > 0.3 && separation < 0.7) {
              spacingFactor = 1.0; // Good spacing
            } else if (separation >= 0.7 && separation < 1.0) {
              spacingFactor = 0.5 + (separation - 0.7) * 0.5;
            } else {
              spacingFactor = Math.max(0, 1.0 - Math.abs(separation - 0.5) * 0.5);
            }
            
            // Phase factor (optimal at 0° for broadside)
            const phaseFactor = Math.cos(phaseAngle * Math.PI / 180);
            
            gainDbi = elementGain + arrayGain + spacingFactor + phaseFactor * 0.5;
            
            // Use measured directivity if higher
            gainDbi = Math.max(gainDbi, measuredDirectivity);
            
            // F/B ratio is real for arrays
            if (!isFinite(fbr)) fbr = 0;
            break;
          }
            
          case 'yagi': {
            const numDirectors = parseInt(elements.yagiDirectors.value) || 3;
            
            // Yagi antenna gain formula
            // G ≈ 7 + 1.2 * N_directors (empirical)
            const baseGain = 7.0; // Driven element + reflector
            const directorContribution = numDirectors * 1.2;
            
            gainDbi = baseGain + directorContribution;
            
            // Use measured if higher
            gainDbi = Math.max(gainDbi, measuredDirectivity);
            
            // Yagi has good F/B ratio
            // F/B ≈ 12 + 2.5 * N_directors
            const theoreticalFBR = 12 + numDirectors * 2.5;
            fbr = Math.max(fbr, theoreticalFBR);
            
            break;
          }
            
          default:
            gainDbi = measuredDirectivity;
            if (!isFinite(fbr)) fbr = 0;
        }
        
        // Ensure values are in reasonable ranges
        gainDbi = Math.max(-10, Math.min(25, gainDbi));
        beamwidth = Math.max(1, Math.min(360, beamwidth));
        
        // Update DOM with smooth animation
        elements.gainValue.style.transform = 'scale(1.1)';
        elements.beamwidthValue.style.transform = 'scale(1.1)';
        elements.fbrValue.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
          elements.gainValue.textContent = gainDbi.toFixed(2);
          elements.beamwidthValue.textContent = beamwidth.toFixed(0) + '°';
          elements.fbrValue.textContent = isFinite(fbr) ? fbr.toFixed(1) + ' dB' : '∞';
          
          elements.gainValue.style.transform = 'scale(1)';
          elements.beamwidthValue.style.transform = 'scale(1)';
          elements.fbrValue.style.transform = 'scale(1)';
        }, 150);
      },

      /**
       * Redraw all visualizations
       */
      redrawAll() {
        if (state.isDrawing) return;
        state.isDrawing = true;
        
        requestAnimationFrame(() => {
          this.drawPolarPattern('azimut', true);
          this.drawPolarPattern('elevacion', false);
          this.draw3DPattern();
          state.isDrawing = false;
        });
      }
    };

    // ==================== EVENT HANDLERS ====================
    const EventHandlers = {
      /**
       * Handle antenna type change
       */
      onAntennaChange(event) {
        state.currentAntenna = event.target.value;
        this.updateControlsVisibility();
        Visualization.redrawAll();
      },

      /**
       * Handle view mode change
       */
      onViewChange(event) {
        state.currentView = event.target.value;
        
        // Update legend labels based on mode
        if (state.currentView === 'gain') {
          elements.legendLabels.innerHTML = `
            <span>-30 dB</span>
            <span>-20 dB</span>
            <span>-10 dB</span>
            <span>0 dB</span>
          `;
          elements.currentModeLabel.textContent = 'Ganancia (dB) - Escala Logarítmica';
        } else {
          elements.legendLabels.innerHTML = `
            <span>0%</span>
            <span>33%</span>
            <span>67%</span>
            <span>100%</span>
          `;
          elements.currentModeLabel.textContent = 'Potencia Normalizada - Escala Lineal';
        }
        
        Visualization.redrawAll();
      },

      /**
       * Update visibility of antenna-specific controls
       */
      updateControlsVisibility() {
        const controlGroups = {
          'dipolo': elements.dipoloControls,
          'monopolo': elements.monopoloControls,
          'arreglo': elements.arregloControls,
          'yagi': elements.yagiControls
        };
        
        Object.entries(controlGroups).forEach(([antenna, controls]) => {
          if (antenna === state.currentAntenna) {
            controls.classList.remove('hidden');
            controls.setAttribute('aria-hidden', 'false');
          } else {
            controls.classList.add('hidden');
            controls.setAttribute('aria-hidden', 'true');
          }
        });
      },

      /**
       * Handle slider input
       */
      onSliderInput(slider, valueDisplay, unit) {
        return () => {
          valueDisplay.textContent = `${slider.value} ${unit}`;
          Visualization.redrawAll();
        };
      },

      /**
       * Capture screenshot
       */
      captureScreenshot() {
        try {
          // Create composite canvas
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          
          const azW = elements.azimutCanvas.width;
          const azH = elements.azimutCanvas.height;
          const elW = elements.elevacionCanvas.width;
          const elH = elements.elevacionCanvas.height;
          const tdW = elements.threeDCanvas.width;
          const tdH = elements.threeDCanvas.height;
          
          // Layout: azimut and elevation side by side, 3D below
          const totalWidth = azW + elW;
          const totalHeight = azH + tdH;
          
          tempCanvas.width = totalWidth;
          tempCanvas.height = totalHeight;
          
          // Fill background
          tempCtx.fillStyle = '#0a0e1a';
          tempCtx.fillRect(0, 0, totalWidth, totalHeight);
          
          // Draw canvases
          tempCtx.drawImage(elements.azimutCanvas, 0, 0);
          tempCtx.drawImage(elements.elevacionCanvas, azW, 0);
          tempCtx.drawImage(elements.threeDCanvas, 0, azH, totalWidth, tdH);
          
          // Add title
          tempCtx.fillStyle = '#00d4ff';
          tempCtx.font = 'bold 24px Orbitron';
          tempCtx.textAlign = 'center';
          tempCtx.fillText(
            `Patrón de Radiación - ${state.currentAntenna.toUpperCase()}`,
            totalWidth / 2,
            totalHeight - 20
          );
          
          // Trigger download
          tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `patron-radiacion-${state.currentAntenna}-${timestamp}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }, 'image/png');
          
        } catch (error) {
          console.error('Error capturing screenshot:', error);
          alert('Error al capturar la imagen. Por favor, intente de nuevo.');
        }
      },

      /**
       * Handle window resize
       */
      onResize: Utils.debounce(() => {
        // Adjust canvas sizes based on container
        const maxWidth = Math.min(1000, window.innerWidth - 40);
        const canvasSize = Math.min(500, maxWidth / 2);
        
        elements.azimutCanvas.width = canvasSize;
        elements.azimutCanvas.height = canvasSize;
        elements.elevacionCanvas.width = canvasSize;
        elements.elevacionCanvas.height = canvasSize;
        elements.threeDCanvas.width = Math.min(1000, window.innerWidth - 40);
        elements.threeDCanvas.height = Math.min(500, canvasSize);
        
        Visualization.redrawAll();
      }, 250)
    };

    // ==================== INITIALIZATION ====================
    function initialize() {
      // Setup antenna type listeners
      elements.antennaRadios.forEach(radio => {
        radio.addEventListener('change', (e) => EventHandlers.onAntennaChange(e));
      });
      
      // Setup view mode listeners
      elements.viewRadios.forEach(radio => {
        radio.addEventListener('change', (e) => EventHandlers.onViewChange(e));
      });
      
      // Setup dipolo controls
      elements.dipoloLength.addEventListener('input', 
        EventHandlers.onSliderInput(elements.dipoloLength, elements.dipoloLengthValue, 'λ')
      );
      
      // Setup monopolo controls
      elements.monopoloLength.addEventListener('input', 
        EventHandlers.onSliderInput(elements.monopoloLength, elements.monopoloLengthValue, 'λ')
      );
      
      // Setup arreglo controls
      elements.arregloSeparation.addEventListener('input', 
        EventHandlers.onSliderInput(elements.arregloSeparation, elements.arregloSeparationValue, 'λ')
      );
      elements.arregloPhase.addEventListener('input', 
        EventHandlers.onSliderInput(elements.arregloPhase, elements.arregloPhaseValue, '°')
      );
      
      // Setup yagi controls
      elements.yagiDirectors.addEventListener('input', () => {
        Visualization.redrawAll();
      });
      
      // Setup screenshot button
      elements.screenshotBtn.addEventListener('click', () => {
        EventHandlers.captureScreenshot();
      });
      
      // Setup resize listener
      window.addEventListener('resize', EventHandlers.onResize);
      
      // Initialize control visibility
      EventHandlers.updateControlsVisibility();
      
      // Initial draw
      EventHandlers.onResize();
      
      // Add keyboard navigation support
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-nav');
        }
      });
      
      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
      });
      
      console.log('📡 Visualizador de Patrones de Radiación inicializado correctamente');
    }

    // Start application when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }

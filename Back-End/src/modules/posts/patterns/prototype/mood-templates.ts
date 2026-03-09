import { PostPrototype } from './post-prototype.abstract'
import { PostTemplate } from '@/common/types'

/**
 * Centralized mood template configurations
 * Eliminates code repetition and makes it easy to update all templates in one place
 */
const MOOD_CONFIGURATIONS: Record<string, PostTemplate> = {
  nostalgia: {
    title: 'Recuerdos Musicales 🎶',
    descriptionPlaceholder: '¿Qué canción te trae recuerdos?',
    emotionalContext: 'Revive tus mejores momentos con la música',
    suggestedTags: ['#nostalgico', '#recuerdos', '#vieja_escuela', '#memories'],
    defaultPrivacy: 'public',
    color: '#8B5A3C',
  },
  energy: {
    title: '¡Dale Energía! ⚡',
    descriptionPlaceholder: '¿Qué canción te pone a moverte?',
    emotionalContext: 'Expresa tu energía y movimiento',
    suggestedTags: ['#energetico', '#hype', '#movimiento', '#pump_up'],
    defaultPrivacy: 'public',
    color: '#FF6B35',
  },
  chill: {
    title: 'Relájate 🌙',
    descriptionPlaceholder: '¿Canción relajante del momento?',
    emotionalContext: 'Encuentra tu paz interior a través de la música',
    suggestedTags: ['#relajante', '#chill', '#tranquilo', '#lofi'],
    defaultPrivacy: 'friends',
    color: '#4A90E2',
  },
}

/**
 * Nostalgia mood template
 * Represents a nostalgic/memories-focused post template
 */
export class NostalgiaTemplate extends PostPrototype {
  constructor() {
    super(MOOD_CONFIGURATIONS.nostalgia, 'nostalgia')
  }
}

/**
 * Energy mood template
 * Represents an energetic/hype-focused post template
 */
export class EnergyTemplate extends PostPrototype {
  constructor() {
    super(MOOD_CONFIGURATIONS.energy, 'energy')
  }
}

/**
 * Chill mood template
 * Represents a relaxing/calm-focused post template
 */
export class ChillTemplate extends PostPrototype {
  constructor() {
    super(MOOD_CONFIGURATIONS.chill, 'chill')
  }
}

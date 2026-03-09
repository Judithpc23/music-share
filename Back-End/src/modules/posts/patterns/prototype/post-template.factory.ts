import { Injectable } from '@nestjs/common'
import { PostPrototype } from './post-prototype.abstract'
import {
  NostalgiaTemplate,
  EnergyTemplate,
  ChillTemplate,
} from './mood-templates'
import { MoodType, PostTemplate } from '@/common/types'

/**
 * Factory service for creating post template prototypes
 * Manages prototype instances and provides cloning/customization methods
 * Implements the Factory and Prototype design patterns
 */
@Injectable()
export class PostTemplateFactory {
  private prototypes: Map<MoodType, PostPrototype> = new Map([
    ['nostalgia', new NostalgiaTemplate()],
    ['energy', new EnergyTemplate()],
    ['chill', new ChillTemplate()],
  ])

  /**
   * Creates a cloned template for the specified mood
   * @param moodType - Mood type (nostalgia, energy, chill)
   * @returns Cloned prototype
   * @throws Error if mood is not supported
   */
  createTemplate(moodType: MoodType): PostPrototype {
    const prototype = this.prototypes.get(moodType)
    if (!prototype) {
      throw new Error(`Mood type "${moodType}" is not supported`)
    }
    return prototype.clone()
  }

  /**
   * Creates a customized template
   * @param moodType - Mood type
   * @param customizations - Partial customizations
   * @returns Customized prototype
   */
  createCustomizedTemplate(
    moodType: MoodType,
    customizations: Partial<PostTemplate>
  ): PostPrototype {
    const template = this.createTemplate(moodType)
    return template.customize(customizations)
  }

  /**
   * Get all available mood types
   */
  getAvailableMoods(): MoodType[] {
    return Array.from(this.prototypes.keys())
  }

  /**
   * Get template preview without creating post
   */
  getTemplatePreview(moodType: MoodType): PostTemplate {
    const template = this.createTemplate(moodType)
    return template.getTemplate()
  }
}

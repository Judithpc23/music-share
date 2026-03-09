import { Test, TestingModule } from '@nestjs/testing'
import { PostsService } from './posts.service'
import { PostTemplateFactory } from './patterns/prototype/post-template.factory'

describe('PostsService - Prototype Pattern', () => {
  let service: PostsService
  let factory: PostTemplateFactory

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, PostTemplateFactory],
    }).compile()

    service = module.get<PostsService>(PostsService)
    factory = module.get<PostTemplateFactory>(PostTemplateFactory)
  })

  describe('Prototype Clone', () => {
    it('✅ Should clone templates independently', () => {
      const template1 = factory.createTemplate('nostalgia')
      const template2 = factory.createTemplate('nostalgia')

      expect(template1).not.toBe(template2)
      expect(template1.getTemplate()).toEqual(template2.getTemplate())
    })

    it('✅ Should not mutate original on customize', () => {
      const original = factory.createTemplate('energy')
      const customized = original.customize({
        title: 'Custom Energy',
      })

      expect(original.getTemplate().title).toBe('¡Dale Energía! ⚡')
      expect(customized.getTemplate().title).toBe('Custom Energy')
    })

    it('✅ Should deep clone tags array', () => {
      const template1 = factory.createTemplate('chill')
      const template2 = factory.createTemplate('chill')

      const tags1 = template1.getTemplate().suggestedTags
      const tags2 = template2.getTemplate().suggestedTags

      tags1.push('#extra')

      expect(tags2).not.toContain('#extra')
    })
  })

  describe('Template Factory', () => {
    it('✅ Should return all available moods', () => {
      const moods = service.getAvailableMoods()
      expect(moods).toContain('nostalgia')
      expect(moods).toContain('energy')
      expect(moods).toContain('chill')
    })

    it('✅ Should throw error for unknown mood', () => {
      expect(() => factory.createTemplate('unknown' as any)).toThrow()
    })

    it('✅ Should get template preview', async () => {
      const preview = await service.getTemplatePreview('nostalgia')
      expect(preview.title).toBe('Recuerdos Musicales 🎶')
    })
  })

  describe('Customization', () => {
    it('✅ Should customize template with overrides', () => {
      const customized = factory.createCustomizedTemplate('nostalgia', {
        title: 'My Custom Title',
        color: '#FF0000',
      })

      const template = customized.getTemplate()
      expect(template.title).toBe('My Custom Title')
      expect(template.color).toBe('#FF0000')
      expect(template.emotionalContext).toBe(
        'Revive tus mejores momentos con la música'
      )
    })

    it('✅ Should preserve all properties when customizing', () => {
      const customized = factory.createCustomizedTemplate('energy', {
        color: '#FFFFFF',
      })

      const template = customized.getTemplate()
      expect(template.title).toBe('¡Dale Energía! ⚡')
      expect(template.suggestedTags).toContain('#energetico')
      expect(template.color).toBe('#FFFFFF')
    })
  })

  describe('Mood Types', () => {
    it('✅ Should have nostalgia mood configuration', () => {
      const template = factory.createTemplate('nostalgia')
      expect(template.getMoodType()).toBe('nostalgia')
      expect(template.getTemplate().color).toBe('#8B5A3C')
    })

    it('✅ Should have energy mood configuration', () => {
      const template = factory.createTemplate('energy')
      expect(template.getMoodType()).toBe('energy')
      expect(template.getTemplate().color).toBe('#FF6B35')
    })

    it('✅ Should have chill mood configuration', () => {
      const template = factory.createTemplate('chill')
      expect(template.getMoodType()).toBe('chill')
      expect(template.getTemplate().color).toBe('#4A90E2')
    })
  })
})

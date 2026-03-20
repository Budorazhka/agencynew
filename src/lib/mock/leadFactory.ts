import type { Lead } from '@/types/leads'
import { LEAD_STAGES, LEAD_STAGE_COLUMN } from '@/data/leads-mock'
import { getScenarioConfig, calculateFromPercentage, createMockDelay } from '@/providers/MockProvider'

const MOCK_NAMES = [
  'Иван Петров', 'Мария Сидорова', 'Алексей Козлов', 'Елена Новикова', 'Дмитрий Морозов',
  'Ольга Волкова', 'Сергей Соколов', 'Анна Лебедева', 'Николай Кузнецов', 'Татьяна Попова',
  'Андрей Васильев', 'Наталья Павлова', 'Михаил Семёнов', 'Екатерина Голубева', 'Владимир Виноградов',
  'Светлана Орлова', 'Артём Жуков', 'Ирина Белова', 'Роман Крылов', 'Юлия Комарова',
]

const SOURCES: Lead['source'][] = ['primary', 'secondary', 'rent', 'ad_campaigns']
const CHANNELS: NonNullable<Lead['channel']>[] = ['form', 'ad', 'partner', 'other']
const AD_CAMPAIGN_IDS = ['ac1', 'ac2', 'ac3', 'ac4', 'ac5', 'ac6']

interface CreateLeadsOptions {
  scenario?: string
  baseDate?: Date
  customCount?: number
}

// Фабрика для генерации тестовых лидов.
// Все методы статические, экземпляр не нужен.
export class LeadFactory {
  private static getRandomName(): string {
    return MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
  }

  private static getRandomSource(): Lead['source'] {
    return SOURCES[Math.floor(Math.random() * SOURCES.length)]
  }

  private static getRandomChannel(): NonNullable<Lead['channel']> {
    return CHANNELS[Math.floor(Math.random() * CHANNELS.length)]
  }

  private static getRandomStageId(): string {
    const stages = LEAD_STAGES.map(s => s.id)
    return stages[Math.floor(Math.random() * stages.length)]
  }

  private static getRandomManagerId(): string | null {
    const managers = ['lm-1', 'lm-2', 'lm-3', 'lm-4', 'lm-5', null]
    return managers[Math.floor(Math.random() * managers.length)]
  }

  // Считает комиссию. Аренда и реклама дают повышающий коэффициент,
  // успешные стадии — тоже. Отказ даёт понижающий.
  private static calculateCommission(
    baseAmount: number,
    stageId: string,
    source: Lead['source']
  ): number {
    const sourceMultiplier =
      source === 'rent' ? 1.3 :
      source === 'ad_campaigns' ? 1.1 : 1.0

    const stageMultiplier =
      LEAD_STAGE_COLUMN[stageId] === 'success' ? 1.6 :
      LEAD_STAGE_COLUMN[stageId] === 'in_progress' ? 1.0 : 0.4

    return Math.round(baseAmount * sourceMultiplier * stageMultiplier)
  }

  // Создаёт один лид. isNewLead=true означает что лид без менеджера, стадия 'new',
  // дата создания близка к baseDate с шагом ~9 минут на каждый индекс.
  private static createLead(
    index: number,
    baseDate: Date,
    scenarioConfig: any,
    isNewLead: boolean = false
  ): Lead {
    const source = this.getRandomSource()
    const stageId = isNewLead ? 'new' : this.getRandomStageId()
    const managerId = isNewLead ? null : this.getRandomManagerId()

    const createdAt = new Date(baseDate)
    if (isNewLead) {
      createdAt.setMinutes(createdAt.getMinutes() - index * 9)
    } else {
      createdAt.setDate(createdAt.getDate() - Math.floor(index * 56 / scenarioConfig.leadCount))
      createdAt.setHours(index % 24)
    }

    const updatedAt = index % 5 === 0 ? undefined :
      new Date(createdAt.getTime() + 60 * 60 * 1000).toISOString()

    // Вероятность просрочки задачи берём из конфига сценария
    const hasTask = isNewLead ? false : Math.random() > 0.3
    const taskOverdue = hasTask && Math.random() < (scenarioConfig.overdueTasksPercentage / 100)

    const baseCommission = 500 + (index % 15) * 150
    const commissionUsd = this.calculateCommission(baseCommission, stageId, source)

    const lead: Lead = {
      id: `lead-${index + 1}`,
      name: this.getRandomName(),
      source,
      stageId,
      managerId,
      createdAt: createdAt.toISOString(),
      updatedAt,
      hasTask,
      taskOverdue,
      commissionUsd,
      channel: this.getRandomChannel(),
    }

    // Рекламным лидам проставляем ID кампании
    if (source === 'ad_campaigns') {
      lead.campaignId = AD_CAMPAIGN_IDS[index % AD_CAMPAIGN_IDS.length]
    }

    return lead
  }

  // Генерирует пул лидов по параметрам сценария.
  // Часть лидов (newLeadsPercentage) создаётся без менеджера для распределения.
  static async createLeadPool(options: CreateLeadsOptions = {}): Promise<Lead[]> {
    const { scenario = 'default', baseDate = new Date(), customCount } = options
    const scenarioConfig = getScenarioConfig(scenario as any)
    const totalLeads = customCount || scenarioConfig.leadCount

    await createMockDelay(200, 100)

    const leads: Lead[] = []
    const newLeadsCount = calculateFromPercentage(totalLeads, scenarioConfig.newLeadsPercentage)
    const regularLeadsCount = totalLeads - newLeadsCount

    for (let i = 0; i < regularLeadsCount; i++) {
      leads.push(this.createLead(i, baseDate, scenarioConfig, false))
    }

    for (let i = 0; i < newLeadsCount; i++) {
      leads.push(this.createLead(regularLeadsCount + i, baseDate, scenarioConfig, true))
    }

    return leads
  }

  // Генерирует лидов специально для сценария высокой конверсии.
  // Все лиды принудительно ставятся в успешную стадию с повышенной комиссией.
  static createHighConversionLeads(count: number = 50): Lead[] {
    const successStages = LEAD_STAGES
      .filter(s => LEAD_STAGE_COLUMN[s.id] === 'success' || s.id === 'deal')
      .map(s => s.id)

    const leads: Lead[] = []
    const baseDate = new Date()

    for (let i = 0; i < count; i++) {
      const lead = this.createLead(i, baseDate, { leadCount: count }, false)
      lead.stageId = successStages[i % successStages.length]
      lead.commissionUsd = this.calculateCommission(
        2000 + (i % 10) * 300,
        lead.stageId,
        lead.source
      )
      leads.push(lead)
    }

    return leads
  }

  // Генерирует лидов специально для сценария с просроченными задачами.
  // Все лиды получают taskOverdue=true.
  static createOverdueTasksLeads(count: number = 30): Lead[] {
    const leads: Lead[] = []
    const baseDate = new Date()

    for (let i = 0; i < count; i++) {
      const lead = this.createLead(i, baseDate, { leadCount: count }, false)
      lead.hasTask = true
      lead.taskOverdue = true
      leads.push(lead)
    }

    return leads
  }

  // Считает агрегированную статистику по массиву лидов
  static generateStats(leads: Lead[]) {
    const total = leads.length
    const newLeads = leads.filter(l => l.stageId === 'new' && !l.managerId).length
    const inProgress = leads.filter(l => LEAD_STAGE_COLUMN[l.stageId] === 'in_progress').length
    const success = leads.filter(l => LEAD_STAGE_COLUMN[l.stageId] === 'success').length
    const rejection = leads.filter(l => LEAD_STAGE_COLUMN[l.stageId] === 'rejection').length
    const overdue = leads.filter(l => l.taskOverdue).length
    const totalCommission = leads.reduce((sum, l) => sum + (l.commissionUsd || 0), 0)

    return {
      total,
      newLeads,
      inProgress,
      success,
      rejection,
      overdue,
      totalCommission,
      avgCommission: total > 0 ? Math.round(totalCommission / total) : 0,
      conversionRate: total > 0 ? (success / total) * 100 : 0,
    }
  }
}

import type {
  DistributionRule,
  Lead,
  LeadEvent,
  LeadManager,
  LeadPartnerByEmail,
  LeadStage,
  LeadStageId,
  PortalUser,
} from '@/types/leads'

/**
 * Полные стадии воронки продаж (из шаблона sales в analytics-network).
 * Сгруппированы по колонкам: rejection → in_progress → success.
 */
export const LEAD_STAGES: LeadStage[] = [
  // --- rejection ---
  { id: 'defective',   name: 'Бракованный лид',     order: 1 },
  { id: 'refused',     name: 'Отказ',               order: 2 },
  { id: 'no_answer_3', name: 'Недозвонился 3',      order: 3 },
  { id: 'no_answer_2', name: 'Недозвонился 2',      order: 4 },
  { id: 'no_answer_1', name: 'Недозвонился 1',      order: 5 },
  // --- in_progress ---
  { id: 'new',              name: 'Новый лид',                    order: 6 },
  { id: 'callback',         name: 'Связаться позже',              order: 7 },
  { id: 'presented',        name: 'Презентовали компанию',        order: 8 },
  { id: 'country_discussed', name: 'Ситуация в стране',          order: 9 },
  { id: 'need_identified',  name: 'Выявлена потребность',         order: 10 },
  { id: 'need_adjusted',    name: 'Потребность скорректирована',  order: 11 },
  { id: 'kp_sent',          name: 'Отправлено КП',                order: 12 },
  { id: 'objections',       name: 'Отработка возражений',         order: 13 },
  { id: 'deferred',         name: 'Отложенный спрос',             order: 14 },
  { id: 'warmup',           name: 'Прогрев',                      order: 15 },
  { id: 'showing',          name: 'Показ',                        order: 16 },
  { id: 'deposit',          name: 'Задаток получен',              order: 17 },
  { id: 'deal',             name: 'Заключен договор',             order: 18 },
  // --- success (Золотой фонд) ---
  { id: 'golden',     name: 'Золотой фонд',                          order: 19 },
  { id: 'check_in',   name: 'Узнал как дела',                        order: 20 },
  { id: 'referral',   name: 'Взять рекомендацию',                    order: 21 },
  { id: 'new_deals',  name: 'Выявление потребности о новых сделках', order: 22 },
]

export type FunnelColumnId = 'rejection' | 'in_progress' | 'success'

export const LEAD_STAGE_COLUMN: Record<string, FunnelColumnId> = {
  defective:          'rejection',
  refused:            'rejection',
  no_answer_3:        'rejection',
  no_answer_2:        'rejection',
  no_answer_1:        'rejection',
  new:                'in_progress',
  callback:           'in_progress',
  presented:          'in_progress',
  country_discussed:  'in_progress',
  need_identified:    'in_progress',
  need_adjusted:      'in_progress',
  kp_sent:            'in_progress',
  objections:         'in_progress',
  deferred:           'in_progress',
  warmup:             'in_progress',
  showing:            'in_progress',
  deposit:            'in_progress',
  deal:               'in_progress',
  golden:             'success',
  check_in:           'success',
  referral:           'success',
  new_deals:          'success',
}

export const LEAD_STAGE_ORDER: readonly LeadStageId[] =
  LEAD_STAGES.map((s) => s.id)

/** Пользователи портала с доступом к админке лидов (мок) */
export const PORTAL_USERS: PortalUser[] = [
  {
    id: 'user-director',
    email: 'director@portal.test',
    displayName: 'Иван Директоров',
    leadAdminRole: 'director',
  },
  {
    id: 'user-rop',
    email: 'rop@portal.test',
    displayName: 'Пётр Ропов',
    leadAdminRole: 'rop',
  },
]

export const CURRENT_PORTAL_USER_ID = 'user-director'

export const INITIAL_LEAD_MANAGERS: LeadManager[] = [
  { id: 'lm-1', login: 'manager.primary@test.com', name: 'Анна Первичкина', sourceTypes: ['primary'] },
  { id: 'lm-2', login: 'manager.secondary@test.com', name: 'Борис Вторичкин', sourceTypes: ['secondary'] },
  { id: 'lm-3', login: 'manager.rent@test.com', name: 'Виктор Арендов', sourceTypes: ['rent'] },
  { id: 'lm-4', login: 'manager.ads@test.com', name: 'Галина Рекламова', sourceTypes: ['ad_campaigns'] },
  { id: 'lm-5', login: 'manager.multi@test.com', name: 'Дмитрий Универсалов', sourceTypes: ['primary', 'secondary'] },
]

export const INITIAL_LEAD_PARTNERS: LeadPartnerByEmail[] = [
  { id: 'lp-1', email: 'partner1@lk.test', sourceType: 'primary', cityId: 'batumi' },
  { id: 'lp-2', email: 'partner2@lk.test', sourceType: 'secondary', cityId: 'batumi' },
]

export const DEFAULT_DISTRIBUTION_RULE: DistributionRule = {
  type: 'round_robin',
  params: {},
}

export const DEFAULT_MANUAL_DISTRIBUTOR_ID: string | null = 'lm-5'

const MOCK_NAMES = [
  'Иван Петров', 'Мария Сидорова', 'Алексей Козлов', 'Елена Новикова', 'Дмитрий Морозов',
  'Ольга Волкова', 'Сергей Соколов', 'Анна Лебедева', 'Николай Кузнецов', 'Татьяна Попова',
  'Андрей Васильев', 'Наталья Павлова', 'Михаил Семёнов', 'Екатерина Голубева', 'Владимир Виноградов',
  'Светлана Орлова', 'Артём Жуков', 'Ирина Белова', 'Роман Крылов', 'Юлия Комарова',
]

const AD_CAMPAIGN_IDS = ['ac1', 'ac2', 'ac3', 'ac4', 'ac5', 'ac6']

function createMockLeads(): Lead[] {
  const now = new Date()
  const leads: Lead[] = []
  const sources: Lead['source'][] = ['primary', 'secondary', 'rent', 'ad_campaigns']
  const allStageIds = LEAD_STAGES.map((s) => s.id)
  const managers = ['lm-1', 'lm-2', 'lm-3', 'lm-4', 'lm-5', null]
  const channels: NonNullable<Lead['channel']>[] = ['form', 'ad', 'partner', 'other']
  let adLeadIdx = 0

  for (let i = 0; i < 120; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - Math.floor(i * 56 / 120))
    d.setHours(i % 24)
    const source = sources[i % 4]
    const stageId = allStageIds[i % allStageIds.length]
    const managerId = managers[i % 6]
    const createdAt = d.toISOString()
    const updatedAt = i % 5 === 0 ? undefined : new Date(d.getTime() + 60 * 60 * 1000).toISOString()
    const rejectionNoTask =
      LEAD_STAGE_COLUMN[stageId] === 'rejection' &&
      stageId !== 'no_answer_1' &&
      stageId !== 'no_answer_2'
    const hasTask = rejectionNoTask ? false : i % 3 !== 0
    const taskOverdue = hasTask && i % 7 === 0

    const baseCommission =
      500 + (i % 15) * 150 + (source === 'rent' ? 300 : source === 'ad_campaigns' ? 200 : 0)
    const stageMultiplier =
      LEAD_STAGE_COLUMN[stageId] === 'success'
        ? 1.6
        : LEAD_STAGE_COLUMN[stageId] === 'in_progress'
          ? 1
          : 0.4
    const commissionUsd = Math.round(baseCommission * stageMultiplier)

    leads.push({
      id: `lead-${i + 1}`,
      name: `${MOCK_NAMES[i % MOCK_NAMES.length]}`,
      source,
      stageId,
      managerId,
      createdAt,
      updatedAt,
      hasTask,
      taskOverdue,
      commissionUsd,
      channel: channels[i % 4],
      ...(source === 'ad_campaigns' ? { campaignId: AD_CAMPAIGN_IDS[adLeadIdx++ % AD_CAMPAIGN_IDS.length] } : {}),
    })
  }

  // Добавляем дополнительный пул "Новый лид" без менеджера для ручного распределения.
  const extraDistributionDeckLeads = 14
  for (let j = 0; j < extraDistributionDeckLeads; j++) {
    const d = new Date(now)
    d.setMinutes(d.getMinutes() - j * 9)
    const source = sources[(j + 1) % 4]
    const createdAt = d.toISOString()

    leads.push({
      id: `lead-${leads.length + 1}`,
      name: `${MOCK_NAMES[(j + 5) % MOCK_NAMES.length]}`,
      source,
      stageId: 'new',
      managerId: null,
      createdAt,
      updatedAt: undefined,
      hasTask: false,
      taskOverdue: false,
      commissionUsd: 1800 + j * 650,
      channel: channels[(j + 2) % 4],
      ...(source === 'ad_campaigns' ? { campaignId: AD_CAMPAIGN_IDS[adLeadIdx++ % AD_CAMPAIGN_IDS.length] } : {}),
    })
  }

  return leads
}

export const INITIAL_LEAD_POOL: Lead[] = createMockLeads()

function createMockLeadHistory(leadId: string, status: "active" | "won" | "lost", stage: string, leadDate: string): LeadEvent[] {
  const events: LeadEvent[] = []
  const createdDate = new Date(leadDate)
  let currentStamp = createdDate.getTime()
  
  const addEvent = (evt: Omit<LeadEvent, "id" | "timestamp" | "authorId" | "authorName">, delayHours: number = Math.random() * 4 + 1, authorId = "lm-1", authorName = "Анна Первичкина") => {
    currentStamp += delayHours * 60 * 60 * 1000
    events.push({
      id: `evt-${leadId}-${events.length}`,
      timestamp: new Date(currentStamp).toISOString(),
      authorId,
      authorName,
      ...evt
    })
  }

  // 1. Создание
  addEvent({ type: "created", payload: { comment: "Лид создан через API ВКонтакте" } }, 0, "system", "Система")
  
  // 2. Назначение
  addEvent({ type: "assign", payload: { managerId: "lm-1", managerName: "Анна Первичкина", comment: "Назначен менеджер" } }, 0.5, "system", "Система")
  
  // 3. Первичная задача
  addEvent({ type: "task_created", payload: { taskName: "Связаться с клиентом (первичный контакт)", deadline: new Date(currentStamp + 24 * 3600 * 1000).toISOString() } }, 0.2)
  
  // Разные сценарии в зависимости от статуса и этапа
  if (status === "lost") {
    addEvent({ type: "call", payload: { duration: 15, comment: "Не берет трубку, автоответчик" } }, 2)
    addEvent({ type: "task_completed", payload: { taskName: "Связаться с клиентом (первичный контакт)" } }, 0.1)
    addEvent({ type: "task_created", payload: { taskName: "Повторный прозвон", deadline: new Date(currentStamp + 48 * 3600 * 1000).toISOString() } }, 0.1)
    
    // Просрочка
    currentStamp += 50 * 3600 * 1000 // Прошло 2 дня
    addEvent({ type: "overdue", payload: { comment: "Просрочена задача: Повторный прозвон" } }, 0, "system", "Система")
    
    addEvent({ type: "call", payload: { duration: 45, comment: "Дозвонился. Сказали, что уже купили через другое агентство." } }, 5)
    addEvent({ type: "task_completed", payload: { taskName: "Повторный прозвон" } }, 0.1)
    addEvent({ type: "comment", payload: { comment: "Отказ. Неактуально. Отправил в архив." } }, 0.5)
    addEvent({ type: "stage_change", payload: { fromStage: "new", toStage: "refused", toStageName: "Отказ" } }, 0.2)
  } else if (stage === "new") {
    // Только создан, еще не взяли в работу
  } else {
    // Успешный или в работе (продвинутые этапы)
    addEvent({ type: "call", payload: { duration: 320, comment: "Отлично пообщались. Ищет двушку на Пхукете, бюджет до 150к$. Отправляю варианты." } }, 3)
    addEvent({ type: "task_completed", payload: { taskName: "Связаться с клиентом (первичный контакт)" } }, 0.1)
    addEvent({ type: "stage_change", payload: { fromStage: "new", toStage: "need_identified", toStageName: "Выявлена потребность" } }, 0.5)
    
    addEvent({ type: "task_created", payload: { taskName: "Подготовить и отправить презентацию", deadline: new Date(currentStamp + 24 * 3600 * 1000).toISOString() } }, 0.5)
    
    if (stage !== "need_identified" && stage !== "presented" && stage !== "callback") {
      addEvent({ type: "task_completed", payload: { taskName: "Подготовить и отправить презентацию" } }, 12)
      addEvent({ type: "comment", payload: { comment: "Отправил подборку из 5 объектов в WhatsApp. Обещал посмотреть вечером." } }, 0.2)
      addEvent({ type: "stage_change", payload: { fromStage: "need_identified", toStage: "kp_sent", toStageName: "Отправлено КП" } }, 0.1)
      addEvent({ type: "task_created", payload: { taskName: "Получить обратную связь по объектам", deadline: new Date(currentStamp + 48 * 3600 * 1000).toISOString() } }, 0.2)
      
      const isAdvancedStage = stage === 'deposit' || stage === 'deal' || LEAD_STAGE_COLUMN[stage] === 'success'

      if (stage === 'showing' || isAdvancedStage) {
        addEvent({ type: "call", payload: { duration: 180, comment: "Объекты понравились, особенно вилла в Банг Тао. Договорились на зум-встречу завтра с застройщиком." } }, 24)
        addEvent({ type: "task_completed", payload: { taskName: "Получить обратную связь по объектам" } }, 0.1)
        addEvent({ type: "stage_change", payload: { fromStage: "kp_sent", toStage: "showing", toStageName: "Показ" } }, 0.5)
        
        if (isAdvancedStage) {
          addEvent({ type: "comment", payload: { comment: "Зум прошел отлично, клиент готов бронировать." } }, 48)
          addEvent({ type: "stage_change", payload: { fromStage: "showing", toStage: "deposit", toStageName: "Задаток получен" } }, 1)
          addEvent({ type: "buyer_registration", payload: { comment: "Клиент переведен в покупатели. Запрошен счет на оплату брони." } }, 2, "lm-1", "Анна Первичкина")
        }
      }
    }
  }

  // Возвращаем в обратном порядке (новые сверху)
  return events.reverse()
}

export const INITIAL_LEAD_HISTORY: Record<string, LeadEvent[]> = {}

INITIAL_LEAD_POOL.forEach(lead => {
    let status: "active" | "won" | "lost" = "active"
    if (LEAD_STAGE_COLUMN[lead.stageId] === "rejection") status = "lost"
    if (LEAD_STAGE_COLUMN[lead.stageId] === "success" || lead.stageId === 'deal') status = "won"
    
    INITIAL_LEAD_HISTORY[lead.id] = createMockLeadHistory(lead.id, status, lead.stageId, lead.createdAt)
})


export type EmployeeRole = 'owner' | 'director' | 'rop' | 'manager'

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  position: string
  managerId: string | null
  phone?: string
  email?: string
  hireDate?: string
  avatarUrl?: string
}

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  owner: 'Собственник',
  director: 'Директор',
  rop: 'РОП',
  manager: 'Менеджер',
}

export const ROLE_COLORS: Record<EmployeeRole, { bg: string; text: string; border: string }> = {
  owner:    { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
  director: { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200' },
  rop:      { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-200' },
  manager:  { bg: 'bg-emerald-100',text: 'text-emerald-800',border: 'border-emerald-200' },
}

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-owner',
    name: 'Артём Власов',
    role: 'owner',
    position: 'Собственник компании',
    managerId: null,
    phone: '+7 (999) 100-00-01',
    email: 'vlasov@estategroup.ru',
    hireDate: '2018-01-15',
  },
  {
    id: 'emp-director',
    name: 'Марина Петрова',
    role: 'director',
    position: 'Директор агентства',
    managerId: 'emp-owner',
    phone: '+7 (999) 100-00-02',
    email: 'petrova@estategroup.ru',
    hireDate: '2019-03-01',
  },
  {
    id: 'emp-rop-msk',
    name: 'Дмитрий Коваль',
    role: 'rop',
    position: 'РОП — Москва',
    managerId: 'emp-director',
    phone: '+7 (999) 200-00-01',
    email: 'koval@estategroup.ru',
    hireDate: '2020-06-10',
  },
  {
    id: 'emp-rop-spb',
    name: 'Сергей Литвинов',
    role: 'rop',
    position: 'РОП — Санкт-Петербург',
    managerId: 'emp-director',
    phone: '+7 (999) 200-00-02',
    email: 'litvinov@estategroup.ru',
    hireDate: '2021-02-15',
  },
  {
    id: 'emp-mgr-1',
    name: 'Анна Первичкина',
    role: 'manager',
    position: 'Менеджер по продажам',
    managerId: 'emp-rop-msk',
    phone: '+7 (999) 300-00-01',
    email: 'pervichkina@estategroup.ru',
    hireDate: '2021-09-01',
  },
  {
    id: 'emp-mgr-2',
    name: 'Игорь Смирнов',
    role: 'manager',
    position: 'Менеджер по продажам',
    managerId: 'emp-rop-msk',
    phone: '+7 (999) 300-00-02',
    email: 'smirnov@estategroup.ru',
    hireDate: '2022-01-10',
  },
  {
    id: 'emp-mgr-3',
    name: 'Екатерина Орлова',
    role: 'manager',
    position: 'Менеджер по аренде',
    managerId: 'emp-rop-msk',
    phone: '+7 (999) 300-00-03',
    email: 'orlova@estategroup.ru',
    hireDate: '2022-04-20',
  },
  {
    id: 'emp-mgr-4',
    name: 'Наталья Громова',
    role: 'manager',
    position: 'Менеджер по продажам',
    managerId: 'emp-rop-spb',
    phone: '+7 (999) 300-00-04',
    email: 'gromova@estategroup.ru',
    hireDate: '2021-11-01',
  },
  {
    id: 'emp-mgr-5',
    name: 'Павел Зайцев',
    role: 'manager',
    position: 'Менеджер по продажам',
    managerId: 'emp-rop-spb',
    phone: '+7 (999) 300-00-05',
    email: 'zaytsev@estategroup.ru',
    hireDate: '2022-07-15',
  },
  {
    id: 'emp-mgr-6',
    name: 'Ольга Белова',
    role: 'manager',
    position: 'Менеджер по вторичке',
    managerId: 'emp-rop-spb',
    phone: '+7 (999) 300-00-06',
    email: 'belova@estategroup.ru',
    hireDate: '2023-02-01',
  },
]

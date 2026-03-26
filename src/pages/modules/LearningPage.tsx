import ModuleHub from '@/components/ModuleHub'
import { BookOpen, FileText, GraduationCap, MessageSquare, Plus, Presentation } from 'lucide-react'

/** Плитки = бывшие вкладки LMS: каждая ведёт в базу знаний с нужной вкладкой. */
export default function LearningPage() {
  return (
    <ModuleHub
      moduleIcon={<GraduationCap size={32} color="#c9a84c" />}
      moduleName="Обучение"
      moduleDescription="База знаний по разделам: статьи, скрипты, презентации, PDF и курсы."
      backRoute="/dashboard"
      sections={[
        {
          icon: <BookOpen size={20} color="#c9a84c" />,
          title: 'Статьи',
          description: 'Регламенты, инструкции и разборы процессов.',
          route: '/dashboard/lms/browse?tab=articles',
        },
        {
          icon: <MessageSquare size={20} color="#c9a84c" />,
          title: 'Скрипты',
          description: 'Диалоги и сценарии разговоров с клиентом.',
          route: '/dashboard/lms/browse?tab=scripts',
        },
        {
          icon: <Presentation size={20} color="#c9a84c" />,
          title: 'Презентации',
          description: 'Материалы по слайдам внутри системы.',
          route: '/dashboard/lms/browse?tab=presentations',
        },
        {
          icon: <FileText size={20} color="#c9a84c" />,
          title: 'PDF',
          description: 'Документы для скачивания и просмотра.',
          route: '/dashboard/lms/browse?tab=pdfs',
        },
        {
          icon: <GraduationCap size={20} color="#c9a84c" />,
          title: 'Курсы',
          description: 'Программы с уроками и проверочными тестами.',
          route: '/dashboard/lms/browse?tab=courses',
        },
        {
          icon: <Plus size={20} color="#c9a84c" />,
          title: 'Добавить материал',
          description: 'Новая запись в базе знаний (для ролей с правом администрирования).',
          route: '/dashboard/lms/add',
        },
      ]}
    />
  )
}

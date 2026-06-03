'use client'

import { useState } from 'react'
import { Calendar, Clock, CalendarX, Settings } from 'lucide-react'
import { AvailabilityForm }    from './AvailabilityForm'
import { ServiceDurationsForm } from './ServiceDurationsForm'
import { BlockedDatesForm }    from './BlockedDatesForm'
import { SettingsForm }        from './SettingsForm'

const TABS = [
  { id: 'availability', label: 'Disponibilidade',    icon: Calendar   },
  { id: 'services',     label: 'Durações',           icon: Clock      },
  { id: 'blocked',      label: 'Datas bloqueadas',   icon: CalendarX  },
  { id: 'settings',     label: 'Configurações',      icon: Settings   },
]

export function AgendaTabs() {
  const [active, setActive] = useState('availability')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-blade-card border border-blade-border rounded-xl p-1 mb-8 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
                active === tab.id
                  ? 'bg-gold text-blade-bg'
                  : 'text-blade-muted hover:text-blade-text'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {active === 'availability' && <AvailabilityForm />}
      {active === 'services'     && <ServiceDurationsForm />}
      {active === 'blocked'      && <BlockedDatesForm />}
      {active === 'settings'     && <SettingsForm />}
    </div>
  )
}

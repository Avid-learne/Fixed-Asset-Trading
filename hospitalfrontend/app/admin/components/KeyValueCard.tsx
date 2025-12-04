'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KeyValuePair {
  key: string
  value: string | number
  highlight?: boolean
}

interface KeyValueCardProps {
  title?: string
  data: KeyValuePair[]
  columns?: 1 | 2 | 3
}

export function KeyValueCard({ title, data, columns = 2 }: KeyValueCardProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3'
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? '' : 'pt-6'}>
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-gray-500">{item.key}</p>
              <p className={`font-semibold ${item.highlight ? 'text-cyan-600' : 'text-gray-900'}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

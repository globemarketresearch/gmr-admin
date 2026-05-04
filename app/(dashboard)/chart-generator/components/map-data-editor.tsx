'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useChartGenerator } from '@/hooks/use-chart-generator';
import { MAP_CONSTRAINTS } from '@/lib/config/chart-generator';
import type { MapDataPoint, MapDataSource } from '@/lib/types/chart-generator';

export function MapDataEditor() {
  const { dataSource, updateDataSource } = useChartGenerator();

  // Type guard to ensure we're working with MapDataSource
  const mapData = 'data' in dataSource ? (dataSource as MapDataSource) : null;

  if (!mapData) return null;

  const canAddCountry = mapData.data.length < MAP_CONSTRAINTS.MAX_COUNTRIES;
  const canRemoveCountry = mapData.data.length > MAP_CONSTRAINTS.MIN_COUNTRIES;

  const addCountry = () => {
    if (!canAddCountry) return;

    const newPoint: MapDataPoint = {
      countryCode: '',
      countryName: '',
      value: 0,
    };

    updateDataSource({
      ...mapData,
      data: [...mapData.data, newPoint],
    });
  };

  const removeCountry = (index: number) => {
    if (!canRemoveCountry) return;

    updateDataSource({
      ...mapData,
      data: mapData.data.filter((_, i) => i !== index),
    });
  };

  const updateCountryField = (index: number, field: keyof MapDataPoint, value: string | number) => {
    const newData = [...mapData.data];
    newData[index] = { ...newData[index], [field]: value };

    updateDataSource({
      ...mapData,
      data: newData,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Country Data</h3>
          <p className="text-sm text-muted-foreground">
            {mapData.data.length} / {MAP_CONSTRAINTS.MAX_COUNTRIES} countries
          </p>
        </div>
        <Button onClick={addCountry} disabled={!canAddCountry} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Country
        </Button>
      </div>

      <div className="border rounded-md overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Country Code</TableHead>
              <TableHead className="min-w-[180px]">Country Name</TableHead>
              <TableHead className="min-w-[120px]">Value</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mapData.data.map((point, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={point.countryCode}
                    onChange={e =>
                      updateCountryField(index, 'countryCode', e.target.value.toUpperCase())
                    }
                    placeholder="USA"
                    maxLength={3}
                    className="h-9 font-mono uppercase"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={point.countryName}
                    onChange={e => updateCountryField(index, 'countryName', e.target.value)}
                    placeholder="United States"
                    maxLength={MAP_CONSTRAINTS.COUNTRY_NAME_MAX_LENGTH}
                    className="h-9"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={point.value}
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        updateCountryField(index, 'value', value);
                      }
                    }}
                    className="h-9"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCountry(index)}
                    disabled={!canRemoveCountry}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Country Code: Use 3-letter ISO code (e.g., USA, CHN, GBR)</p>
        <p>
          • Country Name: Must match ECharts world map naming (e.g., &quot;United States&quot;,
          &quot;China&quot;)
        </p>
      </div>

      {!canAddCountry && (
        <p className="text-sm text-muted-foreground">
          Maximum country limit reached ({MAP_CONSTRAINTS.MAX_COUNTRIES} countries)
        </p>
      )}
    </div>
  );
}
